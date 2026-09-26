# Kotacom AI Content Platform

Self-hosted **content + SEO platform** built on **Payload CMS 3 + Next.js 16**, with a
purpose-built **AI content generator** and an **MCP server** so AI agents can operate the
whole CMS. Runs entirely on a single Oracle VPS (Dokploy / Docker Swarm + MongoDB) —
**no Vercel or third-party cloud**.

> **Positioning:** this is an **AI / tech-stack project**. The content domain is a printing
> + IT business, but the engineering focus is *agentic content generation*, *self-hosted
> CMS infrastructure*, and *programmatic SEO at scale*.

Fork of [`payloadcms/website`](https://github.com/payloadcms/website) (MIT) → front-end
rebuilt in **`Yusufkotavom/kotacom-platform`** (this repo). Live: `https://payload.kotacom.id`.
Full dossier: **[`PROJECT.md`](./PROJECT.md)**.

---

## 🎨 Front-end — "Bauhaus Color Block"

The presentation layer is a **greenfield Next.js + Tailwind v4** build on top of the
unchanged Payload backend. Design language is locked: off-white `#F0F0F0` canvas, stark
black `#121212`, primary **red `#D02020` / blue `#1040C0` / yellow `#F0C020`**, thick
2/4px black borders, **hard offset shadows** (4/6/8px, no blur), radius 0, **Outfit**
display type, geometric motifs (circle / square / triangle / diamond).

- Tokens: `src/app/(frontend)/globals.css` (`@theme`, `--color-nb-*`, `--shadow-nb-*`).
- Primitives: `src/components/nb/*` (Button, Card, Section, Pill, Shape, Accordion,
  Header, Footer) + block renderer `src/components/nb/blocks/index.tsx`.
- Detail templates: `src/components/nb/{Post,Product,CaseStudy}.tsx`.
- Legacy Payload block SCSS is progressively retired; the new renderer covers the
  frequent block types with a smart generic fallback.

---

## ✨ Highlights

- 🤖 **AI content generator** (`src/generator/*`) — turns a *program* (topic × city × …)
  into structured Payload **pages & posts**: plan → draft → block materialisation, with QA,
  slug building, dedupe, and overwrite-aware runs. Powered by a local OpenAI-compatible
  gateway (reasoning model `pro-coding`).
- 🧩 **32 Payload blocks**, incl. an `AiContent` renderer and a `WhatsAppCTA` (lead-gen).
- 🔌 **MCP server** — `@payloadcms/plugin-mcp` exposes the CMS at `/api/mcp`, so agents can
  CRUD content without the admin UI.
- 🔎 **SEO foundation** — dynamic `sitemap.ts`, per-route `generateMetadata` + canonical
  URLs, JSON-LD (Organization / WebSite / LocalBusiness / Article / Product / FAQ /
  BreadcrumbList), flat post URLs with category 308-redirects, and an RSS feed.
- 🏗 **Self-hosted infra** — Dokploy (Swarm) + Traefik + MongoDB 7, persistent media
  volume, nightly backups. `DATABASE_URI` is only needed at *runtime* (force-dynamic pages).
- 🎨 **Design system** — SCSS modules + CSS custom properties; a hairline/minimal base
  warmed by a brand-accent layer. Contract in **[`DESIGN.md`](./DESIGN.md)**.

## 🧱 Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js **16.3.3** (App Router), React **19.2.3** |
| CMS | **Payload 3.88** (self-hosted, in the same app) |
| Database | **MongoDB 7** (`@payloadcms/db-mongodb`) |
| Language | TypeScript, `tsx` |
| Styling | **SCSS Modules** + CSS custom properties (`src/css/*.scss`) |
| AI | Local OpenAI-compatible gateway (9router), model **`pro-coding`**, `stream:false`, `max_tokens: 8192` |
| Agent surface | `@payloadcms/plugin-mcp` (`/api/mcp`) |
| Deploy | Docker Swarm (**Dokploy**) + **Traefik**, Oracle Cloud VPS |
| Tests | `node:test` via `tsx` (`npm test`) |

## 🗂 Project map

```
src/
  generator/      AI engine: ai, plan, enrich, render, run, qa, select, slug,
                  tokens, dedupe, lexical, blocks, types  (+ __tests__)
  collections/    Pages, Posts, Products, CaseStudies, Categories, Media, Users,
                  ReusableContent + Generator{Templates,Datasets,Programs,Runs}
  blocks/         32 content blocks (AiContent, WhatsAppCTA, Pricing, Steps, …)
  app/(frontend)/  public site: (pages)/[…slug], posts, produk, case-studies,
                   api/generator/run, api/og, sitemap, robots, rss
  app/(payload)/   Payload admin (/admin) + MCP (/api/mcp)
  components/      KotacomHome, Header, Footer, Button, cards, Hero, …
  css/             design tokens: grid, type, colors, theme, brand
scripts/          generator-{run.mjs,seed.ts,recon.ts,ai-probe.ts}
```

## 🚀 Getting started

```bash
pnpm i
cp .env.example .env          # fill values
pnpm dev                      # dev server — port 3001 on this box, never :3000
```

Useful scripts:

```bash
pnpm dev            # next dev --webpack
pnpm build          # production build (no DB needed at build time)
pnpm start          # serve the build
pnpm test           # node:test suite
pnpm generate:types # regenerate Payload types after schema changes
pnpm generator:run  # run an AI generator program from the CLI
```

> **Port:** the dev server must stay on **:3001** — host `:3000` is owned by the Dokploy
> dashboard (a collision crash-loops the Swarm service and takes every site down).

## 🤖 AI generator — quick start

`POST /api/generator/run` (admin cookie or `Authorization: Bearer …`):

```jsonc
{ "programId": "<id>", "mode": "generate" }   // mode: dry | generate | off
```

The generator resolves a **program** (template + dataset + route base), builds tokens per
row (e.g. `{layanan}` × `{lokasi}`), asks the model for a plan + enriched blocks, and writes
`pages` / `posts` with a lineage field. Adding content is **AI-operable end-to-end**: create
template/dataset/program via the REST API, then call this endpoint — no admin UI required.

See `src/generator/ai.ts` for the model contract (reasoning-model quirks: generous
`max_tokens`, keep only `content`, handle SSE).

## 🔑 Environment (names only — values are never committed)

| Var | Purpose |
|---|---|
| `DATABASE_URI` | MongoDB connection (runtime) |
| `PAYLOAD_SECRET` | Payload auth secret |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin (inlined at **build** as an ARG) |
| `GENERATOR_SECRET` | Shared secret for the generator endpoint |
| `AI_BASE_URL` / `AI_MODEL` / `AI_API_KEY` / `AI_MAX_TOKENS` | AI gateway |

## 📚 Docs

| Doc | What |
|---|---|
| **[`PROJECT.md`](./PROJECT.md)** | Full project dossier (architecture, AI engine, SEO, ops) |
| [`DESIGN.md`](./DESIGN.md) | UI/design contract (grid, color, radius, type) |
| [`INFRA.md`](./INFRA.md) | Production infrastructure & runbooks (self-hosted) |
| [`BOILERPLATE.md`](./BOILERPLATE.md) | Foundation map for the original site scope |

## 📄 License

Fork of the Payload website, available as open source under the terms of the
[MIT license](https://github.com/payloadcms/website/blob/main/LICENSE). This fork's own
work (AI generator, SEO layer, self-hosted infra) is © Kotacom.

---

Built by **Kotacom** · `Yusuf Bahtiyar <yusuf@kotacom.id>`.
