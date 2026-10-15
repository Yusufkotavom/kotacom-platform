import type { Block } from 'payload'

import { blockFields } from '../../fields/blockFields'
import richText from '../../fields/richText'

export const CaseStudyCards: Block = {
  slug: 'caseStudyCards',
  fields: [
    blockFields({
      name: 'caseStudyCardFields',
      fields: [
        {
          name: 'headline',
          type: 'text',
          label: 'Judul / Heading Block',
        },
        richText({
          name: 'introText',
          label: 'Deskripsi Pendukung (Intro)',
        }),
        {
          name: 'contentType',
          type: 'select',
          defaultValue: 'case-studies',
          label: 'Tipe Konten / Entity',
          options: [
            { label: 'Case Studies (Studi Kasus)', value: 'case-studies' },
            { label: 'Post Blog / Artikel', value: 'posts' },
            { label: 'Produk Katalog', value: 'products' },
            { label: 'Halaman (Pages)', value: 'pages' },
          ],
        },
        {
          name: 'selectionMode',
          type: 'select',
          defaultValue: 'manual',
          label: 'Metode Pengambilan Konten',
          options: [
            { label: 'Manual (Pilih Dokumen Tertentu)', value: 'manual' },
            { label: 'Latest (Terbaru Otomatis)', value: 'latest' },
            { label: 'Random (Acak Otomatis)', value: 'random' },
          ],
        },
        {
          name: 'limit',
          type: 'number',
          defaultValue: 3,
          label: 'Jumlah Konten (untuk mode Latest / Random)',
          admin: {
            condition: (_, siblingData) => siblingData?.selectionMode !== 'manual',
          },
        },
        {
          name: 'pixels',
          type: 'checkbox',
          defaultValue: true,
          label: 'Show Pixel Background?',
        },
        {
          name: 'cards',
          type: 'array',
          label: 'Daftar Konten Manual',
          admin: {
            condition: (_, siblingData) => !siblingData?.selectionMode || siblingData?.selectionMode === 'manual',
          },
          fields: [
            richText(),
            {
              name: 'caseStudy',
              type: 'relationship',
              relationTo: ['case-studies', 'posts', 'products', 'pages'],
              required: true,
              label: 'Pilih Dokumen',
            },
          ],
        },
      ],
    }),
  ],
  labels: {
    plural: 'Universal Content Cards (Case Study, Blog, Produk, Halaman)',
    singular: 'Universal Content Cards',
  },
}
