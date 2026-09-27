/**
 * enhance-content-pages.ts
 * ------------------------
 * 721 legacy pages render as a single `content` block — a raw wall of text with
 * no closing conversion point. This appends a WhatsApp CTA to every page whose
 * layout has no CTA yet, so each page ends with a clear next step (and reads as
 * a finished page, not a text dump). Idempotent — skips pages that already have
 * a whatsappCta / cta block.
 *
 * Run: ./node_modules/.bin/tsx scripts/enhance-content-pages.ts
 */
import 'dotenv/config'
import { config as loadEnv } from 'dotenv'
import { getPayload } from 'payload'

import configPromise from '../src/payload.config'

loadEnv({ path: '.env.local', override: true })

const WA = 'https://wa.me/6285799520350'

const ctaBlock = (title: string) => ({
  blockType: 'whatsappCta',
  whatsappFields: {
    heading: `Butuh bantuan soal ${title}?`,
    body: 'Konsultasikan kebutuhan Anda dengan tim Kotacom — respons cepat via WhatsApp, tanpa biaya konsultasi.',
    context: 'service',
    variant: 'hero',
    label: 'Konsultasi via WhatsApp',
    align: 'center',
    settings: {},
  },
})

const main = async () => {
  const payload: any = await getPayload({ config: configPromise })
  let page = 1
  let updated = 0
  let skipped = 0
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
      const layout: any[] = doc.layout || []
      const hasCta = layout.some((b) => b.blockType === 'whatsappCta' || b.blockType === 'cta')
      // Only enhance real content pages (skip empty / already-structured money pages).
      if (hasCta || layout.length === 0) {
        skipped++
        continue
      }
      const title = doc.title || 'layanan Kotacom'
      try {
        await payload.update({
          collection: 'pages',
          id: doc.id,
          data: { layout: [...layout, ctaBlock(title)] },
          overrideAccess: true,
        })
        updated++
        if (updated % 100 === 0) console.log(`  ...appended CTA to ${updated}`)
      } catch (e: any) {
        console.warn(`  ! ${doc.slug}: ${e.message}`)
      }
    }
    if (!res.hasNextPage) break
    page++
  }

  console.log(`\nDONE: appended closing CTA to ${updated} pages, skipped ${skipped}`)
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
