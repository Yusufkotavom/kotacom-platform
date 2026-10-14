import type { CollectionBeforeChangeHook, Field } from 'payload'

/**
 * Top-level, indexed boolean that marks whether a document was produced by the
 * AI generator. The generator writes the `generator` lineage group; this flag
 * mirrors it as a first-class column so the admin list view can filter/sort by
 * "Generated" easily (nested group fields like `generator.programId` are not
 * exposed as list filters).
 *
 * The value is derived, not hand-set: `syncIsGenerated` recomputes it on every
 * write from the presence of `generator.programId`. Shown read-only.
 */
export const isGeneratedField: Field = {
  name: 'isGenerated',
  type: 'checkbox',
  admin: {
    description: 'Otomatis: dicentang bila dokumen dibuat oleh generator.',
    position: 'sidebar',
    readOnly: true,
  },
  defaultValue: false,
  index: true,
  label: 'Generated',
}

/**
 * Keep `isGenerated` in sync with generator lineage. Attach to a collection's
 * `beforeChange` hooks. Safe for hand-authored docs (no lineage → false).
 */
export const syncIsGenerated: CollectionBeforeChangeHook = ({ data }) => {
  const generator = (data?.generator ?? null) as { programId?: unknown } | null
  const programId = generator?.programId
  data.isGenerated = Boolean(programId !== undefined && programId !== null && programId !== '')
  return data
}
