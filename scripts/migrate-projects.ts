/**
 * migrate-projects.ts
 * --------------------
 * Migrate the 162 kotacom.id Sanity `project` documents (portfolio / website
 * showcase items) into the Payload `products` collection with
 * `offeringType: 'portfolio'`, so they render as real pages at `/produk/<slug>`
 * using the existing block/design system — instead of a redirect to the hub.
 *
 * Source of truth: /tmp/sanity_export/project.json (exported from the live
 * kotacom.id Sanity dataset, projectId b017f7tl / dataset production).
 *
 * Idempotent: upserts by slug. Images are downloaded from the Sanity CDN and
 * uploaded to Media once (deduped by generated filename).
 *
 * Run: ./node_modules/.bin/tsx scripts/migrate-projects.ts
 */
import 'dotenv/config'
import { config as loadEnv } from 'dotenv'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'

import { lexicalFromText } from '../src/generator/lexical'
import configPromise from '../src/payload.config'

loadEnv({ path: '.env.local', override: true })

const SANITY_PROJECT = 'b017f7tl'
const SANITY_DATASET = 'production'
const EXPORT = '/tmp/sanity_export/project.json'
const IMG_CACHE = '/tmp/sanity_img_cache'

const rt = (text: string) => lexicalFromText(text) as any

/* -------- Portable Text -> markdown (headings, bullets, numbered) -------- */
type PtSpan = { text?: string; marks?: string[] }
type PtBlock = {
  _type?: string
  style?: string
  listItem?: string
  level?: number
  children?: PtSpan[]
}

const spanToMd = (s: PtSpan): string => {
  let t = s.text ?? ''
  if (!t) return ''
  const marks = s.marks ?? []
  if (marks.includes('strong')) t = `**${t}**`
  if (marks.includes('em')) t = `*${t}*`
  return t
}

const portableTextToMarkdown = (blocks: PtBlock[] | undefined): string => {
  if (!Array.isArray(blocks)) return ''
  const lines: string[] = []
  for (const b of blocks) {
    if (b._type !== 'block') continue
    const text = (b.children ?? []).map(spanToMd).join('').trim()
    if (!text) {
      continue
    }
    if (b.listItem === 'bullet') {
      lines.push(`- ${text}`)
    } else if (b.listItem === 'number') {
      lines.push(`1. ${text}`)
    } else if (b.style === 'h1' || b.style === 'h2') {
      lines.push('', `## ${text}`, '')
    } else if (b.style === 'h3') {
      lines.push('', `### ${text}`, '')
    } else if (b.style === 'h4') {
      lines.push('', `#### ${text}`, '')
    } else if (b.style === 'blockquote') {
      lines.push('', `> ${text}`, '')
    } else {
      lines.push('', text, '')
    }
  }
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

const contentBlock = (markdown: string) => ({
  blockType: 'content',
  contentFields: { columnOne: rt(markdown), layout: 'oneColumn', settings: {} },
})

/* ------------------------- Sanity image handling ------------------------- */
// asset ref: image-<hash>-<WxH>-<ext>  ->  cdn url + local filename
const parseAssetRef = (ref?: string): { url: string; filename: string; ext: string } | null => {
  if (!ref || !ref.startsWith('image-')) return null
  const rest = ref.slice('image-'.length)
  const lastDash = rest.lastIndexOf('-')
  if (lastDash === -1) return null
  const ext = rest.slice(lastDash + 1)
  const namePart = rest.slice(0, lastDash) // <hash>-<WxH>
  const filename = `${namePart}.${ext}`
  const url = `https://cdn.sanity.io/images/${SANITY_PROJECT}/${SANITY_DATASET}/${filename}`
  return { url, filename, ext }
}

const downloadImage = async (url: string, filename: string): Promise<string | null> => {
  fs.mkdirSync(IMG_CACHE, { recursive: true })
  const dest = path.join(IMG_CACHE, filename)
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) return dest
  try {
    const res = await fetch(url)
    if (!res.ok) {
      console.warn(`  ! image ${res.status} ${url}`)
      return null
    }
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length === 0) return null
    fs.writeFileSync(dest, buf)
    return dest
  } catch (e: any) {
    console.warn(`  ! image fetch failed ${url}: ${e.message}`)
    return null
  }
}

