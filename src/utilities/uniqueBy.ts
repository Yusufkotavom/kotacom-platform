/**
 * Keep the first item per slug, dropping empties and duplicates.
 * Guards list pages against duplicate docs in the DB (same slug) which would
 * otherwise produce duplicate React keys / repeated cards.
 */
export function uniqueBySlug<T extends { slug?: string | null }>(items: T[] | null | undefined): T[] {
  const out: T[] = []
  const seen = new Set<string>()
  for (const item of items || []) {
    const slug = item?.slug
    if (!slug || seen.has(slug)) continue
    seen.add(slug)
    out.push(item)
  }
  return out
}
