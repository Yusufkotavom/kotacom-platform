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

/**
 * Per-page unique CRO content: a real, verifiable trust bar (no fabricated
 * stats/testimonials) and an objection-handling comparison. Keeps each money
 * page distinct instead of a generic shared skeleton.
 */
const CRO: Record<string, {
  trust: string
  compareIntro: string
  compareOther: string
  compareRows: { feature: string; ours: string; theirs: string }[]
}> = {
  percetakan: {
    trust:
      '## Dipercaya sejak 2008\n\n- Melayani percetakan bisnis dari Sidoarjo & Surabaya untuk klien seluruh Indonesia\n- Pre-press checking sebelum naik cetak — bukan asal terima file\n- Konsultasi & revisi spesifikasi via WhatsApp, respons di hari yang sama',
    compareIntro:
      '## Kenapa hasil cetak sering mengecewakan?\n\nMasalah termahal di percetakan bukan harga per lembar, tapi keputusan yang diambil terburu-buru. Begini bedanya:',
    compareOther: 'Percetakan Biasa',
    compareRows: [
      { feature: 'Cek file sebelum cetak', ours: 'Pre-press checking (margin, resolusi, warna)', theirs: 'Langsung cetak, risiko di Anda' },
      { feature: 'Pilih material', ours: 'Diarahkan ke fungsi akhir', theirs: 'Sekadar yang termurah' },
      { feature: 'Timeline', ours: 'Disepakati & dipantau di depan', theirs: 'Sering molor tanpa kabar' },
      { feature: 'Konsultasi', ours: 'WhatsApp langsung ke tim', theirs: 'Antre di loket' },
    ],
  },
  'pembuatan-website': {
    trust:
      '## Website yang bekerja, bukan sekadar online\n\n- Portofolio nyata: company profile, toko online, hingga landing funnel\n- Dibangun cepat, modern, dan siap tampil rapi di mobile\n- Dukungan & revisi via WhatsApp — tim, bukan bot',
    compareIntro:
      '## Kenapa banyak website tidak menghasilkan?\n\nWebsite yang bagus di mata belum tentu jelas di kepala pengunjung. Begini pendekatan kami:',
    compareOther: 'Jasa Website Biasa',
    compareRows: [
      { feature: 'Fokus utama', ours: 'Konversi & kejelasan pesan', theirs: 'Sekadar terlihat "keren"' },
      { feature: 'Struktur konten', ours: 'Diarahkan ke aksi pengunjung', theirs: 'Template seadanya' },
      { feature: 'Mobile', ours: 'Dites di perangkat nyata', theirs: 'Sering berantakan di HP' },
      { feature: 'Setelah launch', ours: 'Didampingi & bisa dikembangkan', theirs: 'Ditinggal begitu saja' },
    ],
  },
  software: {
    trust:
      '## Software yang mengikuti proses Anda\n\n- Mulai dari scope yang jelas, bukan fitur yang menumpuk\n- Build bertahap: MVP dulu, kembangkan sesuai kebutuhan nyata\n- Tim lokal Sidoarjo & Surabaya, komunikasi via WhatsApp',
    compareIntro:
      '## Kenapa software custom sering gagal dipakai?\n\nBukan karena kurang fitur — tapi karena scope yang kabur. Begini bedanya:',
    compareOther: 'Vendor Software Biasa',
    compareRows: [
      { feature: 'Titik mulai', ours: 'Petakan proses & prioritas', theirs: 'Langsung tumpuk fitur' },
      { feature: 'Cara build', ours: 'Bertahap, terukur, bisa dievaluasi', theirs: 'Sekali jadi, sulit diubah' },
      { feature: 'Role & approval', ours: 'Alur kerja nyata dipetakan', theirs: 'Generic, tidak sesuai lapangan' },
      { feature: 'Pengembangan', ours: 'Bisa lanjut bertahap', theirs: 'Terkunci, mahal untuk ubah' },
    ],
  },
  'sistem-pos': {
    trust:
      '## Sistem POS yang sesuai cara Anda berjualan\n\n- Untuk retail, F&B, minimarket, hingga multi-outlet\n- Setup, migrasi data, dan pelatihan operator — bukan cuma instal\n- Dukungan lokal Sidoarjo & Surabaya via WhatsApp',
    compareIntro:
      '## Kenapa banyak kasir digital malah merepotkan?\n\nKarena dipaksakan seragam untuk semua bisnis. Begini pendekatan kami:',
    compareOther: 'Aplikasi Kasir Umum',
    compareRows: [
      { feature: 'Penyesuaian', ours: 'Mengikuti alur jualan Anda', theirs: 'Fitur seragam, dipaksakan' },
      { feature: 'Setup', ours: 'Migrasi data + pelatihan operator', theirs: 'Instal, sisanya urus sendiri' },
      { feature: 'Laporan', ours: 'Relevan untuk keputusan harian', theirs: 'Data mentah membingungkan' },
      { feature: 'Dukungan', ours: 'Tim lokal, respons cepat', theirs: 'Tiket antre, kadang bahasa asing' },
    ],
  },
  _default: {
    trust:
      '## Mitra IT & percetakan sejak 2008\n\n- Dua kantor: Sidoarjo & Surabaya, melayani seluruh Indonesia\n- Alur kerja yang jelas: masalah → solusi → bukti → langkah\n- Konsultasi langsung via WhatsApp',
    compareIntro: '## Pendekatan yang berbeda\n\nKami memprioritaskan kejelasan sebelum eksekusi:',
    compareOther: 'Cara Biasa',
    compareRows: [
      { feature: 'Titik mulai', ours: 'Pahami kebutuhan dulu', theirs: 'Langsung eksekusi' },
      { feature: 'Komunikasi', ours: 'WhatsApp langsung ke tim', theirs: 'Berlapis & lambat' },
      { feature: 'Hasil', ours: 'Terukur & bisa dievaluasi', theirs: 'Sulit dipastikan' },
    ],
  },
}

