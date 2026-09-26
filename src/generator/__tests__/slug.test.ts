import assert from 'node:assert/strict'
import { test } from 'node:test'

import { buildGeneratorSlug, normalizeRouteBase, slugifySegment } from '../slug'

test('slugifySegment lowercases and dashes', () => {
  assert.equal(slugifySegment('Jasa Cetak Buku!'), 'jasa-cetak-buku')
  assert.equal(slugifySegment('  Bandung '), 'bandung')
  assert.equal(slugifySegment(undefined), '')
})

test('normalizeRouteBase strips slashes and slugifies segments', () => {
  assert.equal(normalizeRouteBase('/Percetakan/Cetak Buku/'), 'percetakan/cetak-buku')
})

test('buildGeneratorSlug composes routeBase + city', () => {
  assert.equal(
    buildGeneratorSlug({
      city: 'Bandung',
      primaryKeyword: 'Jasa Cetak Buku',
      routeBase: '/percetakan/cetak-buku',
    }),
    'percetakan/cetak-buku/bandung',
  )
})

test('buildGeneratorSlug honours a custom pattern', () => {
  assert.equal(
    buildGeneratorSlug({
      city: 'Bandung',
      primaryKeyword: 'Jasa Cetak Buku',
      routeBase: '/percetakan/cetak-buku',
      slugPattern: '{{routeBase}}-{{city}}',
    }),
    'percetakan/cetak-buku-bandung',
  )
})

test('buildGeneratorSlug falls back to the primary keyword', () => {
  assert.equal(
    buildGeneratorSlug({ primaryKeyword: 'Cetak Buku Murah', routeBase: '', slugPattern: '{{city}}' }),
    'cetak-buku-murah',
  )
})
