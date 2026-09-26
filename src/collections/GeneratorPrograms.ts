import type { CollectionConfig } from 'payload'

import { isAdmin } from '@root/access/isAdmin'

/**
 * A program = one generation job. It binds a template to one or more datasets
 * and records the run policy (AI mode, write mode, output status). The runner
 * reads a program, iterates rows, and writes pages/posts.
 */
export const GeneratorPrograms: CollectionConfig = {
  slug: 'generator-programs',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ['name', 'entityType', 'status', 'updatedAt'],
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
      admin: { description: 'Override routeBase dari template (opsional).' },
      label: 'Route Base',
    },
    {
      name: 'template',
      type: 'relationship',
      admin: { description: 'Skeleton blok + pola SEO.' },
      relationTo: 'generator-templates',
      required: true,
    },
    {
      name: 'datasets',
      type: 'relationship',
      admin: { description: 'Sumber baris. Bila lebih dari satu, antrean digabung.' },
      hasMany: true,
      relationTo: 'generator-datasets',
      required: true,
    },
    {
      name: 'defaultCategory',
      type: 'relationship',
      admin: { description: 'Wajib untuk entityType=post: kategori.' },
      label: 'Default Category (post)',
      relationTo: 'categories',
    },
    {
      name: 'defaultAuthors',
      type: 'relationship',
      admin: { description: 'Wajib untuk entityType=post: author.' },
      hasMany: true,
      label: 'Default Authors (post)',
      relationTo: 'users',
    },
    {
      name: 'defaultImage',
      type: 'upload',
      admin: { description: 'Wajib untuk entityType=post: gambar utama.' },
      label: 'Default Image (post)',
      relationTo: 'media',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'aiMode',
          type: 'select',
          admin: { width: '33%' },
          defaultValue: 'generate',
          label: 'AI Mode',
          options: [
            { label: 'Off (deterministik)', value: 'off' },
            { label: 'Dry run (pratinjau)', value: 'dry' },
            { label: 'Generate (tulis draft)', value: 'generate' },
          ],
        },
        {
          name: 'aiModel',
          type: 'text',
          admin: { description: 'Default: pro-coding (gateway lokal 20128).', width: '33%' },
          label: 'AI Model',
        },
        {
          name: 'writeMode',
          type: 'select',
          admin: { description: 'overwrite = update dokumen dgn slug sama (id tetap, versi naik).', width: '34%' },
          defaultValue: 'overwrite',
          label: 'Write Mode',
          options: [
            { label: 'Create only (lewati jika ada)', value: 'create' },
            { label: 'Overwrite (update jika ada)', value: 'overwrite' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'outputStatus',
          type: 'select',
          admin: { width: '50%' },
          defaultValue: 'draft',
          label: 'Output Status',
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Published', value: 'published' },
          ],
        },
        {
          name: 'maxRows',
          type: 'number',
          admin: { description: 'Batasi jumlah baris per run (0 = semua).', width: '50%' },
          defaultValue: 0,
          label: 'Max Rows',
        },
      ],
    },
    {
      name: 'excludeRowKeys',
      type: 'text',
      admin: { description: 'Row key yang dilewati.' },
      hasMany: true,
      label: 'Exclude Row Keys',
    },
    {
      name: 'status',
      type: 'select',
      admin: { position: 'sidebar', readOnly: true },
      defaultValue: 'idle',
      options: [
        { label: 'Idle', value: 'idle' },
        { label: 'Running', value: 'running' },
        { label: 'Done', value: 'done' },
        { label: 'Failed', value: 'failed' },
      ],
    },
    { name: 'lastRunAt', type: 'date', admin: { position: 'sidebar', readOnly: true }, label: 'Last Run At' },
    { name: 'lastRunSummary', type: 'json', admin: { position: 'sidebar', readOnly: true }, label: 'Last Run Summary' },
    { name: 'notes', type: 'textarea', label: 'Notes' },
  ],
  labels: {
    plural: 'Generator Programs',
    singular: 'Generator Program',
  },
}
