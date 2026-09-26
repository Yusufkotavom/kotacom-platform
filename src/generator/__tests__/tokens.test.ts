import assert from 'node:assert/strict'
import { test } from 'node:test'

import { buildTokens, deepReplace, interpolate } from '../tokens'

test('interpolate replaces known tokens, blanks unknown', () => {
  assert.equal(interpolate('Cetak {{city}} di {{unknown}}', { city: 'Bandung' }), 'Cetak Bandung di ')
})

test('deepReplace walks arrays and nested objects', () => {
  const out = deepReplace(
    { blocks: [{ h: 'Halo {{city}}' }], rows: ['{{primaryKeyword}}'] },
    { city: 'Bandung', primaryKeyword: 'Cetak Buku' },
  )
  assert.deepEqual(out, { blocks: [{ h: 'Halo Bandung' }], rows: ['Cetak Buku'] })
})

test('buildTokens derives semantic tokens and custom tokens', () => {
  const tokens = buildTokens(
    {},
    {
      city: 'Bandung',
      primaryKeyword: 'Jasa Cetak Buku',
      secondaryKeywords: ['cetak buku murah', 'percetakan buku'],
      tokens: [{ name: 'bonus', values: ['gratis ongkir'] }],
    },
  )
  assert.equal(tokens.primaryKeyword, 'Jasa Cetak Buku')
  assert.equal(tokens.city, 'Bandung')
  assert.equal(tokens.service, 'Jasa Cetak Buku')
  assert.equal(tokens.location, 'Bandung')
  assert.equal(tokens.secondaryKeywords, 'cetak buku murah, percetakan buku')
  assert.equal(tokens.bonus, 'gratis ongkir')
})

test('buildTokens honours tokenDefinitions restriction', () => {
  const tokens = buildTokens(
    { tokenDefinitions: [{ name: 'kota', sourceField: 'city' }] },
    { city: 'Bandung', primaryKeyword: 'Cetak Buku' },
  )
  assert.deepEqual(tokens, { kota: 'Bandung' })
})
