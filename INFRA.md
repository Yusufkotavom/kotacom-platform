# Kotacom Payload — infrastruktur produksi (self-hosted, Oracle VPS)

Semua berjalan di VPS ini. **Tidak ada dependensi Vercel / cloud pihak ketiga.**
Ganti `XXX` dengan kredensial dari Dokploy env (atau password manager lo).

## Ringkasan

| Bagian | Nama | Catatan |
|---|---|---|
| Web | swarm service `app-back-up-virtual-bandwidth-m5e772` | image `yusufkotavom/payload-website:latest`, port 3000 |
| DB | container `payload-mongo` (`mongo:7`) | `dokploy-network`, IP `10.0.1.150`, **tanpa port publik** |
| Volume DB | `payload-mongo-data` → `/data/db` | 347 MB |
| Volume media | `payload-media-data` → `/app/media` | upload user; terdaftar di Dokploy (mount `DfjhXTM9JKI1_Yyb-zhCk`) |
| Proxy | Traefik (Dokploy) | `payload.kotacom.id` → `http://app-back-up-virtual-bandwidth-m5e772:3000`, Let's Encrypt |
| Backup | `kotacom-backup.timer` | harian 03:30, retensi 14 hari, ke `/home/ubuntu/backups/kotacom` |

## Re-create database (kalau container `payload-mongo` hilang)

Data **aman** selama volume `payload-mongo-data` masih ada. Container-nya saja yang perlu dibuat ulang:

```bash
sudo docker run -d --name payload-mongo \
  --network dokploy-network \
  --restart unless-stopped \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD='<ROOT_PW dari Dokploy/log>' \
  -v payload-mongo-data:/data/db \
  -v payload-mongo-configdb:/data/configdb \
  mongo:7

# beri waktu mongo siap
sleep 20
sudo docker exec payload-mongo mongosh --quiet -u root -p '<ROOT_PW>' \
  --authenticationDatabase admin --eval 'db.getSiblingDB("payload-website").getCollectionNames()'
```

Catatan penting:
- **JANGAN** tambahkan `-p 27017:27017`. Port publik tanpa auth = target ransomware
  MongoLock (pernah kena di project ini, data seed hilang).
- Password root tersimpan di env container `payload-mongo` (`MONGO_INITDB_ROOT_PASSWORD`).
- User aplikasi: `payload` / password di env Dokploy (`DATABASE_URI`), authSource
  `payload-website`.

## Restore dari backup

```bash
# 1. dump mongo terbaru
D=$(ls -t /home/ubuntu/backups/kotacom/db/*.archive.gz | head -1)
ROOT_PW=$(sudo docker exec payload-mongo sh -c 'echo $MONGO_INITDB_ROOT_PASSWORD')

sudo docker run --rm --network dokploy-network -v "$(dirname $D):/dump" mongo:7 \
  sh -c "mongorestore --archive=/dump/$(basename $D) --gzip --drop \
         --nsFrom='payload-website.*' --nsTo='payload-website.*' \
         --host payload-mongo --username root --password '$ROOT_PW' \
         --authenticationDatabase admin"

# 2. media
sudo tar xzf $(ls -t /home/ubuntu/backups/kotacom/media/*.tar.gz | head -1) \
  -C /var/lib/docker/volumes/payload-media-data --strip-components=0

# 3. restart app
sudo docker service update --force app-back-up-virtual-bandwidth-m5e772
```

## Redeploy

Repo ini **public** dan app-nya di-set `sourceType=git` (branch `main`), jadi Dokploy
clone + build sendiri — tombol Deploy di UI sudah cukup dan **sudah diuji berhasil**
(2026-09-14, build dari Dokploy selesai ~6 menit, service 1/1, mount media utuh).

Build **tidak lagi butuh DB**. Dulu gagal karena:

- Halaman dirender **on-demand** (`force-dynamic`), bukan prerender saat build.
- `src/utilities/buildSafe.ts` membuat loader DB gagal-aman **hanya saat build**;
  error saat runtime tetap dilempar (tidak diam-diam menyajikan halaman kosong).

### Jalur A — Dokploy UI (dianjurkan)

Tombol **Deploy** di Dokploy. Builder akan clone repo, jalankan `pnpm build:skipDocs`,
dan push image. Kalau builder tidak bisa menjangkau DB, build tetap sukses berkat
`buildSafe` dan halaman di-render saat request.

### ### Jalur B — build lokal di VPS (fallback)

```bash
cd /home/ubuntu/projects/payloadcms-website
bash deploy.sh          # proxy + build + service update + verify, semua otomatis
```

Skrip itu sudah menangani proxy socat sendiri. Isi manualnya, kalau perlu:
```bash
sudo docker rm -f mongo-build-proxy 2>/dev/null
sudo docker run -d --name mongo-build-proxy --network dokploy-network \
  -p 127.0.0.1:27018:27018 alpine/socat \
  tcp-listen:27018,fork,reuseaddr tcp-connect:payload-mongo:27017

cd /home/ubuntu/projects/payloadcms-website
SECRET=$(sudo docker service inspect app-back-up-virtual-bandwidth-m5e772 \
  --format '{{range .Spec.TaskTemplate.ContainerSpec.Env}}{{println .}}{{end}}' \
  | grep '^PAYLOAD_SECRET=' | cut -d= -f2-)

sudo docker build --network host \
  --build-arg DATABASE_URI='mongodb://payload:XXX@127.0.0.1:27018/payload-website?authSource=payload-website' \
  --build-arg PAYLOAD_SECRET="$SECRET" \
  --build-arg NEXT_PUBLIC_SITE_URL='https://payload.kotacom.id' \
  --build-arg NEXT_PUBLIC_IS_LIVE='true' \
  -t yusufkotavom/payload-website:latest .

sudo docker service update --image yusufkotavom/payload-website:latest --force \
  app-back-up-virtual-bandwidth-m5e772
sudo docker rm -f mongo-build-proxy
```

## Verifikasi setelah redeploy

```bash
curl -s -o /dev/null -w 'home  %{http_code}\n' https://payload.kotacom.id/
curl -s -o /dev/null -w 'admin %{http_code}\n' https://payload.kotacom.id/admin

# mount media masih terpasang?
sudo docker service inspect app-back-up-virtual-bandwidth-m5e772 \
  --format '{{json .Spec.TaskTemplate.ContainerSpec.Mounts}}'

# media masih bisa ditulis?
CID=$(sudo docker ps --filter name=app-back-up-virtual-bandwidth --format '{{.ID}}' | head -1)
sudo docker exec "$CID" sh -c 'touch /app/media/.w && echo WRITABLE && rm -f /app/media/.w'
```