const heroFor = (title: string, eyebrow: string, description: string, ctaLabel: string, ctaHref: string) => ({
  type: 'default',
  // pageTitle (the H1) is rendered by DefaultHero from the page `title` field,
  // so richText carries the eyebrow/tagline — not a duplicate "# title".
  richText: eyebrow ? rt(eyebrow) : undefined,
  description: description ? rt(description) : undefined,
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

/** Trust/credibility statement — real, verifiable credentials (no fabricated stats). */
const statementBlock = (markdown: string) => ({
  blockType: 'statement',
  statementFields: { richText: rt(markdown), settings: {} },
})

/** Objection-handling comparison: "pendekatan Kotacom" vs "cara biasa". */
const comparisonBlock = (
  intro: string,
  colOne: string,
  colTwo: string,
  rows: { feature: string; ours: string; theirs: string }[],
) => ({
  blockType: 'comparisonTable',
  comparisonTableFields: {
    introContent: rt(intro),
    header: { tableTitle: 'Aspek', columnOneHeader: colOne, columnTwoHeader: colTwo },
    rows: rows.map((r) => ({
      feature: r.feature,
      columnOne: r.ours,
      columnOneCheck: true,
      columnTwo: r.theirs,
      columnTwoCheck: false,
    })),
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

const buildLayout = (struct: Struct, title: string, slug: string): any[] => {
  const layout: any[] = []
  const cro = CRO[slug] || CRO._default

  // 1. Intro — reframed as the customer's problem (pain-first).
  if (struct.intro) layout.push(contentBlock(struct.intro))

  // 2. Trust bar — real, verifiable credentials (no fabricated stats/testimonials).
  layout.push(statementBlock(cro.trust))

  // 3. Highlights → why-us bullets.
  if (Array.isArray(struct.highlights) && struct.highlights.length) {
    layout.push(contentBlock('## Mengapa Kotacom\n\n' + struct.highlights.map((h: string) => `- ${h}`).join('\n')))
  }

  // 4. Features → benefit cardGrid.
  if (Array.isArray(struct.features) && struct.features.length) {
    layout.push(cardGridBlock('Keunggulan Layanan', struct.features.map((f: any) => ({ title: f.title, description: f.description }))))
  }

  // 5. Process → steps.
  if (Array.isArray(struct.process) && struct.process.length) {
    const steps = struct.process.map((p: any, idx: number) =>
      typeof p === 'string' ? { title: `Langkah ${idx + 1}`, body: p } : { title: p.title, body: p.description || p.body || '' },
    )
    layout.push(stepsBlock('Cara Kami Bekerja', steps))
  }

  // 6. Service types → cardGrid with links.
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

  // 7. Objection handling — comparison "Kotacom vs cara biasa".
  layout.push(comparisonBlock(cro.compareIntro, 'Pendekatan Kotacom', cro.compareOther, cro.compareRows))

  // 8. Pricing → pricing block.
  if (Array.isArray(struct.pricingPlans) && struct.pricingPlans.length) {
    layout.push(pricingBlock(struct.pricingPlans))
  }

  // 9. Long guide (extra prose) if present.
  if (struct.longGuide && typeof struct.longGuide === 'string') {
    layout.push(contentBlock(struct.longGuide))
  }

  // 10. FAQ.
  if (Array.isArray(struct.faqs) && struct.faqs.length) {
    layout.push(faqBlock(struct.faqs))
  }

  // 11. Final CTA.
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
    const layout = buildLayout(struct, title, slug)

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
