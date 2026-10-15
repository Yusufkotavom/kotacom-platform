import type { GeneratorRow, GeneratorTemplateLite } from './types'

const TOKEN_PATTERN = /\{\{\s*([a-zA-Z0-9_:-]+)\s*\}\}/g

/** Replace `{{token}}` occurrences in a string; unknown tokens become ''. */
export const interpolate = (value: string, tokens: Record<string, string>): string =>
  value.replace(TOKEN_PATTERN, (_match, name: string) => tokens[name] ?? '')

/** Recursively replace `{{token}}` in an arbitrary value (objects/arrays/strings). */
export const deepReplace = <T>(value: T, tokens: Record<string, string>): T => {
  if (typeof value === 'string') return interpolate(value, tokens) as unknown as T
  if (Array.isArray(value)) return value.map((item) => deepReplace(item, tokens)) as unknown as T
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        deepReplace(entry, tokens),
      ]),
    ) as unknown as T
  }
  return value
}

export const clean = (value: unknown): string => {
  if (value == null) return ''
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return ''
}

export const titleCase = (value: string): string =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const toCamelCase = (str: string): string =>
  str.replace(/[-_]([a-z0-9])/gi, (_match, char: string) => char.toUpperCase())

const toSnakeCase = (str: string): string =>
  str.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase()

/**
 * Derive the token map for a row.
 *
 * Mendukung fleksibilitas custom token tak terbatas:
 * 1. Setiap kolom/field arbitrary di `row` (dari CSV/JSON) otomatis tersedia
 *    sebagai token `{{key}}`, plus alias camelCase dan snake_case.
 * 2. Token semantik default dinormalisasi (`location`, `label`, `secondaryKeywords`, dll).
 * 3. Token runtime sistem (`year`, `month`).
 * 4. Jika template memiliki `tokenDefinitions`, diaplikasikan sebagai override/fallback
 *    tanpa membuang token kustom bawaan lainnya.
 */
export const buildTokens = (
  template: Pick<GeneratorTemplateLite, 'tokenDefinitions'>,
  row: GeneratorRow,
): Record<string, string> => {
  const source: Record<string, string> = {}

  // 1. Ekstrak seluruh field arbitrary dari `row`
  for (const [key, val] of Object.entries(row)) {
    if (key === 'tokens' || key === 'key') continue
    const cleaned = clean(val)
    if (cleaned) {
      source[key] = cleaned
      source[toCamelCase(key)] = cleaned
      source[toSnakeCase(key)] = cleaned
    }
  }

  // 2. Normalisasi semantic tokens inti
  const primaryKeyword = clean(row.primaryKeyword) || clean(source.primary_keyword) || clean(source.keyword) || ''
  const secondaryKeywords = (
    Array.isArray(row.secondaryKeywords)
      ? row.secondaryKeywords
      : typeof row.secondaryKeywords === 'string'
        ? row.secondaryKeywords.split(',')
        : typeof source.secondary_keywords === 'string'
          ? source.secondary_keywords.split(',')
          : []
  )
    .map(clean)
    .filter(Boolean)
    .join(', ')

  const service = clean(row.service) || clean(source.layanan) || primaryKeyword
  const city = clean(row.city) || clean(source.kota) || clean(source.kabupaten) || ''
  const location = city || service || 'target utama'
  const offer = clean(row.offer) || clean(source.penawaran) || `Konsultasi ${service}`
  const industry = clean(row.industry) || clean(source.industri) || 'bisnis lokal'
  const localCondition = clean(row.localCondition) || clean(source.kondisi_lokal) || ''
  const label = clean(row.label) || titleCase(service.replace(/-/g, ' '))

  source.primaryKeyword = primaryKeyword
  source.secondaryKeywords = secondaryKeywords
  source.service = service
  source.city = city
  source.location = location
  source.offer = offer
  source.industry = industry
  source.localCondition = localCondition
  source.label = label

  // 3. Custom row.tokens array (legacy format)
  for (const token of row.tokens ?? []) {
    if (token?.name && token.values?.length) {
      source[token.name] = clean(token.values[0])
    }
  }

  // 4. Token runtime sistem
  const now = new Date()
  source.year = String(now.getFullYear())
  const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  source.month = MONTHS[now.getMonth()] || ''

  // 5. Template tokenDefinitions (override / fallback tanpa membuang token lain)
  const definitions = template.tokenDefinitions ?? []
  if (!definitions.length) return source

  const result: Record<string, string> = { ...source }
  for (const def of definitions) {
    const fromSource = def.sourceField ? clean(source[def.sourceField]) : ''
    const fallback = clean(def.fallbackValue)
    if (fromSource || fallback) {
      result[def.name] = fromSource || fallback
    }
  }

  return result
}
