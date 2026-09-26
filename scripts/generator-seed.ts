/**
 * Seed a working generator program: one page template ("Jasa Cetak Buku per
 * kota") and one post template, each bound to a small dataset, plus the program
 * rows the runner consumes.
 *
 * Idempotent: re-running updates by name/slug. Run with:
 *   ./node_modules/.bin/tsx scripts/generator-seed.ts
 */
import 'dotenv/config'
import { config as loadEnv } from 'dotenv'
import { getPayload } from 'payload'

import { lexicalFromText } from '../src/generator/lexical'
import configPromise from '../src/payload.config'

loadEnv({ path: '.env.local', override: true })

const rt = (text: string) => lexicalFromText(text) as any

const upsert = async (
  payload: any,
  collection: string,
  where: Record<string, unknown>,
  data: Record<string, unknown>,
): Promise<any> => {
  const found = await payload.find({ collection, where, limit: 1, depth: 0, overrideAccess: true })
  if (found.docs[0]) {
    return payload.update({ collection, id: found.docs[0].id, data, overrideAccess: true })
  }
  return payload.create({ collection, data, overrideAccess: true })
}

const main = async () => {
  const payload = await getPayload({ config: configPromise })

  // Reuse existing relations.
  const category = await payload.find({
    collection: 'categories',
    where: { slug: { equals: process.env.SEED_POST_CATEGORY || 'tutorials' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const admin = await payload.find({
    collection: 'users',
    where: { email: { equals: 'admin@kotacom.dev' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const media = await payload.find({
    collection: 'media',
    where: { alt: { like: 'printshop' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const categoryId = (category.docs[0] as any)?.id
  const adminId = (admin.docs[0] as any)?.id
  const mediaId = (media.docs[0] as any)?.id
  console.log('relations:', { categoryId, adminId, mediaId })

  // -------------------------------------------------------------------------
  // PAGE template — /percetakan/cetak-buku/<kota>
  // -------------------------------------------------------------------------
  const pageTemplate = await upsert(
    payload,
    'generator-templates',
    { name: { equals: 'Cetak Buku per Kota (page)' } },
    {
      entityType: 'page',
      name: 'Cetak Buku per Kota (page)',
      routeBase: '/percetakan/cetak-buku',
      slugPattern: '{{routeBase}}/{{city}}',
      h1Pattern: 'Jasa Cetak Buku di {{city}}',
      seoTitlePattern: 'Jasa Cetak Buku {{city}} | Cepat & Berkualitas',
      seoDescriptionPattern:
        'Jasa cetak buku di {{city}} untuk penulis, penerbit, sekolah, dan perusahaan. Konsultasi gratis, cetak satuan atau massal, hasil rapi. Hubungi Kotacom.',
      hero: { type: 'default' },
      layout: [
        {
          blockType: 'aiContent',
          aiContentFields: {
            prompt:
              'Tulis paragraf pembuka yang menyapa pembaca di {{city}} dan menjelaskan bahwa Kotacom melayani jasa cetak buku (novel, buku pelajaran, company profile, buku anak) untuk pelanggan di {{city}}.',
            settings: {},
          },
        },
        {
          blockType: 'content',
          contentFields: {
            layout: 'oneColumn',
            columnOne: rt(
              'Kotacom melayani jasa cetak buku di {{city}} untuk penulis independen, penerbit, sekolah, komunitas, dan perusahaan. Mulai dari cetak satuan hingga cetakan massal.',
            ),
            settings: {},
          },
        },
        {
          blockType: 'steps',
          stepsFields: {
            steps: [
              { content: rt('### Konsultasi\n\nKirim detail naskah dan jumlah cetak di {{city}} via WhatsApp.') },
              { content: rt('### Pra-cetak\n\nPengecekan layout, ISBN, dan sampul sebelum produksi.') },
              { content: rt('### Cetak & Finishing\n\nCetak sesuai spesifikasi, lalu penjilidan dan finishing.') },
            ],
            settings: {},
          },
        },
        {
          blockType: 'aiContent',
          aiContentFields: {
            prompt:
              'Tulis bagian keunggulan dan FAQ singkat (2-3 tanya-jawab) tentang cetak buku untuk klien di {{city}}. Spesifik ke {{city}}, jangan generik.',
            settings: {},
          },
        },
        {
          blockType: 'whatsappCta',
          whatsappFields: {
            align: 'left',
            body: 'Konsultasikan kebutuhan cetak buku di {{city}} — tanya harga, jumlah, dan estimasi waktu.',
            context: 'service',
            heading: 'Butuh Cetak Buku di {{city}}?',
            label: 'Konsultasi via WhatsApp',
            settings: {},
            variant: 'button',
          },
        },
      ],
    },
  )
  console.log('page template:', pageTemplate.id)

  // -------------------------------------------------------------------------
  // POST template — article
  // -------------------------------------------------------------------------
  const postTemplate = await upsert(
    payload,
    'generator-templates',
    { name: { equals: 'Artikel Panduan (post)' } },
    {
      entityType: 'post',
      name: 'Artikel Panduan (post)',
      routeBase: '',
      slugPattern: '{{primaryKeyword}}',
      h1Pattern: '{{primaryKeyword}}',
      seoTitlePattern: '{{primaryKeyword}} | Panduan Kotacom',
      seoDescriptionPattern:
        '{{introShort}} Panduan praktis dari Kotacom untuk pelaku usaha, sekolah, dan penerbit di Indonesia.',
      hero: { type: 'default' },
      layout: [
        {
          blockType: 'aiContent',
          aiContentFields: {
            prompt:
              'Tulis paragraf pembuka artikel tentang {{primaryKeyword}} untuk pembaca di Indonesia. Edukatif, spesifik, tidak bertele-tele.',
            settings: {},
          },
        },
        {
          blockType: 'blogContent',
          blogContentFields: {
            richText: rt('## Ringkasan\n\nPanduan ini membahas {{primaryKeyword}} secara praktis.'),
            settings: {},
          },
        },
        {
          blockType: 'aiContent',
          aiContentFields: {
            prompt:
              'Tulis bagian langkah atau tips praktis terkait {{primaryKeyword}}. Gunakan daftar dan sub-judul.',
            settings: {},
          },
        },
        {
          blockType: 'blogContent',
          blogContentFields: {
            richText: rt('## Kesimpulan\n\nKonsultasikan kebutuhan Anda kepada tim Kotacom.'),
            settings: {},
          },
        },
        {
          blockType: 'aiContent',
          aiContentFields: {
            prompt:
              'Tulis bagian FAQ ringkas (3 tanya-jawab) tentang {{primaryKeyword}}.',
            settings: {},
          },
        },
      ],
    },
  )
  console.log('post template:', postTemplate.id)

  // -------------------------------------------------------------------------
  // Datasets
  // -------------------------------------------------------------------------
  const pageDataset = await upsert(
    payload,
    'generator-datasets',
    { name: { equals: 'Kota cetak buku' } },
    {
      name: 'Kota cetak buku',
      notes: 'Baris = kota target untuk halaman /percetakan/cetak-buku/<kota>.',
      rows: [
        {
          key: 'bandung',
          data: {
            city: 'Bandung',
            primaryKeyword: 'Jasa Cetak Buku Bandung',
            service: 'cetak buku',
            industry: 'percetakan buku',
            secondaryKeywords: ['cetak buku murah', 'cetak buku satuan'],
            offer: 'Konsultasi gratis cetak buku',
            localCondition: 'Bandung memiliki banyak komunitas penulis dan penerbit indie',
          },
        },
        {
          key: 'surabaya',
          data: {
            city: 'Surabaya',
            primaryKeyword: 'Jasa Cetak Buku Surabaya',
            service: 'cetak buku',
            industry: 'percetakan buku',
            secondaryKeywords: ['jasa cetak buku murah', 'cetak buku satuan'],
            offer: 'Konsultasi gratis cetak buku',
            localCondition: 'Surabaya menjadi pusat pendidikan dan penerbitan di Jawa Timur',
          },
        },
      ],
    },
  )
  console.log('page dataset:', pageDataset.id)

  const postDataset = await upsert(
    payload,
    'generator-datasets',
    { name: { equals: 'Artikel panduan' } },
    {
      name: 'Artikel panduan',
      notes: 'Baris = topik artikel blog.',
      rows: [
        {
          key: 'cara-memilih-jasa-cetak-buku-bandung',
          data: {
            city: 'Bandung',
            primaryKeyword: 'Cara Memilih Jasa Cetak Buku di Bandung',
            service: 'cetak buku',
            industry: 'percetakan buku',
            secondaryKeywords: ['jasa cetak buku', 'tips cetak buku'],
            offer: 'Panduan memilih percetakan buku',
          },
        },
      ],
    },
  )
  console.log('post dataset:', postDataset.id)

  // -------------------------------------------------------------------------
  // Programs
  // -------------------------------------------------------------------------
  const pageProgram = await upsert(
    payload,
    'generator-programs',
    { name: { equals: 'Cetak Buku per Kota' } },
    {
      name: 'Cetak Buku per Kota',
      entityType: 'page',
      template: pageTemplate.id,
      datasets: [pageDataset.id],
      aiMode: 'generate',
      aiModel: 'pro-coding',
      writeMode: 'overwrite',
      outputStatus: 'draft',
    },
  )
  console.log('page program:', pageProgram.id)

  const postProgram = await upsert(
    payload,
    'generator-programs',
    { name: { equals: 'Artikel Panduan Kotacom' } },
    {
      name: 'Artikel Panduan Kotacom',
      entityType: 'post',
      template: postTemplate.id,
      datasets: [postDataset.id],
      aiMode: 'generate',
      aiModel: 'pro-coding',
      writeMode: 'overwrite',
      outputStatus: 'draft',
      defaultCategory: categoryId,
      defaultAuthors: [adminId],
      defaultImage: mediaId,
    },
  )
  console.log('post program:', postProgram.id)

  console.log(
    JSON.stringify({ pageProgram: pageProgram.id, postProgram: postProgram.id }, null, 2),
  )
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
