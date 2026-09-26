#!/bin/bash
# Fallback deploy: build the image on this VPS and push it to the swarm service.
#
# Normally you do NOT need this — Dokploy builds from the public repo and the build
# no longer requires the database (see INFRA.md). Use this only when the Dokploy
# builder is unavailable or you need to ship a local working tree.
#
# Requires: sudo docker. Run from the repo root.
set -euo pipefail

cd "$(dirname "$0")"
SVC=app-back-up-virtual-bandwidth-m5e772
APP_ID="-IFygWMvB0sfyjbQyDGHi"
SITE_URL='https://payload.kotacom.id'
MEDIA_VOLUME=payload-media-data

echo "=== 0. read the live secret (never hardcode) ==="
SECRET=$(sudo docker service inspect "$SVC" \
  --format '{{range .Spec.TaskTemplate.ContainerSpec.Env}}{{println .}}{{end}}' \
  | grep '^PAYLOAD_SECRET=' | cut -d= -f2-)
[ -z "$SECRET" ] && { echo "FATAL: PAYLOAD_SECRET not found on the service"; exit 1; }
echo "    secret length: ${#SECRET}"

DB_USER=payload
DB_PASS=$(sudo docker exec "$(sudo docker ps --format '{{.Names}}' | grep '^dokploy-postgres' | head -1)" \
  psql -U dokploy -d dokploy -t -A -c \
  "SELECT substring(env from '://[^:]+:([^@]+)@') FROM application WHERE \"applicationId\"='$APP_ID';" | tr -d ' ')
[ -z "$DB_PASS" ] && { echo "FATAL: could not read the DB password from Dokploy"; exit 1; }

echo "=== 1. socat proxy so the builder can reach payload-mongo ==="
# The build still connects to Mongo for anything not wrapped in buildSafe; the proxy
# joins dokploy-network (where payload-mongo lives) and exposes it on host loopback.
sudo docker rm -f mongo-build-proxy >/dev/null 2>&1 || true
sudo docker run -d --name mongo-build-proxy --network dokploy-network \
  -p 127.0.0.1:27018:27018 alpine/socat \
  tcp-listen:27018,fork,reuseaddr tcp-connect:payload-mongo:27017 >/dev/null
sleep 4
if ! timeout 5 bash -c 'cat < /dev/null > /dev/tcp/127.0.0.1/27018' 2>/dev/null; then
  echo "FATAL: proxy not reachable"; sudo docker rm -f mongo-build-proxy >/dev/null 2>&1; exit 1
fi
echo "    proxy OK"

cleanup() { sudo docker rm -f mongo-build-proxy >/dev/null 2>&1 || true; }
trap cleanup EXIT

echo "=== 2. build ==="
sudo docker build --network host \
  --build-arg DATABASE_URI="mongodb://${DB_USER}:${DB_PASS}@127.0.0.1:27018/payload-website?authSource=payload-website" \
  --build-arg PAYLOAD_SECRET="$SECRET" \
  --build-arg NEXT_PUBLIC_SITE_URL="$SITE_URL" \
  --build-arg NEXT_PUBLIC_IS_LIVE=true \
  -t yusufkotavom/payload-website:latest .

echo "=== 3. deploy (keeps the media volume) ==="
sudo docker service update \
  --image yusufkotavom/payload-website:latest \
  --mount-add type=volume,source="$MEDIA_VOLUME",target=/app/media \
  --force "$SVC" >/dev/null

echo "=== 4. converge ==="
for i in $(seq 1 30); do
  sleep 10
  R=$(sudo docker service ls --filter name="$SVC" --format '{{.Replicas}}')
  echo "    [$i] $R"
  [ "$R" = "1/1" ] && break
done

echo "=== 5. verify ==="
curl -s -o /dev/null -w "    home  HTTP %{http_code}\n" --max-time 60 "$SITE_URL/"
curl -s -o /dev/null -w "    admin HTTP %{http_code}\n" --max-time 60 "$SITE_URL/admin"
CID=$(sudo docker ps --filter name="$SVC" --format '{{.ID}}' | head -1)
sudo docker exec "$CID" sh -c 'touch /app/media/.w && echo "    media WRITABLE" && rm -f /app/media/.w'
echo "    done"
