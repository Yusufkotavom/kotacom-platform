# AI Content Generator (Generator V2) — Implementation Plan — rev 2

> **For Hermes:** implement task-by-task. Plan-only artifact — no code written yet.
> **Rev 2 (decisions locked by user):**
> 1. **Output entities = `pages` AND `posts`** (products/portfolio dropped from this phase).
> 2. **AI = local gateway `http://localhost:20128/v1`, model `pro-coding`** (the *same model Hermes runs on*). Default `aiMode = 'generate'`.
> 3. **The generator is 100% AI-operable** — everything (create template/dataset/program, dry-run, generate, revise) is drivable through a stable API an AI agent can call; no manual admin clicking required.
> 4. **Generated content is 100% AI** — every block's prose is produced by the model (deterministic text stays only as a safety fallback).
> 5. **Output must be revisable** — generated docs are normal editable docs, and re-running with **`writeMode: 'overwrite'`** updates them in place (same document, version bumped).
>
> Benchmark system: `/home/ubuntu/Sanity-clean` (monorepo DEVK Studio; generator identical to `/home/ubuntu/kotacom/Sanity-clean`). Full teardown: skill `payload-cms` → `references/sanity-clean-generator.md`.

**Goal:** A CMS-driven, **100%-AI** content generator for Payload that emits **unique, SEO-optimized `pages` and `posts`** from a *block template + dataset of rows*, driven end-to-end by an AI agent, with full **revision/overwrite** support.

**Architecture:** Generated output stays **real `pages`/`posts` documents** (never runtime-generated) — matching Sanity V2 ("generation lives in tooling, the frontend only renders"). A framework-free engine in `src/generator/*` (tokens → slug → render → AI-enrich → QA → dedupe) runs **server-side inside Payload** (custom endpoint + optional admin view), writes **drafts**, records lineage on each entity so re-runs are idempotent and **`overwrite` = in-place revision**. Every generated doc flows through the already-complete SEO layer (`src/seo/metadata.ts buildMetadata` + `normalize.ts` + `schema.ts`), so canonical/OG/JSON-LD/H1 are inherited automatically.

**Tech Stack:** Payload 3.88 (MongoDB) · Next 16.3 App Router · Lexical richText · existing block system (`blockReferences`) · **local OpenAI-compatible gateway (model `pro-coding`)** · `tsx --test` for pure-function tests.

---

## 1. Current context / assumptions

**Already in the repo** (`/home/ubuntu/projects/payloadcms-website`), reusable:
- Collections `pages`, `posts` (+ `categories`, `media`, `users`), `products`, `case-studies`.
- `pages.layout` blocks array (`blockReferences`, 30+ blocks). `posts.content` blocks array (Banner, blogContent, code, blogMarkdown, mediaBlock, reusableContentBlock).
- SEO complete: `buildMetadata()`, `normalize.ts` (30–60 / 120–155), `schema.ts` (Organization/WebSite/LocalBusiness/BreadcrumbList/**Article**/Service/Product/FAQ/ItemList/CollectionPage), `seoFields()`, `seoPlugin` on `case-studies/pages/posts`.
- Hubs `/produk`, `/posts`, `/case-studies`; sitemap/robots/rss/manifest; flat post permalink `/posts/<slug>`.
- `src/utilities/richTextToPlain.ts`, `src/utilities/whatsapp.ts`, block `whatsappCta`, globals `site-settings` + `whatsapp-marketing`.
- `src/plugins/opsCounter.ts` (local-plugin pattern for wiring admin components); REST-seed scripts (`scripts/kotacom-foundation-seed.py`, `scripts/kotacom-seo-meta-enrich.py`) as the API-driving pattern.

