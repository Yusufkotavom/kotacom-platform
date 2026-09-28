/**
 * enrich-thin-posts.ts
 * --------------------
 * Re-research and rewrite thin blog posts (currently a ~19-word excerpt stub)
 * into full, E-E-A-T-oriented articles, then store them as `blogContent` blocks.
 *
 * E-E-A-T approach (Experience, Expertise, Authoritativeness, Trust):
 *  - First-hand framing from Kotacom's real practice (Surabaya/Sidoarjo, sejak 2008)
 *  - Concrete, specific guidance (materials, steps, checklists) — no fabricated
 *    statistics, prices-as-fact, or fake testimonials
 *  - Clear structure (intro → H2 sections → FAQ), author = team, published date
 *  - Honest, helpful tone; ends with a soft WhatsApp CTA
 *
 * Runs the local AI gateway with limited concurrency. Idempotent: only rewrites
 * posts whose content is below the word threshold (skips already-rich posts),
 * unless FORCE=1.
 *
 * Run: ./node_modules/.bin/tsx scripts/enrich-thin-posts.ts [--limit N] [--slug <slug>]
 */
import 'dotenv/config'
import { config as loadEnv } from 'dotenv'
import { getPayload } from 'payload'

import { aiChat } from '../src/generator/ai'
import { extractJson, normalizePlan } from '../src/generator/plan'
import { lexicalFromText } from '../src/generator/lexical'
import { richTextToPlain } from '../src/utilities/richTextToPlain'
import configPromise from '../src/payload.config'

loadEnv({ path: '.env.local', override: true })

const rt = (text: string) => lexicalFromText(text) as any
const CONCURRENCY = Number(process.env.ENRICH_CONCURRENCY || 4)
const THRESHOLD = 250

const arg = (name: string) => {
  const i = process.argv.indexOf(`--${name}`)
  return i !== -1 ? process.argv[i + 1] : undefined
}

const wordCount = (content: any[]): number => {
  let w = 0
  const walk = (o: any, d = 0) => {
    if (!o || d > 6) return
    if (o.root) {
      w += richTextToPlain(o).split(/\s+/).filter(Boolean).length
      return
    }
    if (typeof o === 'object') for (const k of Object.keys(o)) walk(o[k], d + 1)
  }
  for (const b of content || []) walk(b)
  return w
}

const PROMPT = (title: string, excerpt: string) =>
  [
    `Tulis artikel blog LENGKAP dan mendalam (E-E-A-T) untuk Kotacom dengan judul: "${title}".`,
    excerpt ? `Konteks/ringkasan awal: ${excerpt}` : '',
    '',
    'Kotacom: studio IT & percetakan di Surabaya & Sidoarjo sejak 2008 — layanan cetak buku, brosur, kemasan, pembuatan website, software/POS, rakit PC, dan IT support. Tulis dari sudut pandang praktisi yang benar-benar mengerjakan ini setiap hari.',
    '',
    'Persyaratan:',
    '- 700–1100 kata, bahasa Indonesia, jelas dan enak dibaca.',
    '- Struktur: paragraf pembuka yang relatable (masalah pembaca), lalu 4–6 bagian dengan sub-judul, lalu FAQ 3–5 pertanyaan.',
    '- Tunjukkan pengalaman nyata (contoh kasus umum, kesalahan yang sering terjadi, tips dari lapangan) TANPA mengarang angka statistik, harga pasti, testimoni, atau nama klien.',
    '- Spesifik & actionable (checklist, langkah, pertimbangan material/teknis yang relevan dengan judul).',
    '- Nada membantu, bukan hard-selling. Boleh menyebut Kotacom sebagai opsi di bagian akhir.',
    '',
    'Balas HANYA JSON valid (tanpa code fence) dengan bentuk:',
    '{',
    '  "metaTitle": "judul SEO 45-60 karakter",',
    '  "metaDescription": "deskripsi meta 120-155 karakter",',
    '  "intro": "2-3 kalimat paragraf pembuka",',
    '  "sections": [{ "heading": "sub-judul", "body": "2-4 paragraf; boleh pakai \\"- \\" untuk daftar" }],',
    '  "faq": [{ "q": "pertanyaan", "a": "jawaban 1-3 kalimat" }]',
    '}',
  ]
    .filter(Boolean)
    .join('\n')

