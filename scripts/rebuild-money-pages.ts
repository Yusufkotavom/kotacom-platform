/**
 * rebuild-money-pages.ts
 * ----------------------
 * The top-level commercial "money" pages (/percetakan, /pembuatan-website,
 * /software, /sistem-pos, /layanan, /about, /contact) currently render as a
 * single raw `content` block. Their real, structured landing content lives in
 * the Sanity `pageTemplate.structured` field (intro, features, process,
 * serviceTypes, pricingPlans, faqs, finalCta, highlights).
 *
 * This script rebuilds each money page's HERO + LAYOUT using the Payload
 * design-system blocks (hero, content, cardGrid, steps, pricing, whatsappCta)
 * so the pages are production-ready — not raw text — and consistent with the
 * site theme.
 *
 * Idempotent: updates by slug. Run:
 *   ./node_modules/.bin/tsx scripts/rebuild-money-pages.ts
 */
import 'dotenv/config'
import { config as loadEnv } from 'dotenv'
import fs from 'fs'
import { getPayload } from 'payload'

import { lexicalFromText } from '../src/generator/lexical'
import configPromise from '../src/payload.config'

loadEnv({ path: '.env.local', override: true })

const TEMPLATES = '/tmp/sanity_export/pageTemplate.json'
const PAGELOC = '/tmp/sanity_export/pageLocation.json'
const rt = (text: string) => lexicalFromText(text) as any

const WA = 'https://wa.me/6285799520350'

// Map each money-page slug to its Sanity template id.
const PAGE_TEMPLATE: Record<string, string> = {
  percetakan: 'page-template-percetakan',
  'pembuatan-website': 'page-template-pembuatan-website',
  software: 'page-template-software',
  'sistem-pos': 'page-template-software',
  layanan: 'page-template-generic-company',
  about: 'page-template-generic-company',
  contact: 'page-template-generic-company',
}

type Struct = Record<string, any>

const heroFor = (title: string, eyebrow: string, description: string, ctaLabel: string, ctaHref: string) => ({
  type: 'default',
  richText: rt(`# ${title}`),
  description: rt([eyebrow, description].filter(Boolean).join('\n\n')),
  links: [
    {
      link: {
        type: 'custom',
        label: ctaLabel || 'Konsultasi via WhatsApp',
        url: ctaHref || WA,
        newTab: true,
      },
    },
  ],
})

const contentBlock = (markdown: string) => ({
  blockType: 'content',
  contentFields: { columnOne: rt(markdown), layout: 'oneColumn', settings: {} },
})

const cardGridBlock = (heading: string, cards: { title: string; description?: string; href?: string }[]) => ({
  blockType: 'cardGrid',
  cardGridFields: {
    richText: rt(`## ${heading}`),
    revealDescription: false,
    cards: cards
      .filter((c) => c.title)
      .map((c) => ({
        title: c.title,
        description: c.description || '',
        ...(c.href
          ? {
              enableLink: true,
              link: { type: 'custom', label: 'Selengkapnya', url: c.href, newTab: true },
            }
          : { enableLink: false }),
      })),
    settings: {},
  },
})

const stepsBlock = (heading: string, steps: { title?: string; body: string }[]) => ({
  blockType: 'steps',
  stepsFields: {
    steps: steps
      .filter((s) => s.body || s.title)
      .map((s) => ({
        content: rt([s.title ? `### ${s.title}` : '', s.body || ''].filter(Boolean).join('\n\n')),
      })),
    settings: {},
  },
})

const pricingBlock = (plans: any[]) => ({
  blockType: 'pricing',
  pricingFields: {
    plans: plans
      .filter((p) => p.name)
      .slice(0, 4)
      .map((p) => ({
        name: p.name as string,
        ...(p.price
          ? { hasPrice: true, price: String(p.price) }
          : { hasPrice: false, title: p.name as string }),
        description: p.description || '',
        enableLink: true,
        link: { type: 'custom', label: 'Konsultasi', url: WA, newTab: true },
        features: (p.items || []).filter(Boolean).map((f: string) => ({ icon: 'check', feature: f })),
      })),
    settings: {},
  },
})

const whatsappCtaBlock = (heading: string, body: string, label: string) => ({
  blockType: 'whatsappCta',
  whatsappFields: {
    heading: heading || '',
    body: body || '',
    context: 'service',
    variant: 'hero',
    label: label || 'Konsultasi via WhatsApp',
    align: 'center',
    settings: {},
  },
})

const faqBlock = (faqs: { question: string; answer: string }[]) => {
  const md =
    '## Pertanyaan yang Sering Diajukan\n\n' +
    faqs
      .filter((f) => f.question || f.answer)
      .map((f) => `### ${(f.question || '').trim()}\n\n${(f.answer || '').trim()}`)
      .join('\n\n')
  return contentBlock(md)
}