**Locked assumptions / decisions:**
- Output = `pages` (service/landing) **and** `posts` (articles), chosen per program via `entityType: 'page' | 'post'`.
- AI: `AI_BASE_URL=http://localhost:20128/v1`, `AI_MODEL=pro-coding`, OpenAI-compatible `POST /chat/completions`. **Reasoning-model behaviour is handled explicitly** (see §4.1) — this is the #1 reliability risk for "100% AI".
- `aiMode` default `'generate'`. `off` = deterministic text only (fallback/testing); `prepared` = compile prompts, no calls; `generate` = call the model.
- Generation writes **drafts** by default (`_status:'draft'`); `outputStatus` may be `published` per program. Re-runs use `writeMode: 'skip' | 'overwrite'`.
- **Posts required fields** are satisfied by the program + row mapping: `category` (rel, from program `defaultCategory` or row `categorySlug`), `authors` (rel users, from program `defaultAuthors`), `publishedOn` (now, or row), `content` (blocks), `image` (from program `defaultImage` or a generated OG). See §5.3.
- No new runtime dependency for the app; AI client is a thin `fetch`. Only dev tool `tsx` added for tests.

**Out of scope (later phases):** migration/301 map of the ~986 live URLs; the auto-scheduler (cron) from `.kiro/specs/ai-content-scheduler`; products/portfolio entity; frontend redesign.

---

## 2. Data model

### 2.1 `generator-templates` (`src/collections/GeneratorTemplates.ts`)
The **block skeleton + token contract + SEO patterns + AI prompts**.

| Field | Type | Notes |
|---|---|---|
| `title`, `slug` | | |
| `entityType` | select `page\|post`, default `page` | output doc type |
| `routeBase` | text, required | e.g. `/percetakan/cetak-buku` (page) or `/posts` (post) |
| `slugPattern` | text, default `{{routeBase}}/{{city}}` | tokenized (pages); for posts `{{primaryKeyword}}` |
| `h1Pattern` | text, default `{{primaryKeyword}} {{city}}` | |
| `seoTitlePattern` | text, default `{{primaryKeyword}} {{city}} \| Kotacom` | |
| `seoDescriptionPattern` | textarea, default `{{introShort}}` | |
| `schemaType` | select `Service\|Article\|LocalBusiness\|None`, default `Service` | JSON-LD to emit |
| `defaultCategory` | rel `categories` | for `post` entityType |
| `defaultAuthors` | rel `users` (hasMany) | for `post` entityType |
| `tokenDefinitions` | array `{name, sourceField, fallbackValue}` | optional token restriction/rename |
| `layout` | blocks (`blockReferences` = same list as `Pages.layout`) or, for posts, the post content blocks | template body; **mostly `aiContent` blocks** |
| `hero` | group (reuse trimmed `src/fields/hero.ts`) | optional (pages) |
| `status` | select `draft\|ready`, default `draft` | |
| `notes` | textarea | editor guidance |

### 2.2 `generator-datasets` (`src/collections/GeneratorDatasets.ts`)
Rows = one row → one page/post.

| Field | Type | Notes |
|---|---|---|
| `title`, `slug` | | |
| `rows` | array `generator-row` | |
| `importMode` | select `manual\|csv`, default `manual` | |
| `rowCsv` | textarea (hidden unless csv) | header: `key,label,service,city,primaryKeyword,secondaryKeywords,industry,offer,localCondition,categorySlug` — `\|`-split secondary keywords; non-standard columns → tokens |

`generator-row`: `key`, `label`, `service`, `city`, `primaryKeyword` (required), `secondaryKeywords[]`, `industry`, `offer`, `localCondition`, `categorySlug`, `tokens[]` `{name, values[]}`.

### 2.3 `generator-programs` (`src/collections/GeneratorPrograms.ts`)
The operator/AI-facing job.

| Field | Type | Notes |
|---|---|---|
| `title`, `slug` | | |
| `entityType` | select `page\|post` | |
| `template` | rel `generator-templates`, required | |
| `templatePool` | rel `generator-templates[]`, max 3 | deterministic per-row variation |
| `dataset` | rel `generator-datasets`, required | |
| `routeBase` | text | optional override |
| `outputStatus` | select `draft\|published`, default `draft` | |
| `aiMode` | select `off\|prepared\|generate`, **default `generate`** | |
| `writeMode` | select `skip\|overwrite`, default `skip` | `overwrite` = in-place revision |
| `defaultCategory` | rel `categories` | posts |
| `defaultAuthors` | rel `users` hasMany | posts |
| `defaultImage` | rel `media` | posts/pages fallback featured image |
| `status` | select `draft\|ready\|paused`, default `draft` | |

