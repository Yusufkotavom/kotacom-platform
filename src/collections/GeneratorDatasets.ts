import type { CollectionConfig } from 'payload'

import { isAdmin } from '@root/access/isAdmin'

/**
 * A dataset = the rows that drive generation. One row produces one document.
 * Rows are `{ key, data }` where `data` is an arbitrary JSON object whose keys
 * become tokens (`{{city}}`, `{{primaryKeyword}}`, ...). Import via CSV/JSON
 * (`POST /api/generator/datasets`).
 */
export const GeneratorDatasets: CollectionConfig = {
  slug: 'generator-datasets',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ['name', 'updatedAt'],
    group: 'Generator',
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      index: true,
      label: 'Name',
      required: true,
      unique: true,
    },
    { name: 'notes', type: 'textarea', label: 'Notes' },
    {
      name: 'rows',
      type: 'array',
      admin: { description: 'Tiap baris = satu dokumen yang dihasilkan.' },
      fields: [
        {
          name: 'key',
          type: 'text',
          admin: { description: 'ID stabil baris (mis. bandung). Dipakai untuk deteksi duplikat.' },
          index: true,
          label: 'Row Key',
          required: true,
        },
        {
          name: 'data',
          type: 'json',
          admin: { description: 'Objek data baris; tiap key jadi token {{key}}.' },
          label: 'Row Data',
          required: true,
        },
      ],
      label: 'Rows',
    },
  ],
  labels: {
    plural: 'Generator Datasets',
    singular: 'Generator Dataset',
  },
}
