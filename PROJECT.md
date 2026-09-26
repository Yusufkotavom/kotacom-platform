# PROJECT.md — Kotacom AI Content Platform

> **Project type: AI / tech-stack.** A self-hosted, agent-operable content & SEO platform.
> The business domain is printing + IT (Kotacom, Surabaya), but the *engineering* subject
> is **agentic content generation**, **self-hosted CMS infrastructure**, and **programmatic
> SEO**. This document is the single technical dossier for the project.

- **Repo:** `Yusufkotavom/website` (fork of `payloadcms/website`, MIT) — public
- **Production:** `https://payload.kotacom.id` (self-hosted, no Vercel)
- **Runtime:** Oracle Cloud VPS · Docker Swarm (Dokploy) + Traefik + MongoDB 7
- **Status:** generator live for pages & posts; SEO foundation complete; design system
  warmed. Migration of the legacy domain (`kotacom.id`, Next + Sanity) is the open workstream.

---

## 1. What this is

One Next.js 16 app that contains **both** the Payload CMS admin **and** the public site, plus
a bespoke **AI generator** and an **MCP server**. It is designed so that **an AI agent can
create, update, and publish content end-to-end without the admin UI** — the admin panel is a
convenience, not a requirement.

Two ideas drive the architecture:

1. **Content is data, generation is code.** A *program* (topic × location × template)
   describes a family of pages. The generator turns each row into a real Payload document.
2. **Everything is agent-reachable.** Payload's REST API + `plugin-mcp` + a shared-secret
   generator endpoint mean an agent needs no screen.

---

## 2. Architecture

```
┌─────────────────────── Oracle VPS (single host) ───────────────────────┐
│  Traefik (Dokploy) ──► app-back-up-virtual-bandwidth-m5e772 (Swarm)    │
│                          │  Next.js + Payload (port 3000)              │
│                          ├── /admin            Payload admin UI        │
│                          ├── /api/*            Payload REST            │
│                          ├── /api/mcp          MCP server (agents)     │
│                          ├── /api/generator/run AI generator endpoint  │
│                          └── /                public site (SSR)        │
│  payload-mongo (MongoDB 7)  docker_gwbridge │                            │
│  AI gateway (9router :20128) ◄──────────────┘ (via 172.18.0.1)         │
└────────────────────────────────────────────────────────────────────────┘
```

- **Single app, two routers:** `src/app/(frontend)` (public) and `src/app/(payload)`
  (admin + API + MCP).
- **All pages are dynamic** (`force-dynamic`): content is rendered per request, so **the
  production build does not need a database connection** and edits appear instantly without
  a rebuild. Measured render: home ≈ 0.14 s, post ≈ 0.11 s (local Mongo + caching).
- **MongoDB is never publicly exposed** — reachable only on the internal Docker network.

---

## 3. The AI content generator (`src/generator/*`)

The core of the project. A pipeline that materialises Payload documents from a *program*.

### Conceptual model

- **Template** (`GeneratorTemplates`) — the shape/prompt skeleton for a content family.
- **Dataset** (`GeneratorDatasets`) — the rows (e.g. cities, services).
- **Program** (`GeneratorPrograms`) — binds template + dataset + route base + relation
  fields → the thing you actually *run*.
- **Run** (`GeneratorRuns`) — an audit record of a generation pass.

### Pipeline modules

| Module | Responsibility |
|---|---|
| `ai.ts` | OpenAI-compatible client to the local gateway; reasoning-model handling |
| `plan.ts` | Ask the model for a structured **plan** (outline, headings, intent) |
| `enrich.ts` | Expand plan → high-quality block content per section |
| `render.ts` | Assemble blocks into Payload documents |
| `blocks.ts` | Map generated sections → Payload block types (`AiContent`, …) |
| `tokens.ts` | Derive semantic + custom tokens (`{layanan}`, `{lokasi}`, …) |
| `slug.ts` | Build slugs from `routeBase` + tokens (nested-safe) |
| `select.ts` | Choose rows/dedup keys |
| `dedupe.ts` | Prevent duplicate documents across runs |
| `qa.ts` | Quality gate: title/meta lengths, emptiness, severity (`ready`/`warning`) |
| `lexical.ts` | Convert markdown-ish text → Payload Lexical rich text |
| `run.ts` | Orchestrator: resolve program → plan → enrich → render → write |

### Entry points

- **HTTP:** `POST /api/generator/run` — body `{ programId, mode?: 'dry'|'generate'|'off',
  maxRows?, secret? }`. Auth: admin cookie **or** `Authorization: Bearer` **or** the
  `GENERATOR_SECRET`. Returns a per-row report + totals.
- **CLI:** `scripts/generator-run.mjs` (`pnpm generator:run`).
- **Helpers:** `generator-seed.ts`, `generator-recon.ts`, `generator-ai-probe.ts`.

### Write model

Overwrite-aware: a run can create, update, or skip each row. Lineage is stored in a
`generator` field on `pages`/`posts` (which program + run produced it).

### AI gateway contract (important)

The model (`pro-coding`) is a **reasoning model**: most of the token budget is spent on
`reasoning_content` before any `content` is emitted.

- Send a **generous `max_tokens`** (default **8192**). At 2048 the reply finishes with
  `finish_reason: 'length'` and an **empty `content`**.
- **Read `content` only.** The gateway may answer as **SSE**; request `stream: false` and,
  if the body still starts with `data:`, concatenate the deltas.
- Config: `AI_BASE_URL`, `AI_MODEL`, `AI_API_KEY`, `AI_MAX_TOKENS`.

### Tests

