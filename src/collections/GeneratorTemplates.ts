import type { CollectionConfig } from 'payload'

import { isAdmin } from '@root/access/isAdmin'
import { themeField } from '@root/fields/blockFields'

/**
 * A reusable page/post *skeleton*. Templates are block stacks with `{{token}}`
 * placeholders and SEO patterns; the runner clones one per dataset row and
 * fills the tokens (and, in AI mode, the `aiContent` blocks).
 *
 * `layout`/`fieldBlocks` intentionally declare `blocks: []` (no blockReferences):
 * a template may compose ANY registered block type, and it is never rendered
 * directly — only the docs cloned from it are.
 */
export const GeneratorTemplates: CollectionConfig = {
  slug: 'generator-templates',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ['name', 'entityType', 'routeBase', 'updatedAt'],
    group: 'Generator',
    useAsTitle: 'name',
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', admin: { width: '60%' }, label: 'Name', required: true },
        {
          name: 'entityType',
          type: 'select',
          admin: { width: '40%' },
          defaultValue: 'page',
          label: 'Entity Type',
          options: [
            { label: 'Page', value: 'page' },
            { label: 'Post', value: 'post' },
          ],
          required: true,
        },
      ],
    },
    {
      name: 'routeBase',
      type: 'text',
      admin: { description: 'Awalan rute, mis. /percetakan/cetak-buku. Kosong untuk post (flat /posts/<slug>).' },
      label: 'Route Base',
    },
    {
      name: 'slugPattern',
      type: 'text',
      admin: { description: 'Pola slug, mis. {{routeBase}}/{{city}}. Kosong = <routeBase>/<slug(city|keyword)>.' },
      label: 'Slug Pattern',
    },
    {
      name: 'h1Pattern',
      type: 'text',
      admin: { description: 'Pola judul/H1, mis. {{primaryKeyword}} di {{city}}.' },
      label: 'H1 Pattern',
    },
    {
      name: 'seoTitlePattern',
      type: 'text',
      admin: { description: 'Pola meta title (dinormalisasi 30–70 char).' },
      label: 'SEO Title Pattern',
    },
    {
      name: 'seoDescriptionPattern',
      type: 'text',
      admin: { description: 'Pola meta description (dinormalisasi 110–170 char).' },
      label: 'SEO Description Pattern',
    },
    {
      name: 'tokens',
      type: 'array',
      admin: { description: 'Token kustom & pemetaannya ke kolom dataset (opsional).' },
      fields: [
        { name: 'name', type: 'text', label: 'Token', required: true },
        {
          name: 'sourceField',
          type: 'text',
          admin: { description: 'Kolom di data baris dataset (default: nama token).' },
          label: 'Source Field',
        },
        { name: 'fallbackValue', type: 'text', label: 'Fallback Value' },
      ],
      label: 'Custom Tokens',
    },
    {
      name: 'hero',
      type: 'group',
      fields: [
        {
          name: 'type',
          type: 'select',
          defaultValue: 'default',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'Centered Content', value: 'centeredContent' },
            { label: 'Content and Media', value: 'contentMedia' },
          ],
          required: true,
        },
        themeField(100),
        { name: 'richText', type: 'richText' },
        { name: 'description', type: 'richText' },
      ],
      label: 'Hero (page)',
    },
    {
      name: 'layout',
      type: 'blocks',
      admin: { description: 'Stack blok untuk entity page (boleh memuat blok aiContent).' },
      blockReferences: [
        'aiContent',
        'banner',
        'blogContent',
        'blogMarkdown',
        'callout',
        'cardGrid',
        'caseStudyCards',
        'caseStudiesHighlight',
        'caseStudyParallax',
        'code',
        'codeFeature',
        'comparisonTable',
        'content',
        'contentGrid',
        'cta',
        'downloadBlock',
        'exampleTabs',
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
        'whatsappCta',
      ],
      blocks: [],
      label: 'Page Blocks',
    },
    {
      name: 'fieldBlocks',
      type: 'blocks',
      admin: {
        description:
          'Fragmen field-level (opsional, belum di-inject otomatis). Hanya untuk template yang memakainya lewat apiMode.',
      },
      blockReferences: [
        'aiContent',
        'banner',
        'blogContent',
        'blogMarkdown',
        'callout',
        'cardGrid',
        'code',
        'content',
        'cta',
        'mediaBlock',
        'reusableContentBlock',
        'statement',
        'steps',
        'whatsappCta',
      ],
      blocks: [],
      label: 'Field Blocks',
    },
    {
      name: 'defaultCategory',
      type: 'relationship',
      admin: { description: 'Untuk post: kategori default.', position: 'sidebar' },
      relationTo: 'categories',
    },
    {
      name: 'defaultImage',
      type: 'upload',
      admin: { description: 'Untuk post: gambar default.', position: 'sidebar' },
      relationTo: 'media',
    },
    {
      name: 'defaultAuthors',
      type: 'relationship',
      admin: { description: 'Untuk post: author default.', position: 'sidebar' },
      hasMany: true,
      relationTo: 'users',
    },
    { name: 'notes', type: 'textarea', label: 'Notes' },
  ],
  labels: {
    plural: 'Generator Templates',
    singular: 'Generator Template',
  },
}
