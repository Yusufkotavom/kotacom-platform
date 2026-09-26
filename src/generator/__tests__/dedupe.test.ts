import assert from 'node:assert/strict'
import { test } from 'node:test'

import { findDuplicate } from '../dedupe'
import type { ExistingDoc } from '../types'

const existing: ExistingDoc[] = [
  { id: 1, slug: 'percetakan/cetak-buku/bandung', generator: { keywordKey: 'k', programId: 'p1', rowKey: 'bandung' } },
  { id: 2, slug: 'percetakan/cetak-buku/surabaya', generator: { keywordKey: 'k2', programId: 'p1', rowKey: 'surabaya' } },
]

test('findDuplicate detects a slug collision', () => {
  const match = findDuplicate({
    existing,
    keywordKey: 'new',
    programId: 'p9',
    rowKey: 'new',
    slug: 'percetakan/cetak-buku/bandung',
  })
  assert.equal(match?.reason, 'slug')
  assert.equal(match?.existing.id, 1)
})

test('findDuplicate detects a lineage match', () => {
  const match = findDuplicate({
    existing,
    keywordKey: 'k2',
    programId: 'p1',
    rowKey: 'surabaya',
    slug: 'some/new/slug',
  })
  assert.equal(match?.reason, 'lineage')
  assert.equal(match?.existing.id, 2)
})

test('findDuplicate returns null when nothing matches', () => {
  const match = findDuplicate({
    existing,
    keywordKey: 'z',
    programId: 'pX',
    rowKey: 'z',
    slug: 'brand/new',
  })
  assert.equal(match, null)
})
