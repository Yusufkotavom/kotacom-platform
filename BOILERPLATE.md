# Kotacom — Boilerplate Foundation

> **Project type: AI / tech-stack.** Baca **[`PROJECT.md`](./PROJECT.md)** dulu — itu dossier
> teknis utama. Dokumen ini memetakan fondasi spesifik untuk lingkup situs (migrasi konten
> `kotacom.id` → 301, programmatic content).

Status: **boilerplate** (bukan migrasi resmi). Konten masih placement/dummy.
Tujuan dokumen ini: peta fondasi yang sudah siap, supaya sesi/pekerjaan berikutnya
(migrasi `kotacom.id` → 301, programmatic content) tinggal menumpang.

Repo: `Yusufkotavom/website` (fork `payloadcms/website`, MIT). Live: `https://payload.kotacom.id`.
Desain: baca **`DESIGN.md`** dulu sebelum menyentuh UI (grid hairline, radius 0, mono, AMOLED #000).

---

## 1. Arsitektur singkat
- **Payload CMS self-hosted** (Next.js App Router) + MongoDB, satu VPS.
- Render **`force-dynamic`** + ISR di lapisan data (`unstable_cache`, revalidate 300).
  Build **tidak** butuh DB (builder Dokploy di luar `dokploy-network`).
- Header/footer/nav = **globals CMS** (bukan komponen hardcode).
- Home = komponen custom (`KotacomHome`); halaman lain CMS-driven (blocks).

## 2. Globals (CMS → konten)
| Slug | Isi |
|---|---|
| `site-settings` | Identitas bisnis, **satu sumber nomor WhatsApp**, alamat, sosial, geo, jam buka |
| `whatsapp-marketing` | Template pesan per konteks, toggle floating/sticky, UTM, tracking |
| `topBar` / `main-menu` / `footer` | Navigasi & bar atas |

**Aturan:** nomor WhatsApp HANYA di `site-settings.whatsappNumber`. Jangan hardcode di mana pun.
Nomor lama ada 2 (6285799520350, 6281335275219 di kotacom.id) → diseragamkan ke satu.

## 3. WhatsApp Marketing (all-in-one)
- Util: `src/utilities/whatsapp.ts` → `buildWaHref(settings, context, {pageUrl,pageTitle,business})`.
  Setiap pesan = template konteks + `Topik:` + `Sumber:` (URL halaman + UTM). **Wajib bawa URL sumber.**
- Komponen: `src/components/WhatsAppCTA` (varian `floating | sticky | inline | button | hero | link`).
- Launcher global: `src/components/WhatsAppLauncher` (floating FAB + sticky bar mobile) — dipasang di `(pages)/layout.tsx`.
- Block inline: `whatsappCta` (terdaftar di `pages` + `reusable-content`) → tempel CTA di mana saja.
- Konteks: `general|home|service|product|case-study|post|pricing|contact|floating`.
- Provider: `src/providers/WhatsApp` menyuntik settings ke block tanpa prop-drilling.
- Track klik → `whatsapp_click` (GA4/GTM) + payload `wa_context`.

## 4. SEO foundation
- `sitemap.xml` (dari CMS: pages/posts/products/case-studies), `rss.xml` (`/posts`), `manifest.webmanifest`.
- `robots.txt` = **route handler** (`src/app/(frontend)/robots.txt/route.ts`) — sengaja bukan file statis,
  supaya catch-all `[...slug]` tidak menelannya. `NEXT_PUBLIC_IS_LIVE=true` → allow; selain itu disallow.
- `generateMetadata` per rute: **canonical** + OG/Twitter. Metadata dasar di root layout (`metadataBase`, `lang=id`).
- **JSON-LD** (`src/seo/schema.ts` + `<JsonLd/>`): Organization, WebSite, LocalBusiness (global) +
  Article (post), Product (produk), BreadcrumbList (page/post/produk/case-study), dll.
- OG image generator `/api/og` sudah di-brand Kotacom.

## 5. Env
Salin `.env.example` → `.env` (lokal) / set di Dokploy (produksi). **Kritis:**
- `NEXT_PUBLIC_SITE_URL` (canonical/OG/WA source URL) — WAJIB, tanpa trailing slash.
- `NEXT_PRIVATE_DRAFT_SECRET` + `NEXT_PRIVATE_REVALIDATION_KEY` — dua-duanya **wajib** dan
  harus sama antara Next & Payload. Kalau kosong → **preview live & revalidate on-demand mati**
  (inilah yang dulu bocor: `src/utilities/revalidate.ts` pakai nama env legacy `REVALIDATION_KEY`/
  `PAYLOAD_PUBLIC_APP_URL`). Generate: `openssl rand -hex 32`.
- `NEXT_PUBLIC_IS_LIVE=true` di produksi.
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` — widget reCAPTCHA hanya dirender bila terisi (kosong = aman, tanpa crash).

## 6. Seeding
- Script lokal (git-ignored): `src/scripts/seed.ts`. Untuk konten kaya (tentang/kontak) + globals ada
  seeder REST idempoten (jalankan ke dev & prod dengan token admin). Halaman di-seed `_status: published`
  (kalau draft → tidak tampil di situs publik).
- **Media mapping**: halaman baru memakai **media yang sudah ada** (ambil id dari `sample-blocks` tiap
  environment) — aman lintas dev/prod, hindari id lintas env.

## 7. Menjalankan lokal
```
pnpm dev                # dev di :3001 kalau :3000 kepakai
pnpm generate:types     # regen payload-types.ts setelah ubah collections/globals/blocks
npx tsc --noEmit        # WAJIB sebelum deploy (build produksi type-checks; dev tidak)
```

## 8. Yang BELUM (arah berikutnya)
- **Migrasi konten + peta 301** dari `kotacom.id` (≈986 URL, banyak tipis/duplikat) → situs baru.
- **Programmatic SEO benar**: collection `Locations` + template `{layanan}×{kota}` unik + JSON-LD
  `Service`/`FAQPage`, bukan 399 halaman kabupaten yang polanya sama.
- Model data tambahan: `Testimonials`, `FAQs`, `Authors` (E-E-A-T).
- Home: tetap custom vs dikonversi jadi blocks (keputusan terbuka).
- Keamanan: rate-limit/2FA login admin; purge commit bocor di GitHub.
