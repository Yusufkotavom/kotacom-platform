/**
 * apply-post-articles.ts
 * ----------------------
 * Apply sub-agent-authored E-E-A-T articles to thin posts. Reads one or more
 * JSON files (default: /tmp/articles/*.json), each an array of:
 *   { slug, metaTitle, metaDescription, intro, sections:[{heading,body}], faq:[{q,a}] }
 * and stores them as `blogContent` blocks on the matching post.
 *
 * Run: ./node_modules/.bin/tsx scripts/apply-post-articles.ts [dir]
 */
import 'dotenv/config'
import { config as loadEnv } from 'dotenv'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'

import { lexicalFromText } from '../src/generator/lexical'
import { richTextToPlain } from '../src/utilities/richTextToPlain'
import configPromise from '../src/payload.config'

loadEnv({ path: '.env.local', override: true })

const rt = (text: string) => lexicalFromText(text) as any
const DIR = process.argv[2] || '/tmp/articles'

const sectionMd = (s: { heading?: string; body?: string }): string =>
  [s.heading ? `## ${s.heading.trim()}` : '', (s.body || '').trim()].filter(Boolean).join('\n\n')

const buildBlocks = (a: any, title: string): any[] => {
  const bc = (md: string) => ({ blockType: 'blogContent', blogContentFields: { richText: rt(md), settings: {} } })
  const blocks: any[] = []
  if (a.intro?.trim()) blocks.push(bc(a.intro.trim()))
  for (const s of a.sections ?? []) if (s.heading || s.body) blocks.push(bc(sectionMd(s)))
  if (a.faq?.length) {
    const faqMd =
      '## Pertanyaan yang Sering Diajukan\n\n' +
      a.faq.filter((f: any) => f.q || f.a).map((f: any) => `### ${(f.q || '').trim()}\n\n${(f.a || '').trim()}`).join('\n\n')
    blocks.push(bc(faqMd))
  }
  blocks.push(
    bc(
      `## Butuh bantuan langsung?\n\nKalau Anda ingin diskusi soal ${(title || '').toLowerCase()}, tim Kotacom siap bantu lewat WhatsApp — konsultasi tanpa biaya, respons cepat di jam kerja.`,
    ),
  )
  return blocks
}

const main = async () => {
  const payload: any = await getPayload({ config: configPromise })
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.json'))
  let articles: any[] = []
  for (const f of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'))
      articles.push(...(Array.isArray(data) ? data : [data]))
    } catch (e: any) {
      console.warn(`  ! parse ${f}: ${e.message}`)
    }
  }
  console.log(`Loaded ${articles.length} articles from ${files.length} files`)

  let done = 0
  let failed = 0
  for (const a of articles) {
    if (!a.slug) { failed++; continue }
    const found = await payload.find({ collection: 'posts', where: { slug: { equals: a.slug } }, limit: 1, depth: 0, overrideAccess: true })
    const doc = found.docs[0]
    if (!doc) { console.warn(`  ! not found: ${a.slug}`); failed++; continue }
    const blocks = buildBlocks(a, doc.title)
    if (blocks.length < 3) { console.warn(`  ! too short: ${a.slug}`); failed++; continue }
    const excerpt = richTextToPlain(doc.excerpt)
    try {
      await payload.update({
        collection: 'posts',
        id: doc.id,
        data: {
          content: blocks,
          meta: { ...(doc.meta || {}), title: a.metaTitle || doc.meta?.title || doc.title, description: a.metaDescription || doc.meta?.description },
          ...(excerpt ? {} : { excerpt: rt(a.intro || doc.title) }),
        },
        overrideAccess: true,
      })
      done++
      console.log(`  ✓ ${a.slug} — ${blocks.length} blocks`)
    } catch (e: any) {
      failed++
      console.warn(`  ! ${a.slug}: ${e.message}`)
    }
  }
  console.log(`\nDONE: applied ${done}, failed ${failed}`)
  process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })
