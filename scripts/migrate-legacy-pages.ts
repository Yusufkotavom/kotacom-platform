/**
 * migrate-legacy-pages.ts
 * -----------------------
 * 223 of the 238 kotacom.id Sanity `page` documents store their real article
 * body inside a `legacy-rich-content` block as raw HTML (`contentRaw`,
 * contentFormat "html"). The earlier migration only handled Portable Text, so
 * these pages landed in Payload as stubs that render "Konten halaman tidak
 * tersedia".
 *
 * This script converts each page's legacy HTML → markdown → Payload `content`
 * blocks and updates the matching Payload page's `layout` (idempotent by slug),
 * so the pages render their real content instead of a placeholder.
 *
 * Run: ./node_modules/.bin/tsx scripts/migrate-legacy-pages.ts
 */
import 'dotenv/config'
import { config as loadEnv } from 'dotenv'
import fs from 'fs'
import { getPayload } from 'payload'

import { lexicalFromText } from '../src/generator/lexical'
import configPromise from '../src/payload.config'

loadEnv({ path: '.env.local', override: true })

const EXPORT = '/tmp/sanity_export/page.json'
const rt = (text: string) => lexicalFromText(text) as any

/* --------------------------- HTML → markdown --------------------------- */
const decodeEntities = (s: string): string =>
  s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&hellip;/g, '…')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&rarr;/g, '→')
    .replace(/&[a-zA-Z]+;/g, ' ')

const stripTags = (html: string): string =>
  decodeEntities(
    html
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  )

const inlineToText = (html: string): string =>
  decodeEntities(
    html
      .replace(/<\s*br\s*\/?>/gi, ' ')
      .replace(/<\/?(strong|b)>/gi, '**')
      .replace(/<\/?(em|i)>/gi, '')
      .replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1')
      .replace(/<[^>]+>/g, '')
      .replace(/\*\*\s*\*\*/g, '') // drop empty bolds
      .replace(/\s+/g, ' ')
      .trim(),
  )

/**
 * Convert a legacy HTML article body into markdown that lexicalFromText can
 * render (headings, paragraphs, bullet lists). Tables and details/summary are
 * flattened into readable text lines.
 */
