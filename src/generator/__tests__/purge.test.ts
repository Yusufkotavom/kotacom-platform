import assert from 'node:assert/strict'
import { test } from 'node:test'

import { purgeProgram } from '../purge'

/**
 * Minimal stub of the Payload instance: records the queries it receives and
 * returns canned matches so we can assert selection + delete behaviour without
 * a database.
 */
const makePayload = (byCollection: Record<string, { id: number | string }[]>) => {
  const calls: { deletes: unknown[]; finds: unknown[] } = { deletes: [], finds: [] }
  const payload = {
    delete: async (args: { collection: string; where: unknown }) => {
      calls.deletes.push(args)
      return { docs: byCollection[args.collection] ?? [], errors: [] }
    },
    find: async (args: { collection: string; where: unknown }) => {
      calls.finds.push(args)
      return { docs: byCollection[args.collection] ?? [] }
    },
  }
  return { calls, payload: payload as unknown as Parameters<typeof purgeProgram>[0] }
}

test('purgeProgram dry-run counts matches without deleting', async () => {
  const { calls, payload } = makePayload({
    pages: [{ id: 1 }, { id: 2 }],
    posts: [{ id: 3 }],
  })

  const result = await purgeProgram(payload, { dryRun: true, programId: 'p1' })

  assert.equal(result.dryRun, true)
  assert.equal(result.totalMatched, 3)
  assert.equal(result.totalDeleted, 0)
  assert.equal(calls.deletes.length, 0, 'dry-run must not call delete')
  assert.equal(calls.finds.length, 2)
})

test('purgeProgram defaults to dry-run when dryRun is omitted', async () => {
  const { calls, payload } = makePayload({ pages: [{ id: 1 }], posts: [] })
  const result = await purgeProgram(payload, { programId: 'p1' })
  assert.equal(result.dryRun, true)
  assert.equal(calls.deletes.length, 0)
})

test('purgeProgram deletes when dryRun is false', async () => {
  const { calls, payload } = makePayload({
    pages: [{ id: 1 }, { id: 2 }],
    posts: [{ id: 3 }],
  })

  const result = await purgeProgram(payload, { dryRun: false, programId: 'p1' })

  assert.equal(result.totalMatched, 3)
  assert.equal(result.totalDeleted, 3)
  assert.equal(calls.deletes.length, 2, 'one delete per non-empty collection set')
})

test('purgeProgram queries by generator.programId lineage (stringified)', async () => {
  const { calls, payload } = makePayload({ pages: [{ id: 1 }], posts: [] })
  await purgeProgram(payload, { dryRun: true, programId: 42 })
  const firstFind = calls.finds[0] as { where: Record<string, unknown> }
  assert.deepEqual(firstFind.where, { 'generator.programId': { equals: '42' } })
})

test('purgeProgram narrows to one collection via entityType', async () => {
  const { calls, payload } = makePayload({ pages: [{ id: 1 }], posts: [{ id: 9 }] })

  const pageOnly = await purgeProgram(payload, { entityType: 'page', programId: 'p1' })
  assert.deepEqual(
    pageOnly.results.map((r) => r.collection),
    ['pages'],
  )

  const queried = (calls.finds as { collection: string }[]).map((c) => c.collection)
  assert.ok(!queried.includes('posts'), 'entityType:page must not query posts')
})

test('purgeProgram skips delete for a collection with zero matches', async () => {
  const { calls, payload } = makePayload({ pages: [], posts: [{ id: 3 }] })

  const result = await purgeProgram(payload, { dryRun: false, programId: 'p1' })

  assert.equal(result.totalDeleted, 1)
  assert.equal(calls.deletes.length, 1)
  const del = calls.deletes[0] as { collection: string }
  assert.equal(del.collection, 'posts')
})