### 2.4 Lineage group on output entities (`src/fields/generatorLineage.ts`)
Added to `pages` **and** `posts` (sidebar), fields:
```
generator: group {
  program (rel generator-programs), template (rel generator-templates), dataset (rel generator-datasets),
  rowKey (text, index:true), keywordKey (text), version (text), aiUsed (checkbox), generatedAt (date)
}
```
Powers **dedupe + overwrite** (match by `programId`+`rowKey`+`keywordKey`). `posts` + `pages` both already have `versions.drafts: true` → **revision history out of the box**.

---

## 3. Engine (`src/generator/*`) — framework-free, pure

```
src/generator/
  types.ts  slug.ts  tokens.ts  select.ts  dedupe.ts  qa.ts  render.ts  ai.ts  index.ts
  __tests__/  (slug, tokens, select, dedupe, qa, render, ai — tsx --test)
```

Code for `tokens.ts`, `slug.ts`, `select.ts`, `qa.ts`, `dedupe.ts`, `render.ts` is as specified in rev 1; add/adjust:

- **`render.ts`** must also produce the **entity-specific envelope**:
  - `page` → `{ title, hero, layout, meta, slug, _status }`
  - `post` → `{ title, excerpt (Lexical), content (blocks), category (id), authors ([ids]), publishedOn (ISO), image?, meta, slug, _status }`
  - `render` resolves `category` from row `categorySlug` → program `defaultCategory`; `authors` from program `defaultAuthors`; `publishedOn` = row date || now.
- Meta passes through `normalizeSeoTitle/normalizeSeoDescription` (`src/seo/normalize.ts`) → already in Google's window.

### 3.1 `qa.ts` (adds the "unique page" guard for the old-site failure mode)
As rev 1, plus:
- **Content-uniqueness warning:** if two rows in the same program produce `introShort`/first-paragraph similarity > 0.85 → `warning code: near-duplicate-content`. (Cheap token-set Jaccard, no dep.)
- **AI-not-run block:** if `aiMode==='generate'` and any `aiContent.generatedText` is empty after enrichment → `blocked code: ai-empty` (prevents publishing a half-AI page).

---

## 4. AI enrichment (100% AI)

### 4.1 `src/generator/ai.ts` — local gateway client (`pro-coding`)
OpenAI-compatible. **Handles the reasoning-model pitfalls found in recon:**

