import type { Block } from 'payload'

import { blockFields } from '../../fields/blockFields'
import richText from '../../fields/richText'

export const CaseStudiesHighlight: Block = {
  slug: 'caseStudiesHighlight',
  fields: [
    blockFields({
      name: 'caseStudiesHighlightFields',
      fields: [
        {
          name: 'headline',
          type: 'text',
          label: 'Judul / Heading Block',
        },
        richText(),
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
          name: 'caseStudies',
          type: 'relationship',
          hasMany: true,
          relationTo: ['case-studies', 'posts', 'products', 'pages'],
          required: false,
          label: 'Pilih Dokumen Manual',
          admin: {
            condition: (_, siblingData) => !siblingData?.selectionMode || siblingData?.selectionMode === 'manual',
          },
        },
      ],
    }),
  ],
  labels: {
    plural: 'Universal Content Highlights (Case Study, Blog, Produk, Halaman)',
    singular: 'Universal Content Highlight',
  },
}
