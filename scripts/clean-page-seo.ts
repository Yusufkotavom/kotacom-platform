/**
 * clean-page-seo.ts
 * -----------------
 * 977 of the migrated pages carry a placeholder `meta.description` like
 * "Halaman <title> - Kotacom Dapatkan pendekatan terstruktur…" and some carry a
 * "Sales Landing Page - …" style `meta.title`. These are worse for SEO than a
 * description derived from the page's real content.
 *
 * This clears those placeholder meta values so the `generateMetadata` layer
 * falls back to the real, content-extracted description (see
 * extractDescriptionFromLayout) and the normalized page title. Real,
 * hand/AI-written meta values are left untouched.
 *
 * Idempotent. Run: ./node_modules/.bin/tsx scripts/clean-page-seo.ts
 */
import 'dotenv/config'
import { config as loadEnv } from 'dotenv'
import { getPayload } from 'payload'

import { extractDescriptionFromLayout } from '../src/seo/schema'
import { normalizeSeoDescription } from '../src/seo/normalize'
import configPromise from '../src/payload.config'

loadEnv({ path: '.env.local', override: true })

const PLACEHOLDER_DESC = /Dapatkan pendekatan terstruktur|^Halaman .+ - Kotacom/i
const PLACEHOLDER_TITLE = /^(Halaman\b|Sales Landing Page\b)/i

const main = async () => {
  const payload: any = await getPayload({ config: configPromise })

  let page = 1
  let updated = 0
  let scanned = 0
  const limit = 200

  while (true) {
    const res = await payload.find({
      collection: 'pages',
      limit,
      page,
      depth: 0,
      overrideAccess: true,
    })
    for (const doc of res.docs) {
      scanned++
      const meta = doc.meta || {}
      const md: string = meta.description || ''
      const mt: string = meta.title || ''
      const descIsPlaceholder = md && PLACEHOLDER_DESC.test(md)
      const titleIsPlaceholder = mt && PLACEHOLDER_TITLE.test(mt)
      if (!descIsPlaceholder && !titleIsPlaceholder) continue

      const newMeta: Record<string, unknown> = { ...meta }
      if (descIsPlaceholder) {
        // Prefer a real description from the page content; else drop the
        // placeholder so generateMetadata can build one from the title.
        const real = extractDescriptionFromLayout(doc.layout)
        newMeta.description = real ? normalizeSeoDescription(real) : undefined
      }
      if (titleIsPlaceholder) {
        // Drop placeholder title → the page `title` field drives SEO title.
        newMeta.title = undefined
      }

      try {
        await payload.update({
          collection: 'pages',
          id: doc.id,
          data: { meta: newMeta },
          overrideAccess: true,
        })
        updated++
        if (updated % 100 === 0) console.log(`  ...updated ${updated} (scanned ${scanned})`)
      } catch (e: any) {
        console.warn(`  ! ${doc.slug}: ${e.message}`)
      }
    }
    if (!res.hasNextPage) break
    page++
  }

  console.log(`\nDONE page SEO cleanup: scanned=${scanned} updated=${updated}`)
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
