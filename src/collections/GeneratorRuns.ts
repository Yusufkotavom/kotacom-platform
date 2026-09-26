import type { CollectionConfig } from 'payload'

import { isAdmin } from '@root/access/isAdmin'

/**
 * Run report — an immutable audit of one execution of a program. Stores the
 * QA verdict per row (ready/warning/blocked), what was created/updated/skipped,
 * and the AI model used. Written by the runner; read-only in the admin.
 */
export const GeneratorRuns: CollectionConfig = {
  slug: 'generator-runs',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ['runId', 'program', 'mode', 'status', 'createdAt'],
    group: 'Generator',
    useAsTitle: 'runId',
  },
  fields: [
    { name: 'runId', type: 'text', index: true, label: 'Run ID', required: true, unique: true },
    {
      name: 'program',
      type: 'relationship',
      admin: { description: 'ID program yang dijalankan.' },
      index: true,
      label: 'Program',
      relationTo: 'generator-programs',
    },
    { name: 'entityType', type: 'text', admin: { readOnly: true }, label: 'Entity Type' },
    { name: 'mode', type: 'text', admin: { readOnly: true }, label: 'Mode' },
    { name: 'aiModel', type: 'text', admin: { readOnly: true }, label: 'AI Model' },
    { name: 'writeMode', type: 'text', admin: { readOnly: true }, label: 'Write Mode' },
    {
      name: 'status',
      type: 'select',
      admin: { readOnly: true },
      defaultValue: 'running',
      options: [
        { label: 'Running', value: 'running' },
        { label: 'Done', value: 'done' },
        { label: 'Failed', value: 'failed' },
      ],
    },
    { name: 'startedAt', type: 'date', admin: { readOnly: true }, label: 'Started At' },
    { name: 'finishedAt', type: 'date', admin: { readOnly: true }, label: 'Finished At' },
    {
      name: 'totals',
      type: 'group',
      admin: { readOnly: true },
      fields: [
        { name: 'rows', type: 'number', admin: { readOnly: true }, defaultValue: 0, label: 'Rows' },
        { name: 'ready', type: 'number', admin: { readOnly: true }, defaultValue: 0, label: 'Ready' },
        { name: 'warning', type: 'number', admin: { readOnly: true }, defaultValue: 0, label: 'Warning' },
        { name: 'blocked', type: 'number', admin: { readOnly: true }, defaultValue: 0, label: 'Blocked' },
        { name: 'created', type: 'number', admin: { readOnly: true }, defaultValue: 0, label: 'Created' },
        { name: 'updated', type: 'number', admin: { readOnly: true }, defaultValue: 0, label: 'Updated' },
        { name: 'skipped', type: 'number', admin: { readOnly: true }, defaultValue: 0, label: 'Skipped' },
      ],
      label: 'Totals',
    },
    {
      name: 'report',
      type: 'json',
      admin: { description: 'Laporan per-baris (QA + aksi + id dokumen).', readOnly: true },
      label: 'Report',
    },
    { name: 'notes', type: 'textarea', admin: { readOnly: true }, label: 'Notes' },
  ],
  labels: {
    plural: 'Generator Runs',
    singular: 'Generator Run',
  },
}