```ts
const AI_BASE = process.env.AI_BASE_URL || 'http://localhost:20128/v1'
const AI_MODEL = process.env.AI_MODEL || 'pro-coding'
const AI_KEY = process.env.AI_API_KEY || ''

// NOTE (recon 2026-09-14): `pro-coding` is a REASONING model routed by the
// gateway (upstream e.g. deepseek/*). Two gotchas:
//  1) it emits `message.reasoning_content`; with a small max_tokens the real
//     `message.content` comes back EMPTY and finish_reason='length'.
//     → always send a generous max_tokens (default 2048) and read
//       `choices[0].message.content` ONLY (never reasoning_content).
//  2) the gateway may answer as SSE (`text/event-stream`).
//     → request `"stream": false`; if the body still starts with "data:",
//       join the deltas.
export async function aiChat(prompt: string, opts?: { system?: string; maxTokens?: number }) {
  const body = {
    model: AI_MODEL,
    stream: false,
    max_tokens: opts?.maxTokens ?? 2048,
    messages: [
      ...(opts?.system ? [{ role: 'system', content: opts.system }] : []),
      { role: 'user', content: prompt },
    ],
  }
  const res = await fetch(`${AI_BASE}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(AI_KEY ? { Authorization: `Bearer ${AI_KEY}` } : {}) },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60_000),
  })
  const text = await res.text()
  if (text.startsWith('data:')) {
    // SSE: concatenate content deltas
    let out = ''
    for (const line of text.split('\n')) {
      const t = line.replace(/^data:\s*/, '').trim()
      if (!t || t === '[DONE]') continue
      try { out += JSON.parse(t)?.choices?.[0]?.delta?.content ?? '' } catch {}
    }
    return out.trim()
  }
  const json = JSON.parse(text)
  return String(json?.choices?.[0]?.message?.content ?? '').trim()
}
```

- `extractAiPrompts(obj)` / `replaceAiPrompts(obj, map)` for the inline shortcode `[aigen:prompt]` in any richText string (mirrors Sanity `ai.ts`).
- `enrichDraft(draft, { mode })` — when `mode==='generate'`:
  - for **every** `aiContent` block with an empty `generatedText` → `aiChat(promptWithTokens, {system: SEO_WRITER_SYSTEM, maxTokens})` → store into `generatedText`;
  - for **every** string field containing `[aigen:…]` → resolve and replace;
  - set `draft.generator.aiUsed = true`.
  - On **any** error/timeout → leave the deterministic fallback text in place, push a `warning`, continue (never throw — a page must never fail to generate because the model hiccupped).
- `SEO_WRITER_SYSTEM`: Indonesian copywriter prompt — mention brand voice, include the primary keyword naturally, target the SEO window, no keyword stuffing, E-E-A-T tone.
- Env (git-ignored `.env`; document names in `.env.example`): `AI_BASE_URL`, `AI_MODEL=pro-coding`, `AI_API_KEY` (may be empty for the local gateway), `AI_ENABLED=true`, `AI_MAX_TOKENS=2048`, `AI_CONCURRENCY=2`.

### 4.2 Block `aiContent` (`src/blocks/AiContent/index.ts`)
Primary content vehicle for AI pages (a template body is mostly these).
```
aiContent (blockFields({ name:'aiFields', fields:[
  { name:'heading', type:'text' },
  { name:'prompt', type:'textarea', admin:{ description:'Prompt AI. Dukung {{token}} (mis. {{city}}, {{primaryKeyword}}).' } },
  { name:'tone', type:'select', options:[profesional|ramah|teknis|persuasif], default:'profesional' },
  { name:'length', type:'select', options:[pendek|sedang|panjang], default:'sedang' },
  richText({ name:'content' }),            // deterministic FALLBACK (kept)
  richText({ name:'generatedText', admin:{ readOnly:true, description:'Hasil AI (diisi saat generate/overwrite).' } }),
]})})
```
Renderer `src/components/blocks/AiContent/{index.tsx,index.module.scss}` renders `generatedText` when non-empty, else `content`; `heading` as **H2** (H1 comes from the entity). Register in `payload.config.ts` `blocks[]`, add `'aiContent'` to `Pages.layout` + `Posts.content` `blockReferences`, add to `RenderBlocks`.

### 4.3 Post block support (confirmed in repo)
`Posts.content` is already a `blocks` array, rendered by `src/components/Post/index.tsx` → `<RenderBlocks blocks={[...content, RelatedPosts]} disableGrid disableGutter />`. Allowed `blockReferences` there today: **`banner`, `blogContent`, `code`, `blogMarkdown`, `mediaBlock`, `reusableContentBlock`**. `RenderBlocks` (`src/components/blocks/`) maps 30 block types but only those 6 can be authored into a post.

| block | payload | generator use |
|---|---|---|
| `blogContent` | `blogContentFields.richText` (Lexical) | **primary prose carrier** — AI can write Lexical JSON directly (paragraphs/headings H2+/lists/links/quote/table). |
| `banner` | `bannerFields.{type,addCheckmark,content}` | AI callout / highlight. |
| `code` | `codeFields.{language,code}` | AI for technical articles. |
| `blogMarkdown` | `blogMarkdownFields.markdown` | text; note custom `Field` component. |
| `mediaBlock` | media upload + caption | needs media (later: auto-OG upload). |
| `reusableContentBlock` | relationship | needs a reusable-content doc. |

- **H1 is safe:** post `title` already renders as `<h1>` (`Post/index.tsx:74`); block headings stay H2+. Post `excerpt` is a **separate richText field** (not a block).
- **Two AI-writing paths for posts:** (1) the new **`aiContent`** block (prompt + fallback + `generatedText`) — recommended, overwrite-friendly; (2) **fill `blogContent.richText` directly** with model-produced Lexical JSON. Templates may mix both.
- `RenderBlocks` `paddingExceptions` already handles `banner`/`blogContent`/`blogMarkdown`/`code`/`reusableContentBlock`, so no layout work is needed for new posts.

### 4.4 "100% AI" definition (what we will guarantee)
- **Content:** in `generate` mode every `aiContent` block and every `[aigen:]` field is model-written; templates ship with `content` fallbacks only so the page is never broken.
- **Operation:** the whole pipeline is API-drivable by an AI (§5.4). No admin interaction required.

---

## 5. Runner (server-side) + 100% AI-operable surface

### 5.1 Custom endpoint `src/endpoints/generatorRun.ts`
Registered in `payload.config.ts` (`{ path: '/generator/run', method: 'post', handler, admin: true }`). Handler:
1. load program (+template/pool+dataset), 2. fetch existing docs for the target collection with their `generator` lineage, 3. per row: `selectTemplate` → `buildDraft(entityType)` → `enrichDraft(aiMode)` → `assessDraft` → act:
   - `dryRun=1` → report only, **no writes**.
   - `writeMode:'skip'` → create if no slug/lineage clash, else skip.
   - **`writeMode:'overwrite'`** → if a doc matches lineage → `payload.update(collection, id, {...draft, 'generator.version':'v2'+n})` **in place** (id preserved, revision recorded by Payload versions); else create.
  4. return `{ generated, updated, skipped, conflicts, blocked, nearDuplicates, report[] }`.
- Query/body: `{ programId, dryRun?, writeMode?, limit? }`.

### 5.2 Admin view (optional convenience) `src/components/admin/GeneratorRunner.tsx`
Custom view at `/admin/generator` (wire via `admin.components.views`, `opsCounter` as the example): pick Program → **Dry Run** / **Generate (new)** / **Generate (overwrite / revisi)**, render the QA report (severity counts + issues). Plain (grid hairline, radius 0, mono labels) per `DESIGN.md`. Not required for the AI path.

### 5.3 Posts mapping (required fields)
`render` for `entityType:'post'` produces: `title`, `slug`, `category` (row `categorySlug` → program `defaultCategory`), `authors` (program `defaultAuthors`), `publishedOn` (now/row), `excerpt` (Lexical from `introShort`/AI), `content` (AI blocks), `image` (program `defaultImage` or a generated OG upload), `meta`, `_status`. A **pre-flight in `qa.ts`** blocks the run if a post row has no resolvable category or no authors.

### 5.4 100% AI-operable surface (the deliverable for "bisa di akses & digunakan 100% AI")
Everything an AI agent needs, over HTTP with a login token — no admin UI required:
- `POST /api/users/login` → token (AI auth).
- Collections CRUD (built-in): `POST/GET/PATCH /api/generator-templates`, `/api/generator-datasets`, `/api/generator-programs` — AI authors templates/datasets/programs.
- `POST /api/generator/run` `{ programId, dryRun, writeMode, limit }` → run or dry-run; returns the report.
- `GET /api/generator/run/last` → most recent run report.
- Optional: expose the same via Payload **MCP** (plugin already installed) so an MCP-capable agent can call `run-generator` as a tool — secondary to the REST surface (MCP had a protocol-mismatch note vs this Hermes build; REST is the reliable path).

CLI `scripts/generator-run.mjs` (Node ESM) wraps the REST surface (`--program`, `--dry`, `--overwrite`, `--limit`) and appends each run's JSON to `scripts/generator-runs/<ts>.json`.

---

## 6. Step-by-step tasks (bite-sized; commit after each)

**Phase A — Engine (pure, testable)**
- **A1.** Add devDep `tsx`; scripts `"test:generator": "tsx --test src/generator/__tests__/*.test.ts"`. `package.json`.
- **A2.** `types.ts`. **A3.** `slug.ts` + test (`/percetakan/cetak-buku` + `Bandung` + `Jasa Cetak Buku` → `percetakan/cetak-buku/bandung`).
- **A4.** `tokens.ts` + test (interpolate + deepReplace + unknown-token→'').
- **A5.** `select.ts` + test (stable hash; 1 template case).
- **A6.** `dedupe.ts` + test (slug, lineage, none).
- **A7.** `qa.ts` + test (blocked: missing meta.title, ai-empty; warning: short desc, near-duplicate-content; ready: full draft).
- **A8.** `render.ts` + test (page envelope AND post envelope: category/authors/publishedOn resolved; meta in window).
- **A9.** `ai.ts` + test (extract/replace `[aigen:]`; `aiChat` parses plain JSON **and** SSE; empty-content → '' ; `enrichDraft` mode `off` = no fetch; fetch mocked). **Also an integration smoke** against the real gateway (see §8).
- **A10.** `index.ts` barrel; `pnpm exec tsc --noEmit` → 0. **COMMIT** `feat(generator): engine (slug/tokens/select/qa/dedupe/render/ai)`.

**Phase B — Schema**
- **B1.** `src/fields/generatorLineage.ts`. **B2.** `GeneratorTemplates.ts`. **B3.** `GeneratorDatasets.ts`. **B4.** `GeneratorPrograms.ts`. **B5.** register in `payload.config.ts`. **B6.** add `generatorLineage` to `Pages.ts` **and** `Posts.ts` (sidebar). **B7.** `payload generate:types` + `tsc --noEmit`. **COMMIT** `feat(generator): collections (templates/datasets/programs) + lineage on pages/posts`.

**Phase C — AI block**
- **C1.** `src/blocks/AiContent/index.ts`. **C2.** `src/components/blocks/AiContent/{index.tsx,index.module.scss}`. **C3.** register block + add `'aiContent'` to `Pages.layout` and `Posts.content` `blockReferences` + `RenderBlocks`. **C4.** `payload generate:importmap` + `tsc --noEmit` + restart dev + confirm `/admin` no crash. **COMMIT** `feat(generator): aiContent block`.

**Phase D — Runner + AI surface**
- **D1.** `src/endpoints/generatorRun.ts` (+ overwrite/upsert + posts mapping + report). **D2.** register endpoint. **D3.** `scripts/generator-run.mjs`. **D4.** (optional) admin view `GeneratorRunner.tsx`. **D5.** `tsc --noEmit` + restart dev; smoke `POST /api/generator/run` with `dryRun:1`. **COMMIT** `feat(generator): run endpoint (dry-run/overwrite) + CLI + AI surface`.

**Phase E — Seed a real program & verify (dev)**
- **E1.** Dataset `/percetakan/cetak-buku` × city (34 from `template-routes-map.csv`) **and** a small posts dataset. **E2.** Template(s): page template `percetakan-cetak-buku` (body = `aiContent`+`content`+`pricing`+`cta`+`whatsappCta`) and a post template `/posts` (Article). **E3.** Programs: `cetak-buku-kota` (entityType `page`) + `artikel-…` (entityType `post`), `aiMode:'generate'`, `writeMode:'skip'`. **E4.** `dryRun` → inspect report (expect ready/warning, 0 blocked, real AI prompts compiled). **E5.** Real run → N draft pages/posts, **AI-written** (`aiUsed=true`, `generatedText` populated). **E6.** Verify a generated page AND post in admin/REST + rendered HTML (H1, meta window, canonical, OG, JSON-LD Article/Service). **COMMIT** `content(generator): seed cetak-buku×kota + artikel programs`.

**Phase F — Revision/overwrite proof + docs**
- **F1.** Edit template prompt → re-run program with **`writeMode:'overwrite'`** → assert the SAME doc ids updated in place, `generator.version` bumped, history in `versions`. **F2.** `GENERATOR.md` + update skill `payload-cms` (`references/generator-v2.md`). **COMMIT** `docs: generator V2 (pages+posts, AI, overwrite/revisi)`.

---

## 7. Files

**Create:** `src/generator/{types,slug,tokens,select,dedupe,qa,render,ai,index}.ts`, `src/generator/__tests__/*.test.ts`, `src/fields/generatorLineage.ts`, `src/collections/Generator{Templates,Datasets,Programs}.ts`, `src/blocks/AiContent/index.ts`, `src/components/blocks/AiContent/{index.tsx,index.module.scss}`, `src/endpoints/generatorRun.ts`, `src/components/admin/GeneratorRunner.tsx` (+scss), `scripts/generator-run.mjs`, `GENERATOR.md`.
**Modify:** `src/payload.config.ts`, `src/collections/Pages.ts`, `src/collections/Posts.ts`, `src/components/RenderBlocks/index.tsx`, `package.json`, `.env.example`.

---

## 8. Tests / validation

- **Unit (pure):** `pnpm test:generator` — slug/tokens/select/dedupe/qa/render/ai green.
- **AI client integration (real gateway):** a small script hits `http://localhost:20128/v1/chat/completions` with `model:'pro-coding'`, `max_tokens:2048`, and asserts `content` is non-empty (guards the reasoning-model/SSE pitfall). Run once in Phase A9.
- **Type:** `pnpm exec tsc --noEmit` → 0 (`next dev` does NOT typecheck).
- **Config:** `payload generate:types` + `generate:importmap` succeed (do NOT add `seoFields()` to pages/posts — `seoPlugin` owns `meta`, duplicate = `DuplicateFieldName`).
- **Server:** restart dev (`localhost:3001`), `/admin` 200, `POST /api/generator/run?dryRun=1` returns a report.
- **100%-AI access:** from a clean shell, log in, create a program via `POST /api/generator-programs`, run it, and confirm drafts created — with **no admin UI** touched.
- **E2E SEO (rendered HTML, not source — `references/seo-foundation-audit.md`):** generated page → exactly one `<h1>`, description 120–155, absolute canonical, non-empty og:image, Service/Breadcrumb JSON-LD; generated post → Article JSON-LD on the flat route; both in `/sitemap.xml`.
- **Overwrite/revisi:** run twice `writeMode:'skip'` → all skipped, 0 new; `writeMode:'overwrite'` → same doc ids updated, `version` bumped, prior versions retrievable.

---

## 9. Risks, tradeoffs, open questions

- **Reasoning-model reliability (top risk).** `pro-coding` may return `reasoning_content` and an empty `content` under small `max_tokens`, or SSE. Mitigated in §4.1 (generous `max_tokens`, `stream:false`, SSE fallback, `content`-only) + the A9 integration smoke. On failure → deterministic fallback, never a broken page.
- **Near-clone risk** (the old live site's 399 thin `jasa-cetak-buku-{kabupaten}`). Mitigations: `templatePool` hash variation, **100% AI** per-block prose (naturally varied), and the `near-duplicate-content` QA warning. Later: a `uniqueAngle` per row + body-level dedupe.
- **Posts need real relations** (`category`, `authors`) + `publishedOn`, `image`. Program fields + row `categorySlug` cover it; `qa.ts` pre-flight blocks a row that can't resolve them.
- **`payload run` can hang** on full config → the runner is a **custom endpoint** (Local API via `req.payload`), not a standalone script.
- **AI cost/latency at scale** (34+ rows × several blocks). Sequential + `AI_CONCURRENCY=1–2`; `dryRun` first; `writeMode:'skip'` for incremental; log every run to `scripts/generator-runs/`.
- **Draft-first:** outputs are `draft`; publishing stays a human review step (or `outputStatus:'published'` per program for low-risk bulk).
- **Open (confirm or I proceed with the default):**
  1. Posts template — one shared `/posts` article template, or per-category templates? (default: **one shared** + per-category `defaultCategory`.)
  2. Posts `image` — reuse a program `defaultImage`, or auto-generate an OG image per post via `/api/og`? (default: **program defaultImage**, switchable later.)
  3. First runs — dev only (recommended) or also against production after dev verification? (default: **dev until you approve prod**.)
  4. Admin view (D4) — build now, or ship the REST/CLI surface first and add the view later? (default: **REST/CLI first**, view optional.)
