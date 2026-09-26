import type { Block } from 'payload'

import { blockFields } from '../../fields/blockFields'

/**
 * `aiContent` — an AI-authored content block that can live inside any template
 * (pages `layout` and posts `content`).
 *
 * Why a block (not just a field): the generator is block-driven. A template is
 * a stack of blocks; `aiContent` lets the AI *enrich* a specific slot in that
 * stack while keeping the prompt and its output side-by-side and individually
 * editable — so a generated doc can be revised by hand and re-generated
 * (overwrite) without losing the machinery that produced it.
 *
 * Render rule: use `generatedText` when present, otherwise fall back to the
 * manual `content`. AI failing never breaks a page — it degrades to `content`.
 */
export const AiContent: Block = {
  slug: 'aiContent',
  fields: [
    blockFields({
      name: 'aiContentFields',
      fields: [
        {
          name: 'prompt',
          type: 'textarea',
          admin: {
            description:
              'Instruksi untuk AI. Boleh memakai token seperti {{primaryKeyword}}, {{city}}, {{offer}}.',
          },
          label: 'AI Prompt',
        },
        {
          name: 'tokens',
          type: 'text',
          admin: {
            description: 'Daftar token yang dipakai prompt ini (opsional, untuk audit).',
          },
          hasMany: true,
          label: 'Tokens',
        },
        {
          name: 'generatedText',
          type: 'richText',
          admin: {
            description:
              'Hasil AI. Bisa ditimpa (overwrite) saat re-generate; kosong berarti pakai konten manual di bawah.',
          },
          label: 'AI Generated Text',
        },
        {
          name: 'content',
          type: 'richText',
          admin: {
            description: 'Konten manual / fallback bila AI tidak dipakai atau gagal.',
          },
          label: 'Manual Content',
        },
        {
          type: 'row',
          fields: [
            {
              name: 'model',
              type: 'text',
              admin: { readOnly: true, width: '60%' },
              label: 'Model',
            },
            {
              name: 'generatedAt',
              type: 'date',
              admin: {
                date: { pickerAppearance: 'dayAndTime' },
                readOnly: true,
                width: '40%',
              },
              label: 'Generated At',
            },
          ],
        },
      ],
    }),
  ],
  interfaceName: 'AiContentBlock',
  labels: {
    plural: 'AI Content Blocks',
    singular: 'AI Content Block',
  },
}

export default AiContent
