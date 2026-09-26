import type { FieldHook } from 'payload'

/**
 * Normalise a slug value.
 *
 * Slashes are PRESERVED (segments are individually slugified): generated pages
 * legitimately use nested slugs like `percetakan/cetak-buku/bandung`, and the
 * page router (`[...slug]`) resolves the full path. Stripping `/` would collapse
 * every nested slug into one flat token and break routing/UNIQUE lookups.
 */
const format = (val: string): string =>
  val
    .split('/')
    .map((segment) =>
      segment
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '')
        .toLowerCase(),
    )
    .filter(Boolean)
    .join('/')

const formatSlug =
  (fallback: string): FieldHook =>
  ({ data, operation, originalDoc, value }) => {
    if (typeof value === 'string') {
      return format(value)
    }

    if (operation === 'create') {
      const fallbackData = data?.[fallback] || originalDoc?.[fallback]

      if (fallbackData && typeof fallbackData === 'string') {
        return format(fallbackData)
      }
    }

    return value
  }

export default formatSlug
