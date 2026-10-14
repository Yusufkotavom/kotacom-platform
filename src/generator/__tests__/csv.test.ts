import assert from 'node:assert/strict'
import { test } from 'node:test'

import { csvToRows, parseCsv } from '../csv'

test('parseCsv reads header + rows with comma delimiter', () => {
  const { columns, records } = parseCsv('city,service\nBandung,Cetak Buku\nSurabaya,Cetak Brosur')
  assert.deepEqual(columns, ['city', 'service'])
  assert.equal(records.length, 2)
  assert.deepEqual(records[0], { city: 'Bandung', service: 'Cetak Buku' })
  assert.deepEqual(records[1], { city: 'Surabaya', service: 'Cetak Brosur' })
})

test('parseCsv handles quoted fields with commas and newlines', () => {
  const csv = 'city,note\nBandung,"Halo, dunia"\nSurabaya,"baris satu\nbaris dua"'
  const { records } = parseCsv(csv)
  assert.equal(records[0].note, 'Halo, dunia')
  assert.equal(records[1].note, 'baris satu\nbaris dua')
})

test('parseCsv handles escaped double quotes', () => {
  const { records } = parseCsv('name\n"He said ""hi"""')
  assert.equal(records[0].name, 'He said "hi"')
})

test('parseCsv auto-detects tab and semicolon delimiters', () => {
  const tab = parseCsv('city\tservice\nBandung\tCetak Buku')
  assert.deepEqual(tab.columns, ['city', 'service'])
  assert.equal(tab.records[0].service, 'Cetak Buku')

  const semi = parseCsv('city;service\nBandung;Cetak Buku')
  assert.deepEqual(semi.columns, ['city', 'service'])
  assert.equal(semi.records[0].service, 'Cetak Buku')
})

test('parseCsv strips BOM, trailing newline, and blank lines', () => {
  const { columns, records } = parseCsv('\uFEFFcity,service\nBandung,A\n\nSurabaya,B\n')
  assert.deepEqual(columns, ['city', 'service'])
  assert.equal(records.length, 2)
})

test('parseCsv handles CRLF line endings', () => {
  const { records } = parseCsv('city,service\r\nBandung,A\r\nSurabaya,B')
  assert.equal(records.length, 2)
  assert.equal(records[1].city, 'Surabaya')
})

test('parseCsv returns empty for blank input', () => {
  assert.deepEqual(parseCsv(''), { columns: [], records: [] })
  assert.deepEqual(parseCsv('   \n  '), { columns: [], records: [] })
})

test('csvToRows uses the first column as key by default (slugified)', () => {
  const { columns, rows } = csvToRows('city,service\nKota Bandung,Cetak Buku\nSurabaya,Brosur')
  assert.deepEqual(columns, ['city', 'service'])
  assert.equal(rows[0].key, 'kota-bandung')
  assert.deepEqual(rows[0].data, { city: 'Kota Bandung', service: 'Cetak Buku' })
  assert.equal(rows[1].key, 'surabaya')
})

test('csvToRows honours an explicit keyColumn', () => {
  const { rows } = csvToRows('city,slug\nBandung,cetak-buku-bandung', 'slug')
  assert.equal(rows[0].key, 'cetak-buku-bandung')
})

test('csvToRows falls back to first column when keyColumn is absent', () => {
  const { rows } = csvToRows('city,service\nBandung,A', 'missing')
  assert.equal(rows[0].key, 'bandung')
})

test('csvToRows skips rows with an empty key and reports the count', () => {
  const { rows, skipped } = csvToRows('city,service\n,A\nBandung,B')
  assert.equal(rows.length, 1)
  assert.equal(skipped, 1)
})

test('csvToRows de-dupes by key (last wins) and reports duplicates', () => {
  const { duplicateKeys, rows } = csvToRows('city,service\nBandung,A\nBandung,B')
  assert.equal(rows.length, 1)
  assert.equal(rows[0].data.service, 'B')
  assert.deepEqual(duplicateKeys, ['bandung'])
})

test('csvToRows returns empty for blank input', () => {
  assert.deepEqual(csvToRows(''), { columns: [], duplicateKeys: [], rows: [], skipped: 0 })
})
