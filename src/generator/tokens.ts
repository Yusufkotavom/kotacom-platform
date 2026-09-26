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

const clean = (value: unknown): string => (typeof value === 'string' ? value.trim() : '')

const titleCase = (value: string): string =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

/**
 * Derive the token map for a row. Mirrors Sanity-clean's `buildGeneratorTokens`:
 * a set of derived (semantic) tokens + custom row tokens + optional
 * `tokenDefinitions` that restrict/rename which tokens are exposed.
 */
export const buildTokens = (
  template: Pick<GeneratorTemplateLite, 'tokenDefinitions'>,
  row: GeneratorRow,
): Record<string, string> => {
  const primaryKeyword = clean(row.primaryKeyword)
  const secondaryKeywords = (row.secondaryKeywords ?? []).map(clean).filter(Boolean).join(', ')
  const service = clean(row.service) || primaryKeyword
  const city = clean(row.city)
  const location = city || service || 'target utama'
  const offer = clean(row.offer) || `Konsultasi ${service}`
  const industry = clean(row.industry) || 'bisnis lokal'
  const localCondition = clean(row.localCondition)
  const label = clean(row.label) || titleCase(service.replace(/-/g, ' '))

  const source: Record<string, string> = {
    primaryKeyword,
    secondaryKeywords,
    service,
    city,
    location,
    offer,
    industry,
    localCondition,
    label,
  }

  for (const token of row.tokens ?? []) {
    if (token?.name && token.values?.length) source[token.name] = clean(token.values[0])
  }

  const definitions = template.tokenDefinitions ?? []
  if (!definitions.length) return source

  return definitions.reduce<Record<string, string>>((acc, def) => {
    const fromSource = def.sourceField ? clean(source[def.sourceField]) : ''
    const resolved = fromSource || clean(def.fallbackValue)
    if (resolved) acc[def.name] = resolved
    return acc
  }, {})
}
