import type { GeneratorRow, GeneratorTemplateLite } from './types'

/** FNV-1a 32-bit — stable, dependency-free hash. */
export const fnv1a = (value: string): number => {
  let hash = 0x811c9dc5
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

const rowSeed = (row: GeneratorRow): string =>
  row.key || row.primaryKeyword || row.city || row.service || 'row'

/**
 * Deterministically pick one template from a pool for a given row.
 * Same (programId, row) always yields the same template → stable variation
 * without randomness (mirrors Sanity-clean's `selectTemplateForRow`).
 */
export const selectTemplate = <T extends { id: number | string }>(input: {
  programId: number | string
  row: GeneratorRow
  templates: T[]
}): null | T => {
  const { programId, row, templates } = input
  if (!templates.length) return null
  if (templates.length === 1) return templates[0]
  const hash = fnv1a(`${programId}:${rowSeed(row)}`)
  return templates[hash % templates.length]
}

export type { GeneratorRow, GeneratorTemplateLite }