const htmlToMarkdown = (rawHtml: string): string => {
  // isolate <body> if present
  const bodyMatch = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(rawHtml)
  let html = bodyMatch ? bodyMatch[1] : rawHtml
  // drop head/style/script noise
  html = html.replace(/<head[\s\S]*?<\/head>/gi, '')
  html = html.replace(/<style[\s\S]*?<\/style>/gi, '')
  html = html.replace(/<script[\s\S]*?<\/script>/gi, '')

  const out: string[] = []

  // Expand <details><summary>Q</summary>...answer...</details> → ### Q + text
  html = html.replace(
    /<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi,
    (_m, q, a) => `\n<h3>${stripTags(q)}</h3>\n<p>${stripTags(a)}</p>\n`,
  )

  // Tables → readable lines: "Label: v1 | v2 ..." per row
  html = html.replace(/<table[\s\S]*?<\/table>/gi, (tbl) => {
    const rows = tbl.match(/<tr[\s\S]*?<\/tr>/gi) || []
    const lines: string[] = []
    for (const tr of rows) {
      const cells = (tr.match(/<t[dh][\s\S]*?<\/t[dh]>/gi) || []).map((c) => inlineToText(c))
      const nonEmpty = cells.filter(Boolean)
      if (nonEmpty.length) lines.push('- ' + nonEmpty.join(' — '))
    }
    return '\n' + lines.join('\n') + '\n'
  })

  // Walk block-level elements in order.
  const blockRe = /<(h1|h2|h3|h4|p|li|ul|ol|hr)\b[^>]*>([\s\S]*?)<\/\1>|<hr\s*\/?>/gi
  let m: RegExpExecArray | null
  let lastIndex = 0
  // We iterate over headings/paragraphs/list-items; ul/ol wrappers are handled
  // implicitly because their <li> children match too.
  const itemRe =
    /<(h1|h2|h3|h4)\b[^>]*>([\s\S]*?)<\/\1>|<p\b[^>]*>([\s\S]*?)<\/p>|<li\b[^>]*>([\s\S]*?)<\/li>|<hr\s*\/?>/gi
  while ((m = itemRe.exec(html)) !== null) {
    if (m[1]) {
      // heading
      const level = m[1].toLowerCase()
      const text = inlineToText(m[2])
      if (!text) continue
      const md = level === 'h1' || level === 'h2' ? `## ${text}` : level === 'h3' ? `### ${text}` : `#### ${text}`
      out.push('', md, '')
    } else if (m[3] !== undefined) {
      const text = inlineToText(m[3])
      if (text) out.push('', text, '')
    } else if (m[4] !== undefined) {
      const text = inlineToText(m[4])
      if (text) out.push(`- ${text}`)
    } else {
      // hr
      out.push('')
    }
    lastIndex = itemRe.lastIndex
  }
  void blockRe
  void lastIndex

  let md = out.join('\n').replace(/\n{3,}/g, '\n\n').trim()
  // Guard: if extraction produced almost nothing, fall back to full strip.
  if (md.replace(/[#\-\s]/g, '').length < 40) {
    md = stripTags(html)
  }
  return md
}

const contentBlock = (markdown: string) => ({
  blockType: 'content',
  contentFields: { columnOne: rt(markdown), layout: 'oneColumn', settings: {} },
})

/** Chunk very long markdown into multiple content blocks at heading boundaries
 * so no single Lexical field is enormous. */
const chunkMarkdown = (md: string, maxChars = 6000): string[] => {
  if (md.length <= maxChars) return [md]
  const parts: string[] = []
  const sections = md.split(/\n(?=## )/)
  let buf = ''
  for (const s of sections) {
    if ((buf + '\n' + s).length > maxChars && buf) {
      parts.push(buf.trim())
      buf = s
    } else {
      buf = buf ? buf + '\n' + s : s
    }
  }
  if (buf.trim()) parts.push(buf.trim())
  return parts
}

const main = async () => {
  const payload: any = await getPayload({ config: configPromise })
  const pages: any[] = JSON.parse(fs.readFileSync(EXPORT, 'utf8')).result

  let updated = 0
  let skippedNoLegacy = 0
  let skippedNotInDb = 0
  let failed = 0
  let i = 0

  for (const sp of pages) {
    i++
    const slug: string | undefined = sp.slug?.current
    if (!slug) continue
    const legacy = (sp.blocks || []).find((b: any) => b._type === 'legacy-rich-content' && b.contentRaw)
    if (!legacy) {
      skippedNoLegacy++
      continue
    }

    const md = htmlToMarkdown(String(legacy.contentRaw))
    if (!md || md.length < 40) {
      skippedNoLegacy++
      continue
    }

    // find the Payload page
    const found = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const doc = found.docs[0]
    if (!doc) {
      skippedNotInDb++
      continue
    }

    const blocks = chunkMarkdown(md).map((chunk) => contentBlock(chunk))

    try {
      await payload.update({
        collection: 'pages',
        id: doc.id,
        data: { layout: blocks, _status: 'published' },
        overrideAccess: true,
      })
      updated++
      if (i % 25 === 0)
        console.log(`  ...${i}/${pages.length} (updated=${updated} noLegacy=${skippedNoLegacy} notInDb=${skippedNotInDb} failed=${failed})`)
    } catch (e: any) {
      console.warn(`  ! update failed ${slug}: ${e.message}`)
      failed++
    }
  }

  console.log(
    `\nDONE legacy pages → content blocks: updated=${updated} skipped(noLegacy)=${skippedNoLegacy} skipped(notInDb)=${skippedNotInDb} failed=${failed} total=${pages.length}`,
  )
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
