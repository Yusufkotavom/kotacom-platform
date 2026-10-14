import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { isAdmin } from '@root/access/isAdmin'
import { csvToRows } from '@root/generator/csv'

/**
 * A dataset = the rows that drive generation. One row produces one document.
 * Rows are `{ key, data }` where `data` is an arbitrary JSON object whose keys
 * become tokens (`{{city}}`, `{{primaryKeyword}}`, ...).
 *
 * PREFERRED INPUT: paste one big CSV blob into `sourceCsv`. A `beforeChange`
 * hook parses it into the `rows` array automatically, so operators never have
 * to hand-edit rows field-by-field. The header line names the tokens; one
 * column (default the first, or `keyColumn`) becomes the stable row key.
 *
 * `rows` is still the field the runner reads. When `sourceCsv` is present it is
 * DERIVED (recomputed on every save) and shown read-only. Leaving `sourceCsv`
 * empty keeps the legacy hand-built `rows` path fully working.
 */

/** Recompute `rows` from `sourceCsv` whenever a CSV blob is provided. */
const syncRowsFromCsv: CollectionBeforeChangeHook = ({ data }) => {
  const csv = typeof data.sourceCsv === 'string' ? data.sourceCsv : ''

  // No CSV → leave hand-authored rows untouched (legacy path).
  if (!csv.trim()) {return data}

  const keyColumn = typeof data.keyColumn === 'string' ? data.keyColumn : undefined
  const { columns, duplicateKeys, rows, skipped } = csvToRows(csv, keyColumn)

  data.rows = rows.map((row) => ({ data: row.data, key: row.key }))
  data.csvReport = {
    columns,
    duplicateKeys,
    parsedAt: new Date().toISOString(),
    rowCount: rows.length,
    skipped,
  }

  return data
}

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
      name: 'sourceCsv',
      type: 'textarea',
      admin: {
        description:
          'Tempel CSV di sini (baris pertama = nama kolom/token). Saat disimpan, kolom otomatis jadi token {{kolom}} dan tiap baris jadi satu dokumen. Pemisah , ; atau tab terdeteksi otomatis. Biarkan kosong untuk mengisi Rows secara manual.',
        rows: 12,
      },
      label: 'Source CSV',
    },
    {
      name: 'keyColumn',
      type: 'text',
      admin: {
        description:
          'Nama kolom yang dipakai sebagai Row Key (ID stabil untuk deteksi duplikat & overwrite). Kosongkan untuk memakai kolom pertama.',
      },
      label: 'Key Column',
    },
    {
      name: 'csvReport',
      type: 'json',
      admin: {
        description: 'Ringkasan hasil parse CSV terakhir (otomatis).',
        readOnly: true,
      },
      label: 'CSV Report',
    },
    {
      name: 'rows',
      type: 'array',
      admin: {
        description:
          'Tiap baris = satu dokumen yang dihasilkan. Terisi otomatis dari Source CSV bila diisi; jika CSV kosong, boleh diisi manual.',
      },
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
  hooks: {
    beforeChange: [syncRowsFromCsv],
  },
  labels: {
    plural: 'Generator Datasets',
    singular: 'Generator Dataset',
  },
}
