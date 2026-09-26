import type { Field } from 'payload'

/**
 * Generator lineage group, attached to `pages` and `posts`.
 *
 * Records which program/row/template produced a document so the runner can be
 * idempotent (re-run = UPDATE the same doc) and revisions stay traceable. Read
 * only in the admin — the runner is the only writer.
 */
export const generatorField: Field = {
  name: 'generator',
  type: 'group',
  admin: {
    position: 'sidebar',
    readOnly: true,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'version', type: 'text', admin: { readOnly: true, width: '40%' }, label: 'Version' },
        {
          name: 'aiUsed',
          type: 'checkbox',
          admin: { readOnly: true, width: '60%' },
          label: 'AI Used',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'programId', type: 'text', admin: { readOnly: true, width: '50%' }, label: 'Program ID' },
        { name: 'datasetId', type: 'text', admin: { readOnly: true, width: '50%' }, label: 'Dataset ID' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'templateId', type: 'text', admin: { readOnly: true, width: '50%' }, label: 'Template ID' },
        { name: 'rowKey', type: 'text', admin: { readOnly: true, width: '50%' }, label: 'Row Key' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'keywordKey', type: 'text', admin: { readOnly: true, width: '50%' }, label: 'Keyword' },
        { name: 'lastRunId', type: 'text', admin: { readOnly: true, width: '50%' }, label: 'Last Run' },
      ],
    },
    {
      name: 'generatedAt',
      type: 'date',
      admin: { date: { pickerAppearance: 'dayAndTime' }, readOnly: true },
      label: 'Generated At',
    },
  ],
  label: 'Generator',
}

export default generatorField
