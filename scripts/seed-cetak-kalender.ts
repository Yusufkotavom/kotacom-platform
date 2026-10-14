/**
 * Create 10 "jasa cetak kalender" landing pages, one per region, using the
 * standard generator toolkit (src/generator/toolkit.ts).
 *
 * This doubles as the reference example for how to build a generation job:
 * define a CSV + template blocks, then call `buildAndRun`. Deterministic
 * (aiMode:off) so it needs no AI gateway. Idempotent by name/lineage.
 *
 * Run: ./node_modules/.bin/tsx scripts/seed-cetak-kalender.ts
 */
import 'dotenv/config'
import { config as loadEnv } from 'dotenv'
import { getPayload } from 'payload'

import configPromise from '../src/payload.config'
import { buildAndRun, listGenerated, rt } from '../src/generator/toolkit'

loadEnv({ path: '.env.local', override: true })

// region, provinsi, angle lokal — token unik per halaman.
const REGIONS: [string, string, string][] = [
  ['Jakarta', 'DKI Jakarta', 'pengiriman cepat ke seluruh area Jabodetabek'],
  ['Bandung', 'Jawa Barat', 'cocok untuk UMKM kreatif dan komunitas di Bandung'],
  ['Surabaya', 'Jawa Timur', 'melayani korporat dan distributor se-Surabaya Raya'],
  ['Medan', 'Sumatera Utara', 'siap kirim ke berbagai kota di Sumatera Utara'],
  ['Semarang', 'Jawa Tengah', 'ideal untuk instansi dan sekolah di Semarang'],
  ['Makassar', 'Sulawesi Selatan', 'melayani bisnis dan pemerintahan di Makassar'],
  ['Yogyakarta', 'DI Yogyakarta', 'favorit komunitas kampus dan kreatif Jogja'],
  ['Denpasar', 'Bali', 'mendukung hotel, vila, dan usaha pariwisata di Bali'],
  ['Palembang', 'Sumatera Selatan', 'melayani UMKM dan korporat di Palembang'],
  ['Balikpapan', 'Kalimantan Timur', 'siap melayani sektor energi dan bisnis di Balikpapan'],
]

const csv = [
  'city,provinsi,service,offer,localCondition,secondaryKeywords',
  ...REGIONS.map(
    ([city, prov, angle]) =>
      `${city},${prov},Cetak Kalender,"Gratis desain 1x revisi untuk cetak kalender di ${city}","${angle}","cetak kalender ${city},kalender dinding ${city},kalender meja ${city}"`,
  ),
].join('\n')

const main = async () => {
  const payload = await getPayload({ config: configPromise })

  const { programId, result } = await buildAndRun(payload, {
    csv,
    dataset: {
      keyColumn: 'city',
      name: 'Cetak Kalender per Region',
      notes: '10 region untuk landing page jasa cetak kalender.',
    },
    mode: 'generate',
    program: {
      name: 'Cetak Kalender Regional',
      outputStatus: 'published',
      routeBase: 'percetakan/cetak-kalender',
      writeMode: 'overwrite',
    },
    template: {
      entityType: 'page',
      h1Pattern: 'Jasa Cetak Kalender di {{city}}',
      hero: {
        description: rt('Layanan {{service}} berkualitas untuk {{city}}, {{provinsi}} — {{localCondition}}.'),
        richText: rt('Jasa Cetak Kalender di {{city}}'),
        type: 'default',
      },
      layout: [
        { blockType: 'content', contentFields: { columnOne: rt('## Cetak Kalender {{city}} untuk Kebutuhan Bisnis & Pribadi\n\nKotacom menyediakan jasa cetak kalender di {{city}}, {{provinsi}}. {{localCondition}}. Kami mengerjakan kalender dinding, kalender meja, dan kalender custom sesuai brand Anda.'), layout: 'oneColumn', settings: {} } },
        { blockType: 'content', contentFields: { columnOne: rt('## Pilihan Produk Kalender di {{city}}\n\n- Kalender dinding (1 lembar, bulanan, atau spiral)\n- Kalender meja duduk untuk meja kerja\n- Kalender custom dengan foto & logo perusahaan\n- Finishing laminasi doff/glossy sesuai kebutuhan di {{city}}'), layout: 'oneColumn', settings: {} } },
        { blockType: 'content', contentFields: { columnOne: rt('## Kenapa Memilih Kotacom di {{city}}?\n\nKami memahami kebutuhan pasar {{provinsi}}. {{offer}}. Proses cepat, hasil rapi, dan harga bersaing untuk pelanggan {{city}}.'), layout: 'oneColumn', settings: {} } },
        { blockType: 'steps', stepsFields: { settings: {}, steps: [
          { content: rt('### 1. Konsultasi & Pilih Desain\n\nDiskusikan kebutuhan cetak kalender {{city}} Anda bersama tim kami.') },
          { content: rt('### 2. Proofing\n\nKami kirim contoh desain untuk persetujuan sebelum cetak massal.') },
          { content: rt('### 3. Produksi & Kirim\n\nKalender dicetak dan dikirim — {{localCondition}}.') },
        ] } },
        { blockType: 'content', contentFields: { columnOne: rt('## Pertanyaan Umum Cetak Kalender {{city}}\n\n### Berapa minimum order cetak kalender di {{city}}?\n\nMinimum order fleksibel; hubungi kami untuk jumlah kecil maupun partai besar.\n\n### Apakah bisa desain custom?\n\nBisa. {{offer}} untuk memastikan desain sesuai brand Anda.'), layout: 'oneColumn', settings: {} } },
        { blockType: 'whatsappCta', whatsappFields: { align: 'left', body: 'Konsultasi gratis kebutuhan cetak kalender di {{city}} sekarang.', context: 'service', heading: 'Pesan Cetak Kalender di {{city}}', label: 'Chat via WhatsApp', settings: {}, variant: 'button' } },
      ],
      name: 'Landing Jasa Cetak Kalender',
      routeBase: 'percetakan/cetak-kalender',
      seoDescriptionPattern: 'Jasa cetak kalender di {{city}}, {{provinsi}}. Kalender dinding, meja, & custom. {{offer}}. Konsultasi gratis via WhatsApp.',
      seoTitlePattern: 'Jasa Cetak Kalender {{city}} | Kotacom',
      slugPattern: '{{routeBase}}/{{city}}',
    },
  })

  console.log('program:', programId, '| totals:', JSON.stringify(result.totals))
  const pages = await listGenerated(payload, { programId })
  console.log(`\n${pages.length} halaman:`)
  for (const p of pages) console.log(`  /${p.slug}  —  ${p.title}  [${p.status}]`)

  process.exit(0)
}

main().catch((e) => {
  console.error('seed crashed:', e)
  process.exit(1)
})
