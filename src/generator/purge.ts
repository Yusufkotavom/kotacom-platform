import type { BasePayload } from 'payload'

import type { EntityType } from './types'

/**
 * Purge (delete) documents produced by a generator program.
 *
 * Safety model:
 *  - Selection is by LINEAGE only — `generator.programId === <programId>`. A
 *    document a human authored by hand has no lineage and is never matched.
 *  - `dryRun` (default true at the route layer) counts + lists what WOULD be
 *    deleted without touching anything, so the caller always previews first.
 *  - `entityType` narrows to one collection; omitted purges both pages & posts.
 */

export type PurgeOptions = {
  /** When true, only count/list matches — delete nothing. */
  dryRun?: boolean
  /** Restrict to one collection; omit to purge both pages and posts. */
  entityType?: EntityType
  programId: number | string
}

export type PurgeCollectionResult = {
  collection: 'pages' | 'posts'
  deleted: number
  ids: (number | string)[]
  matched: number
}

export type PurgeResult = {
  dryRun: boolean
  programId: string
  results: PurgeCollectionResult[]
  totalDeleted: number
  totalMatched: number
}

const collectionsFor = (entityType?: EntityType): ('pages' | 'posts')[] => {
  if (entityType === 'post') {return ['posts']}
  if (entityType === 'page') {return ['pages']}
  return ['pages', 'posts']
}

const lineageWhere = (programId: number | string) => ({
  'generator.programId': { equals: String(programId) },
})

/**
 * Delete (or, in dry-run, count) all documents whose generator lineage points
 * at `programId`. Returns a per-collection breakdown plus totals.
 */
export const purgeProgram = async (
  payload: BasePayload,
  options: PurgeOptions,
): Promise<PurgeResult> => {
  const { entityType, programId } = options
  const dryRun = options.dryRun ?? true
  const where = lineageWhere(programId)

  const results: PurgeCollectionResult[] = []

  for (const collection of collectionsFor(entityType)) {
    // Find matches first (ids used for both the dry-run preview and the report).
    const found = await payload.find({
      collection,
      depth: 0,
      limit: 0, // 0 = no limit: return every match
      overrideAccess: true,
      pagination: false,
      select: {},
      where,
    })

    const ids = (found.docs as { id: number | string }[]).map((doc) => doc.id)
    const matched = ids.length

    let deleted = 0
    if (!dryRun && matched > 0) {
      const res = await payload.delete({
        collection,
        overrideAccess: true,
        where,
      })
      // payload.delete returns { docs, errors }; count successful docs.
      deleted = Array.isArray((res as { docs?: unknown[] }).docs)
        ? (res as { docs: unknown[] }).docs.length
        : matched
    }

    results.push({ collection, deleted, ids, matched })
  }

  return {
    dryRun,
    programId: String(programId),
    results,
    totalDeleted: results.reduce((sum, r) => sum + r.deleted, 0),
    totalMatched: results.reduce((sum, r) => sum + r.matched, 0),
  }
}
