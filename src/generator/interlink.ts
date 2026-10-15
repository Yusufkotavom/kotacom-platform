import { buildGeneratorSlug } from './slug'
import { buildTokens, clean, deepReplace, titleCase } from './tokens'
import type { GeneratorProgramLite, GeneratorRow, GeneratorTemplateLite } from './types'

export type InterlinkTarget = {
  city?: string
  cluster?: string
  key: string
  label: string
  slug: string
  title?: string
  url: string
}

/**
 * Bangun katalog target interlink dari seluruh baris dalam program.
 */
export const buildInterlinkCatalog = (
  rows: GeneratorRow[],
  template: GeneratorTemplateLite,
  program: GeneratorProgramLite,
): InterlinkTarget[] => {
  return rows.map((row) => {
    const slug = buildGeneratorSlug({
      city: row.city,
      primaryKeyword: row.primaryKeyword,
      routeBase: program.routeBase || template.routeBase,
      service: row.service,
      slugPattern: template.slugPattern,
    })
    const tokens = buildTokens(template, row)
    const label = clean(
      tokens.label ||
        tokens.city ||
        tokens.primaryKeyword ||
        titleCase(slug.split('/').pop()?.replace(/-/g, ' ') || 'Layanan'),
    )
    const title = deepReplace(template.h1Pattern || '{{primaryKeyword}} {{city}}', tokens).trim()

    return {
      city: clean(row.city),
      cluster: clean(String(row.province ?? row.region ?? row.category ?? '')),
      key: String(row.key || slug),
      label,
      slug,
      title,
      url: `/${slug.replace(/^\//, '')}`,
    }
  })
}

export type InterlinkResult = {
  citiesList: string
  html: string
  links: {
    link: {
      label: string
      newTab: boolean
      type: 'custom'
      url: string
    }
  }[]
  markdown: string
}

/**
 * Deterministic pseudo-random number generator based on string seed.
 * Memastikan link acak tetap stabil antar-run untuk baris yang sama.
 */
const seededRandom = (seed: string): number => {
  let h = 0xdeadbeef
  for (let i = 0; i < seed.length; i += 1) {
    h = Math.imul(h ^ seed.charCodeAt(i), 2654435761)
  }
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

/**
 * Memilih subset link interlink yang aman, relevan, dan terdistribusi untuk suatu baris.
 * Menggabungkan cluster regional + ring buffer mesh (anti-orphan) + variasi deterministik.
 */
export const selectInterlinks = (input: {
  allTargets: InterlinkTarget[]
  count?: number
  currentIndex: number
  currentRow: GeneratorRow
}): InterlinkResult => {
  const { allTargets, currentIndex, currentRow } = input
  const count = Math.max(2, Math.min(input.count ?? 6, 16))
  const total = allTargets.length

  if (total <= 1) {
    return { citiesList: '', html: '', links: [], markdown: '' }
  }

  const currentKey = currentRow.key || ''
  const currentCluster =
    String(currentRow.province ?? currentRow.region ?? currentRow.cluster ?? '').toLowerCase().trim()

  const candidates: InterlinkTarget[] = []
  const seenUrls = new Set<string>()

  const addCandidate = (target?: InterlinkTarget): void => {
    if (!target) return
    if (target.key === currentKey || target.url === allTargets[currentIndex]?.url) return
    if (seenUrls.has(target.url)) return
    seenUrls.add(target.url)
    candidates.push(target)
  }

  // 1. Cluster affinity (provinsi / wilayah yang sama jika ada)
  if (currentCluster) {
    const sameCluster = allTargets.filter(
      (t, idx) =>
        idx !== currentIndex &&
        t.cluster &&
        t.cluster.toLowerCase().trim() === currentCluster,
    )
    for (const item of sameCluster.slice(0, Math.floor(count / 2))) {
      addCandidate(item)
    }
  }

  // 2. Ring buffer mesh: tetangga indeks terdekat (+1, -1, +2, -2...)
  // Menjamin 100% halaman tersambung dalam satu cincin graf tertutup
  for (let step = 1; step < total && candidates.length < count; step += 1) {
    const nextIdx = (currentIndex + step) % total
    const prevIdx = (currentIndex - step + total) % total
    addCandidate(allTargets[nextIdx])
    if (candidates.length < count) {
      addCandidate(allTargets[prevIdx])
    }
  }

  // 3. Tambahan variasi pseudo-random terdistribusi stabil jika masih ada kuota
  if (candidates.length < count) {
    const pool = allTargets.filter((_, idx) => idx !== currentIndex && !seenUrls.has(allTargets[idx].url))
    const seed = `${currentKey}-${total}`
    let salt = 0
    while (pool.length > 0 && candidates.length < count) {
      const randIdx = Math.floor(seededRandom(`${seed}-${salt}`) * pool.length)
      addCandidate(pool[randIdx])
      pool.splice(randIdx, 1)
      salt += 1
    }
  }

  const selected = candidates.slice(0, count)

  const links = selected.map((item) => ({
    link: {
      label: item.label || item.title || item.city || 'Wilayah Lain',
      newTab: false,
      type: 'custom' as const,
      url: item.url.startsWith('/') ? item.url : `/${item.url}`,
    },
  }))

  const markdown = selected
    .map((item) => `- [${item.label || item.title}](${item.url})`)
    .join('\n')

  const html = `<ul class="generator-interlinks">\n${selected
    .map((item) => `  <li><a href="${item.url}">${item.label || item.title}</a></li>`)
    .join('\n')}\n</ul>`

  const citiesList = selected
    .map((item) => item.city || item.label)
    .filter(Boolean)
    .join(', ')

  return {
    citiesList,
    html,
    links,
    markdown,
  }
}

/**
 * Bangun blok LinkGrid siap pakai untuk disisipkan ke layout halaman.
 */
export const buildInterlinkBlock = (input: {
  heading?: string
  links: InterlinkResult['links']
}): Record<string, unknown> => ({
  blockType: 'linkGrid',
  id: `interlink-${Math.random().toString(36).slice(2, 9)}`,
  linkGridFields: {
    links: input.links,
    settings: {},
  },
})