`src/generator/__tests__/*.test.ts` — `node:test` via `tsx`. Covers tokens, slug, select,
dedupe, render, ai. Run with `npm test` (currently **29/29**).

---

## 4. Content model

**Collections:** `Pages`, `Posts`, `Products`, `CaseStudies`, `Categories`, `Media`,
`Users`, `ReusableContent`, plus the generator collections `GeneratorTemplates`,
`GeneratorDatasets`, `GeneratorPrograms`, `GeneratorRuns`.

**32 blocks** (`src/blocks/*`) — includes `AiContent` (renders generated rich text),
`WhatsAppCTA` (lead-gen), `Pricing`, `Steps`, `ComparisonTable`, `CaseStudyCards`,
`LogoGrid`, `Code`, `ContentGrid`, and more. `/sample-blocks` renders all blocks for QA.

**Admin roles:** `users.roles` is an array (`['admin']`); `isAdmin` checks
`user.roles?.includes('admin')`.

---

## 5. SEO layer

- **`sitemap.ts`** (dynamic, route handler) — all published pages/posts/products/case-studies
  with `lastModified`; test/placeholder pages excluded.
- **Per-route metadata** — `generateMetadata` → canonical, OpenGraph, Twitter card.
  `metadataBase` set in the root layout (required or canonical/OG URLs become relative).
- **JSON-LD** — `Organization`, `WebSite`, `LocalBusiness` (global) + `Article`, `Product`,
  `FAQ`, `BreadcrumbList`, `CollectionPage` (per route).
- **URL policy** — posts are **flat** (`/posts/<slug>`); the legacy `/posts/<category>/<slug>`
  form **308-redirects** to the canonical.
- **`robots.ts` / `manifest.ts` are route handlers**, not files — the catch-all
  `[...slug]` route would otherwise shadow file-based metadata routes.
- **RSS** feed route handler; content hubs (`/posts`, `/produk`) are real pages so nav/footer
  links never 404.

---

## 6. Design system

Full contract in **[`DESIGN.md`](./DESIGN.md)**. Summary:

- **Base:** hairline grid (1px, 12.5% alpha), mono labels (Geist Mono), tight tracking,
  AMOLED `#000`, structural **radius 0**.
- **Warmth layer** (`src/css/brand.scss`, `--kc-*`): brand accent **`#0070F3`** (used
  sparingly: primary buttons, link/nav hover, chips, glyphs), warm amber **`#F4AC4F`** for
  the print pillar, selective radius (4px buttons/chips, 8–12px mockups), soft elevation on
  lifted surfaces, **colour photography by default**, warm-paper light theme.
- **SCSS module files can't see another module's Sass vars** — the shared token layer is
  CSS custom properties, so modules reference `var(--kc-accent)` directly.

---

## 7. Infrastructure & operations

Full runbooks in **[`INFRA.md`](./INFRA.md)**. Key facts:

- **Deploy:** image `yusufkotavom/payload-website:latest` → Swarm service
  `app-back-up-virtual-bandwidth-m5e772`; Traefik terminates TLS (Let's Encrypt).
- **DB:** `payload-mongo` (MongoDB 7) on `dokploy-network` (`10.0.1.150`), **no public port**.
  Media volume `payload-media-data` → `/app/media`.
- **Backups:** `kotacom-backup.timer` — daily 03:30, 14-day retention.
- **No DB at build:** pages are `force-dynamic`, so the build never touches Mongo.

### Hard-won operational rules

1. **Never bind host `:3000`** — it belongs to the Dokploy dashboard. A collision
   crash-loops the Swarm service and corrupts the `dokploy-network` overlay, taking every
   site down. The dev server is pinned to **`:3001`**.
2. **`NEXT_PUBLIC_*` must be a build ARG**, not a runtime env var — otherwise it isn't
   inlined into the client bundle.
3. **Container → host AI gateway** goes through **`docker_gwbridge` → `172.18.0.1`**, not
   localhost/LAN/tailnet (persisted via an iptables unit).
4. **Hydration guard:** client components that read `NEXT_PUBLIC_SITE_URL` must tolerate an
   empty value (an empty target origin throws on `postMessage`).
5. **OG images:** embed local assets as data URLs — inside the container the request origin
   is unreachable for satori.

---

## 8. Environment (names only — values live in `.env.local`, git-ignored)

`DATABASE_URI`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SITE_URL`, `GENERATOR_SECRET`,
`AI_BASE_URL`, `AI_MODEL`, `AI_API_KEY`, `AI_MAX_TOKENS`. Production values are held in the
Dokploy environment; local/dev values in `.env.local` (never committed).

---

## 9. Conventions

- **Package manager:** **pnpm** (`pnpm add -D`, not `npm install`).
- **Gate before every commit:** `npx tsc --noEmit` + `npm test`.
- **`next dev` does not typecheck; `next build` does** — run `tsc` explicitly.
- **Git identity:** `Yusuf Bahtiyar <yusuf@kotacom.id>`.
- **Public routing** must be added as **route handlers**, never file-based metadata files.

---

## 10. Status & roadmap

**Done:** self-hosted infra (Swarm + Traefik + Mongo, no public DB), force-dynamic build
(no DB at build), Payload schema + 32 blocks, AI generator **live** for pages & posts
(plan → enrich → blocks, QA, dedupe, overwrite), MCP server registered, SEO foundation
(sitemap, JSON-LD, canonical, RSS, flat URLs), design system + warmth layer.

**Open:** migrate valuable content from `kotacom.id` (Next + Sanity, ~986 mostly-thin
programmatic URLs) via **301 redirects** before the domain cutover; expand AI programmatic
content; complete the marketing layer.
