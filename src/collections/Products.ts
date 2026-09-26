import type { CollectionConfig } from 'payload'

import { revalidatePath } from 'next/cache'

import { isAdmin } from '../access/isAdmin'
import { publishedOnly } from '../access/publishedOnly'
import { slugField } from '../fields/slug'
import { seoFields } from '../fields/seoFields'
import { formatPreviewURL } from '../utilities/formatPreviewURL'

/**
 * Products — Kotacom's offerings. One collection covers services, portfolio
 * pieces and physical/digital products; the `offeringType` field distinguishes
 * them. Each entry is a rich page: hero image, gallery, specs and a block
 * `layout` (same blocks as Pages), so an offering can be laid out freely.
 */
export const Products: CollectionConfig = {
  slug: 'products',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: publishedOnly,
    readVersions: isAdmin,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ['title', 'offeringType', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data }) => formatPreviewURL('products', data),
    },
    preview: (doc) => formatPreviewURL('products', doc),
    useAsTitle: 'title',
    group: 'Content',
  },
  defaultPopulate: {
    offeringType: true,
    slug: true,
    title: true,
    featuredImage: true,
    shortDescription: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'offeringType',
      type: 'select',
      defaultValue: 'service',
      options: [
        { label: 'Layanan (Service)', value: 'service' },
        { label: 'Portofolio (Portfolio)', value: 'portfolio' },
        { label: 'Produk (Product)', value: 'product' },
      ],
      required: true,
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      label: 'Ringkasan singkat',
    },
    {
      type: 'row',
      fields: [
        { name: 'category', type: 'text', admin: { width: '50%' }, label: 'Kategori' },
        { name: 'price', type: 'text', admin: { width: '50%' }, label: 'Harga / mulai dari' },
      ],
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'gallery',
      type: 'array',
      label: 'Galeri',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text' },
      ],
    },
    {
      name: 'specs',
      type: 'array',
      label: 'Spesifikasi / Fitur',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', admin: { width: '50%' }, required: true },
            { name: 'value', type: 'text', admin: { width: '50%' } },
          ],
        },
      ],
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blockReferences: [
                'callout',
                'cta',
                'cardGrid',
                'caseStudyCards',
                'caseStudiesHighlight',
                'caseStudyParallax',
                'codeFeature',
                'content',
                'contentGrid',
                'comparisonTable',
                'form',
                'hoverCards',
                'hoverHighlights',
                'linkGrid',
                'logoGrid',
                'mediaBlock',
                'mediaContent',
                'mediaContentAccordion',
                'pricing',
                'reusableContentBlock',
                'slider',
                'statement',
                'steps',
                'stickyHighlights',
                'exampleTabs',
              ],
              blocks: [],
            },
          ],
          label: 'Content',
        },
      ],
    },
    slugField(),
    seoFields(),
  ],
  hooks: {
    afterChange: [
      ({ doc }) => {
        revalidatePath(`/produk/${doc.slug}`)
        revalidatePath('/produk', 'page')
        console.log(`Revalidated: /produk/${doc.slug}`)
      },
    ],
  },
  versions: {
    drafts: true,
  },
}