const buildLayout = (struct: Struct, title: string): any[] => {
  const layout: any[] = []

  // Intro
  if (struct.intro) layout.push(contentBlock(struct.intro))

  // Highlights → bullet content
  if (Array.isArray(struct.highlights) && struct.highlights.length) {
    layout.push(contentBlock('## Mengapa Kotacom\n\n' + struct.highlights.map((h: string) => `- ${h}`).join('\n')))
  }

  // Features → cardGrid
  if (Array.isArray(struct.features) && struct.features.length) {
    layout.push(cardGridBlock('Keunggulan Layanan', struct.features.map((f: any) => ({ title: f.title, description: f.description }))))
  }

  // Process → steps
  if (Array.isArray(struct.process) && struct.process.length) {
    const steps = struct.process.map((p: any, idx: number) =>
      typeof p === 'string' ? { title: `Langkah ${idx + 1}`, body: p } : { title: p.title, body: p.description || p.body || '' },
    )
    layout.push(stepsBlock('Cara Kami Bekerja', steps))
  }

  // Service types → cardGrid with links
  if (Array.isArray(struct.serviceTypes) && struct.serviceTypes.length) {
    layout.push(
      cardGridBlock(
        'Jenis Layanan',
        struct.serviceTypes.map((s: any) => ({
          title: s.title,
          description: s.description,
          href: s.link?.href,
        })),
      ),
    )
  }

  // Pricing → pricing block
  if (Array.isArray(struct.pricingPlans) && struct.pricingPlans.length) {
    layout.push(pricingBlock(struct.pricingPlans))
  }

  // Long guide (extra prose) if present
  if (struct.longGuide && typeof struct.longGuide === 'string') {
    layout.push(contentBlock(struct.longGuide))
  }

  // FAQ
  if (Array.isArray(struct.faqs) && struct.faqs.length) {
    layout.push(faqBlock(struct.faqs))
  }

  // Final CTA
  layout.push(
    whatsappCtaBlock(
      struct.finalCtaTitle || `Diskusikan kebutuhan ${title} Anda`,
      struct.finalCtaDescription || struct.description || '',
      struct.ctaLabel || 'Konsultasi via WhatsApp',
    ),
  )

  return layout
}

const main = async () => {
  const payload: any = await getPayload({ config: configPromise })
  const templates: any[] = JSON.parse(fs.readFileSync(TEMPLATES, 'utf8')).result
  const templateById = new Map<string, any>(templates.map((t) => [t._id, t]))
  const pageLocs: any[] = JSON.parse(fs.readFileSync(PAGELOC, 'utf8')).result
  const pageLocBySlug = new Map<string, any>()
  for (const pl of pageLocs) {
    const slug = pl.slug?.current || (pl.route || '').replace(/^\//, '')
    if (slug) pageLocBySlug.set(slug, pl)
  }

  let updated = 0
  let skipped = 0

  for (const [slug, templateId] of Object.entries(PAGE_TEMPLATE)) {
    const tmpl = templateById.get(templateId)
    if (!tmpl) {
      console.warn(`  ! template ${templateId} not found for ${slug}`)
      skipped++
      continue
    }
    const struct: Struct = tmpl.structured || {}
    // Page-location may override keyword/description for this specific slug.
    const pl = pageLocBySlug.get(slug)
    const plStruct = pl?.structured || {}

    const found = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const doc = found.docs[0]
    if (!doc) {
      console.warn(`  ! page ${slug} not in DB, skipping`)
      skipped++
      continue
    }

    const title = plStruct.primaryKeyword || struct.primaryKeyword || doc.title || slug
    const eyebrow = tmpl.heroEyebrow || ''
    const description = plStruct.description || struct.description || ''
    const ctaLabel = plStruct.ctaLabel || struct.ctaLabel || 'Konsultasi via WhatsApp'
    const ctaHref = plStruct.ctaLink?.href || struct.ctaLink?.href || WA

    const hero = heroFor(title, eyebrow, description, ctaLabel, ctaHref)
    const layout = buildLayout(struct, title)

    try {
      await payload.update({
        collection: 'pages',
        id: doc.id,
        data: {
          title,
          fullTitle: title,
          description,
          breadcrumbs: [{ label: title, url: `/${slug}` }],
          hero,
          layout,
          _status: 'published',
          meta: {
            title: (title.length > 70 ? title.slice(0, 69) + '…' : title),
            description: (description || title).slice(0, 155),
          },
        },
        overrideAccess: true,
      })
      updated++
      console.log(`  ✓ ${slug} — hero + ${layout.length} blocks (${layout.map((b) => b.blockType).join(',')})`)
    } catch (e: any) {
      console.warn(`  ! update failed ${slug}: ${e.message}`)
      skipped++
    }
  }

  console.log(`\nDONE money pages: updated=${updated} skipped=${skipped}`)
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