const mimeFor = (ext: string): string =>
  ({ jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml' } as Record<string, string>)[
    ext.toLowerCase()
  ] || 'image/jpeg'

const main = async () => {
  const payload: any = await getPayload({ config: configPromise })
  const projects: any[] = JSON.parse(fs.readFileSync(EXPORT, 'utf8')).result

  // Media cache: filename -> media id (query existing first so re-runs dedupe)
  const mediaByFilename = new Map<string, string>()
  const ensureMedia = async (assetRef?: string, alt?: string): Promise<string | null> => {
    const parsed = parseAssetRef(assetRef)
    if (!parsed) return null
    if (mediaByFilename.has(parsed.filename)) return mediaByFilename.get(parsed.filename)!
    // already uploaded?
    const existing = await payload.find({
      collection: 'media',
      where: { filename: { equals: parsed.filename } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (existing.docs[0]) {
      mediaByFilename.set(parsed.filename, existing.docs[0].id as string)
      return existing.docs[0].id as string
    }
    const localPath = await downloadImage(parsed.url, parsed.filename)
    if (!localPath) return null
    try {
      const created = await payload.create({
        collection: 'media',
        data: { alt: alt || parsed.filename },
        filePath: localPath,
        overrideAccess: true,
      })
      mediaByFilename.set(parsed.filename, created.id as string)
      return created.id as string
    } catch (e: any) {
      console.warn(`  ! media create failed ${parsed.filename}: ${e.message}`)
      return null
    }
  }

  // fallback featured image (products.featuredImage is required)
  let fallbackImageId: string | null = null
  const getFallbackImage = async (): Promise<string | null> => {
    if (fallbackImageId) return fallbackImageId
    const ph = await payload.find({
      collection: 'media',
      where: { filename: { like: 'placeholder' } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (ph.docs[0]) {
      fallbackImageId = ph.docs[0].id as string
      return fallbackImageId
    }
    const any = await payload.find({ collection: 'media', limit: 1, depth: 0, overrideAccess: true })
    fallbackImageId = (any.docs[0]?.id as string) ?? null
    return fallbackImageId
  }

  let created = 0
  let updated = 0
  let skipped = 0
  let i = 0

  for (const proj of projects) {
    i++
    const slug: string | undefined = proj.slug?.current
    const title: string | undefined = proj.title
    if (!slug || !title) {
      skipped++
      continue
    }

    const featuredImage =
      (await ensureMedia(proj.image?.asset?._ref, proj.image?.alt || title)) ||
      (await getFallbackImage())
    if (!featuredImage) {
      console.warn(`  ! no image available for ${slug}, skipping`)
      skipped++
      continue
    }

    // Body -> content block. Prepend an intro if body is empty.
    const bodyMd = portableTextToMarkdown(proj.body)
    const introMd = proj.excerpt ? `${proj.excerpt}` : ''
    const layout: any[] = []
    if (introMd) layout.push(contentBlock(introMd))
    if (bodyMd) layout.push(contentBlock(bodyMd))
    if (layout.length === 0) {
      layout.push(contentBlock(`## ${title}\n\nProyek portofolio Kotacom.`))
    }

    // specs from structured project metadata
    const specs: { label: string; value?: string }[] = []
    if (proj.clientName) specs.push({ label: 'Klien', value: String(proj.clientName) })
    if (proj.industry) specs.push({ label: 'Industri', value: String(proj.industry) })
    if (proj.projectType) specs.push({ label: 'Jenis Proyek', value: String(proj.projectType) })
    if (proj.completionYear) specs.push({ label: 'Tahun', value: String(proj.completionYear) })
    if (proj.previewUrl) specs.push({ label: 'Preview', value: String(proj.previewUrl) })
    if (proj.projectUrl) specs.push({ label: 'URL', value: String(proj.projectUrl) })

    const data: Record<string, unknown> = {
      _status: 'published',
      title,
      offeringType: 'portfolio',
      shortDescription: proj.excerpt || undefined,
      category: proj.industry || 'Portofolio',
      featuredImage,
      specs: specs.length ? specs : undefined,
      layout,
      slug,
      meta: {
        title: (() => {
          // The SEO plugin appends the site name, so keep just the page title
          // (trimmed to the 70-char field limit) to avoid a doubled suffix.
          const t = title.trim()
          return t.length > 70 ? t.slice(0, 69).trim() + '…' : t
        })(),
        description: (proj.excerpt || `Portofolio ${title} oleh Kotacom.`).slice(0, 155),
      },
    }

    const found = await payload.find({
      collection: 'products',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    try {
      if (found.docs[0]) {
        await payload.update({ collection: 'products', id: found.docs[0].id, data, overrideAccess: true })
        updated++
      } else {
        await payload.create({ collection: 'products', data, overrideAccess: true })
        created++
      }
      if (i % 20 === 0) console.log(`  ...${i}/${projects.length} (created=${created} updated=${updated} skipped=${skipped})`)
    } catch (e: any) {
      console.warn(`  ! upsert failed ${slug}: ${e.message}`)
      skipped++
    }
  }

  console.log(`\nDONE projects→products(portfolio): created=${created} updated=${updated} skipped=${skipped} total=${projects.length}`)
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
