import assert from 'node:assert/strict'
import { test } from 'node:test'

import { fnv1a, selectTemplate } from '../select'

test('fnv1a is stable and deterministic', () => {
  assert.equal(fnv1a('abc'), fnv1a('abc'))
  assert.notEqual(fnv1a('abc'), fnv1a('abd'))
})

test('selectTemplate is stable per row', () => {
  const templates = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
  const row = { key: 'bandung', primaryKeyword: 'Cetak Buku Bandung' }
  const first = selectTemplate({ programId: 'p1', row, templates })
  const again = selectTemplate({ programId: 'p1', row, templates })
  assert.equal(first?.id, again?.id)
})

test('selectTemplate returns the single template when pool has one', () => {
  const only = { id: 'solo' }
  assert.equal(selectTemplate({ programId: 'x', row: { primaryKeyword: 'y' }, templates: [only] })?.id, 'solo')
})

test('selectTemplate returns null for empty pool', () => {
  assert.equal(selectTemplate({ programId: 'x', row: { primaryKeyword: 'y' }, templates: [] }), null)
})
