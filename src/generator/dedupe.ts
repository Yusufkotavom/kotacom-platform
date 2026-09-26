import type { ExistingDoc } from './types'

export type DuplicateMatch = {
  existing: ExistingDoc
  reason: 'lineage' | 'slug'
}

const sameLineage = (
  existing: ExistingDoc,
  programId: number | string,
  rowKey: string,
  keywordKey: string,
): boolean =>
  String(existing.generator?.programId ?? '') === String(programId) &&
  existing.generator?.rowKey === rowKey &&
  existing.generator?.keywordKey === keywordKey

/**
 * Find a conflicting existing document for a generated slug/lineage.
 * `slug` match is a hard collision; `lineage` match means this exact
 * (program, row, keyword) was generated before → overwrite target.
 */
export const findDuplicate = (input: {
  existing: ExistingDoc[]
  keywordKey: string
  programId: number | string
  rowKey: string
  slug: string
}): DuplicateMatch | null => {
  const { existing, keywordKey, programId, rowKey, slug } = input

  const slugMatch = existing.find((item) => item?.slug === slug)
  if (slugMatch) return { existing: slugMatch, reason: 'slug' }

  const lineageMatch = existing.find((item) =>
    sameLineage(item, programId, rowKey, keywordKey),
  )
  return lineageMatch ? { existing: lineageMatch, reason: 'lineage' } : null
}
