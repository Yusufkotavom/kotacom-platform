import { interpolate } from './tokens'

const MAX_SLUG_LENGTH = 160

/** Lowercase, dash-separated, alnum-only segment. */
export const slugifySegment = (value?: null | string): string =>
  (value ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/** Normalise `/A/B/` -> `a/b`. */
export const normalizeRouteBase = (routeBase: string): string =>
  routeBase
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .map((segment) => slugifySegment(segment))
    .filter(Boolean)
    .join('/')

/**
 * Build the slug for a generated entity from a tokenized pattern.
 * Pattern default: `{{routeBase}}/{{city}}` → e.g. `percetakan/cetak-buku/bandung`.
 */
export const buildGeneratorSlug = (input: {
  city?: null | string
  primaryKeyword: string
  routeBase: string
  service?: null | string
  slugPattern?: null | string
}): string => {
  const routeBase = normalizeRouteBase(input.routeBase)
  const values: Record<string, string> = {
    routeBase,
    service: slugifySegment(input.service),
    city: slugifySegment(input.city),
    primaryKeyword: slugifySegment(input.primaryKeyword),
  }

  const pattern = (input.slugPattern || '{{routeBase}}/{{city}}').trim().replace(/^\/+/, '')
  const composed = interpolate(pattern, values)
    .split('/')
    .map((segment) => slugifySegment(segment))
    .filter(Boolean)
    .join('/')

  const fallback =
    values.primaryKeyword || values.service || values.city || 'halaman'

  return (composed || fallback).slice(0, MAX_SLUG_LENGTH).replace(/^\/+|\/+$/g, '')
}

/** Absolute path for a slug (used by JSON-LD / canonical hints). */
export const buildGeneratedPagePath = (slug: string): string => `/${slug.replace(/^\/+/, '')}`