const sectionMd = (s: { heading?: string; body?: string }): string =>
  [s.heading ? `## ${s.heading.trim()}` : '', (s.body || '').trim()].filter(Boolean).join('\n\n')

const buildBlocks = (plan: any, title: string): any[] => {
  const blocks: any[] = []
  const bc = (md: string) => ({ blockType: 'blogContent', blogContentFields: { richText: rt(md), settings: {} } })

  if (plan.intro?.trim()) blocks.push(bc(plan.intro.trim()))
  for (const s of plan.sections ?? []) {
    if (s.heading || s.body) blocks.push(bc(sectionMd(s)))
  }
  if (plan.faq?.length) {
    const faqMd =
      '## Pertanyaan yang Sering Diajukan\n\n' +
      plan.faq
        .filter((f: any) => f.q || f.a)
        .map((f: any) => `### ${(f.q || '').trim()}\n\n${(f.a || '').trim()}`)
        .join('\n\n')
    blocks.push(bc(faqMd))
  }
  // Soft closing CTA
  blocks.push(
    bc(
      `## Butuh bantuan langsung?\n\nKalau Anda ingin diskusi soal ${title.toLowerCase()}, tim Kotacom siap bantu lewat WhatsApp — konsultasi tanpa biaya, respons cepat di jam kerja.`,
    ),
  )
  return blocks
}

const main = async () => {
  const payload: any = await getPayload({ config: configPromise })
  const only = arg('slug')
  const limit = arg('limit') ? Number(arg('limit')) : undefined
  const force = process.env.FORCE === '1'

  const res = await payload.find({ collection: 'posts', limit: 300, depth: 1, overrideAccess: true })
  let targets = res.docs.filter((d: any) => force || wordCount(d.content) < THRESHOLD)
  if (only) targets = res.docs.filter((d: any) => d.slug === only)
  if (limit) targets = targets.slice(0, limit)

  console.log(`Enriching ${targets.length} thin posts (concurrency ${CONCURRENCY})...`)
  let done = 0
  let failed = 0

  const runOne = async (doc: any) => {
    try {
      const excerpt = richTextToPlain(doc.excerpt)
      const raw = await aiChat(PROMPT(doc.title, excerpt), { maxTokens: 8192 })
      const json = extractJson(raw)
      if (!json) throw new Error('AI tidak mengembalikan JSON valid')
      const plan = normalizePlan(json as any)
      const blocks = buildBlocks({ ...plan, intro: (json as any).intro || plan.intro }, doc.title)
      if (blocks.length < 3) throw new Error('konten terlalu pendek')

      const meta = {
        ...(doc.meta || {}),
        title: (json as any).metaTitle || doc.meta?.title || doc.title,
        description: (json as any).metaDescription || doc.meta?.description,
      }
      await payload.update({
        collection: 'posts',
        id: doc.id,
        data: {
          content: blocks,
          meta,
          ...(excerpt ? {} : { excerpt: rt((json as any).intro || doc.title) }),
        },
        overrideAccess: true,
      })
      done++
      console.log(`  ✓ ${doc.slug} — ${blocks.length} blocks`)
    } catch (e: any) {
      failed++
      console.warn(`  ! ${doc.slug}: ${e.message}`)
    }
  }

  // simple concurrency pool
  const queue = [...targets]
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const doc = queue.shift()
      if (doc) await runOne(doc)
    }
  })
  await Promise.all(workers)

  console.log(`\nDONE: enriched ${done}, failed ${failed}, total ${targets.length}`)
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
