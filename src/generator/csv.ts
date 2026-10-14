/**
 * Dependency-free CSV → dataset rows.
 *
 * The dataset editor lets an operator paste ONE big CSV blob instead of
 * hand-building the `rows` array field-by-field. This module turns that blob
 * into `{ key, data }[]` — the exact shape the runner (`asRows` in run.ts)
 * consumes, where every column becomes a token (`{{column}}`).
 *
 * Parser scope (RFC 4180 subset that covers real spreadsheet exports):
 *  - comma OR tab OR semicolon delimiter (auto-detected from the header line)
 *  - double-quoted fields, with `""` as an escaped quote
 *  - commas / newlines / delimiters allowed inside quoted fields
 *  - CRLF or LF line endings; a trailing newline is ignored
 *  - blank lines (outside quotes) are skipped
 *
 * Intentionally NOT supported (keep it small + predictable for generated data):
 *  - no per-cell type coercion — every value is a trimmed string
 *  - no header-less mode — the first non-empty line MUST be the header
 */

export type CsvParseResult = {
  /** Header column names, in order, after trimming. */
  columns: string[]
  /** One entry per data line: a column→value object. */
  records: Record<string, string>[]
}

export type CsvToRowsResult = {
  columns: string[]
  /** Row keys that appeared more than once (later wins; reported for QA). */
  duplicateKeys: string[]
  rows: { data: Record<string, string>; key: string }[]
  /** Data lines that produced no usable key (skipped). */
  skipped: number
}

const DELIMITERS = [',', '\t', ';'] as const
type Delimiter = (typeof DELIMITERS)[number]

/** Pick the delimiter that appears most often on the header line. */
const detectDelimiter = (headerLine: string): Delimiter => {
  let best: Delimiter = ','
  let bestCount = -1
  for (const d of DELIMITERS) {
    // Count only delimiters outside quotes on the header line.
    let count = 0
    let inQuotes = false
    for (let i = 0; i < headerLine.length; i += 1) {
      const ch = headerLine[i]
      if (ch === '"') {inQuotes = !inQuotes}
      else if (ch === d && !inQuotes) {count += 1}
    }
    if (count > bestCount) {
      best = d
      bestCount = count
    }
  }
  return best
}

/**
 * Tokenise the whole CSV text into a matrix of raw string cells. A single pass
 * state machine so quoted newlines/delimiters are handled correctly.
 */
const toMatrix = (text: string, delimiter: Delimiter): string[][] => {
  const rows: string[][] = []
  let field = ''
  let row: string[] = []
  let inQuotes = false
  let sawAnyChar = false

  const pushField = (): void => {
    row.push(field)
    field = ''
  }
  const pushRow = (): void => {
    pushField()
    rows.push(row)
    row = []
    sawAnyChar = false
  }

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 1 // skip the escaped quote
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
      continue
    }

    if (ch === '"') {
      inQuotes = true
      sawAnyChar = true
      continue
    }
    if (ch === delimiter) {
      pushField()
      sawAnyChar = true
      continue
    }
    if (ch === '\r') {
      // handle CRLF and lone CR as a single row break
      if (text[i + 1] === '\n') {i += 1}
      pushRow()
      continue
    }
    if (ch === '\n') {
      pushRow()
      continue
    }
    field += ch
    sawAnyChar = true
  }

  // flush trailing field/row unless the file ended exactly on a newline
  if (sawAnyChar || field.length > 0 || row.length > 0) {
    pushRow()
  }

  return rows
}

/** True when a parsed matrix row is effectively blank. */
const isBlankRow = (cells: string[]): boolean =>
  cells.every((cell) => cell.trim() === '')

/**
 * Parse a CSV blob into ordered columns + column→value records.
 * Returns empty results for blank input (never throws).
 */
export const parseCsv = (input: string): CsvParseResult => {
  const text = (input ?? '').replace(/^\uFEFF/, '') // strip BOM
  if (!text.trim()) {return { columns: [], records: [] }}

  const firstLineEnd = text.search(/\r\n|\r|\n/)
  const headerLine = firstLineEnd === -1 ? text : text.slice(0, firstLineEnd)
  const delimiter = detectDelimiter(headerLine)

  const matrix = toMatrix(text, delimiter).filter((cells) => !isBlankRow(cells))
  if (!matrix.length) {return { columns: [], records: [] }}

  const columns = matrix[0].map((c) => c.trim())
  const records: Record<string, string>[] = []

  for (let r = 1; r < matrix.length; r += 1) {
    const cells = matrix[r]
    const record: Record<string, string> = {}
    for (let c = 0; c < columns.length; c += 1) {
      const key = columns[c]
      if (!key) {continue} // ignore unnamed columns
      record[key] = (cells[c] ?? '').trim()
    }
    records.push(record)
  }

  return { columns, records }
}

/** Slugify a value into a stable row key (mirrors slug.ts segment rules). */
const toKey = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/**
 * Convert a CSV blob into generator rows.
 *
 * @param input     raw CSV text
 * @param keyColumn column to use as the stable row key; when omitted or absent
 *                  the first column is used. Value is slugified so keys stay
 *                  URL/lineage-safe and consistent with dedupe.
 */
export const csvToRows = (input: string, keyColumn?: null | string): CsvToRowsResult => {
  const { columns, records } = parseCsv(input)
  if (!columns.length) {
    return { columns: [], duplicateKeys: [], rows: [], skipped: 0 }
  }

  const resolvedKeyCol =
    keyColumn && columns.includes(keyColumn) ? keyColumn : columns[0]

  const rows: { data: Record<string, string>; key: string }[] = []
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  let skipped = 0

  for (const record of records) {
    const rawKey = record[resolvedKeyCol] ?? ''
    const key = toKey(rawKey)
    if (!key) {
      skipped += 1
      continue
    }
    if (seen.has(key)) {duplicates.add(key)}
    seen.add(key)

    // De-dupe by key: last occurrence wins (replace any earlier row).
    const existingIdx = rows.findIndex((row) => row.key === key)
    const entry = { data: record, key }
    if (existingIdx === -1) {rows.push(entry)}
    else {rows[existingIdx] = entry}
  }

  return {
    columns,
    duplicateKeys: [...duplicates],
    rows,
    skipped,
  }
}
