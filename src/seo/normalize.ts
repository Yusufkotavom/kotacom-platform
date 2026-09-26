/**
 * SEO normalizers — mirror of Sanity-clean's `lib/seo-normalize.ts`.
 *
 * Keep titles in the ~30–60 char window and descriptions in the ~120–155 char
 * window so nothing gets truncated by Google. Applied at the `generateMetadata`
 * layer (`src/seo/metadata.ts`) so every entity — page, post, product,
 * case-study — gets an optimized title/description even when the editor left
 * `meta.title` / `meta.description` empty.
 */

export function normalizeSeoTitle(input?: string | null): string {
  const cleaned = (input || '').replace(/\s+/g, ' ').trim()
  if (!cleaned) return ''

  if (cleaned.length >= 30 && cleaned.length <= 60) return cleaned
  if (cleaned.length < 30) {
    let expanded = `${cleaned} | Kotacom`
    if (expanded.length < 30) {
      expanded = `${expanded} Indonesia`
    }
    if (expanded.length <= 60) return expanded
    return expanded.slice(0, 60).trimEnd()
  }

  const separatorParts = cleaned
    .split(/[-|:]/)
    .map((item) => item.trim())
    .filter(Boolean)
  const viable = separatorParts.find((part) => part.length >= 35 && part.length <= 60)
  if (viable) return viable

  const softCut = cleaned.slice(0, 57).replace(/[,:;\-–—\s]+$/g, '')
  if (softCut.length < 30) {
    return cleaned.slice(0, 60).trimEnd()
  }
  return `${softCut}...`
}

export function normalizeSeoDescription(input?: string | null): string {
  const cleaned = (input || '').replace(/\s+/g, ' ').trim()
  if (!cleaned) return ''

  if (cleaned.length >= 120 && cleaned.length <= 155) return cleaned
  if (cleaned.length < 120) {
    const suffix =
      ' Dapatkan pendekatan terstruktur dari tim Kotacom sesuai kebutuhan bisnis Anda.'
    const expanded = `${cleaned}${suffix}`
    if (expanded.length <= 155) return expanded
    return `${expanded.slice(0, 152).replace(/[,:;\-–—\s]+$/g, '')}...`
  }

  const softCut = cleaned.slice(0, 152).replace(/[,:;\-–—\s]+$/g, '')
  if (softCut.length < 120) {
    return `${cleaned.slice(0, 155).trimEnd()}...`
  }
  return `${softCut}...`
}
