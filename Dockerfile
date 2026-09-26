# syntax=docker/dockerfile:1

FROM node:22.12.0-alpine AS base
RUN npm install -g pnpm@9.15.4
RUN apk add --no-cache libc6-compat

# ---- deps ----
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --no-frozen-lockfile

# ---- builder ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env (needed because `next build` fetches Payload data for static pages)
ARG DATABASE_URI
ARG PAYLOAD_SECRET
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_IS_LIVE
ARG NEXT_PRIVATE_DRAFT_SECRET
ARG NEXT_PRIVATE_REVALIDATION_KEY
ENV DATABASE_URI=$DATABASE_URI \
    PAYLOAD_SECRET=$PAYLOAD_SECRET \
    NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL:-https://kotacom.id} \
    NEXT_PUBLIC_IS_LIVE=$NEXT_PUBLIC_IS_LIVE \
    NEXT_PRIVATE_DRAFT_SECRET=$NEXT_PRIVATE_DRAFT_SECRET \
    NEXT_PRIVATE_REVALIDATION_KEY=$NEXT_PRIVATE_REVALIDATION_KEY \
    NEXT_TELEMETRY_DISABLED=1

# build:skipDocs = next build --webpack (skips generate:llms which needs GitHub token)
RUN pnpm run build:skipDocs

# ---- runner ----
FROM node:22.12.0-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 NEXT_TELEMETRY_DISABLED=1
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Payload writes user uploads into MEDIA_DIR (default: ./media, i.e. /app/media).
# The runner runs as `nextjs`, so the directory must exist and be owned by it —
# otherwise `EACCES: permission denied, mkdir 'media'` on every upload.
RUN mkdir -p /app/media && chown nextjs:nodejs /app/media

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
