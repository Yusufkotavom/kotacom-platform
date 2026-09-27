/**
 * clean-redirects.ts
 * ------------------
 * Reconcile src/redirects.generated.json against the real pages/posts/products
 * now present in Payload, so that:
 *   1. No redirect SHADOWS a real page (source slug == an existing published
 *      page/product/post slug) — such a redirect would prevent the real page
 *      from ever rendering. These are removed.
 *   2. No redirect points to a DEAD destination (`/produk/<slug>` or
 *      `/posts/<slug>` that doesn't exist). These are retargeted to their hub
 *      so the 301 never lands on a 404.
 * Everything else (legitimate legacy → real-page mappings, and old WordPress
 * URLs pointing at hubs) is preserved to keep SEO link-equity.
 *
 * Writes the reconciled array back to src/redirects.generated.json and prints a
 * summary. Idempotent.
 *
 * Run: ./node_modules/.bin/tsx scripts/clean-redirects.ts
 */
import 'dotenv/config'
import { config as loadEnv } from 'dotenv'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'

import configPromise from '../src/payload.config'

loadEnv({ path: '.env.local', override: true })

const REDIRECTS_FILE = path.join(process.cwd(), 'src', 'redirects.generated.json')
const HUBS = new Set(['/produk', '/posts', '/', '/case-studies', '/blog'])

type Redirect = { source: string; destination: string; permanent?: boolean }

const collectSlugs = async (payload: any, collection: string): Promise<Set<string>> => {
  const out = new Set<string>()
  let page = 1
  while (true) {
    const r = await payload.find({
      collection,
      limit: 500,
      page,
      depth: 0,
      overrideAccess: true,
      select: { slug: true },
    })
    for (const d of r.docs) if (d.slug) out.add(d.slug as string)
    if (!r.hasNextPage) break
    page++
  }
  return out
}

const main = async () => {
  const payload: any = await getPayload({ config: configPromise })
  const products = await collectSlugs(payload, 'products')
  const posts = await collectSlugs(payload, 'posts')
  const pages = await collectSlugs(payload, 'pages')

  const raw: Redirect[] = JSON.parse(fs.readFileSync(REDIRECTS_FILE, 'utf8'))

  const destExists = (dest: string): boolean => {
    if (HUBS.has(dest)) return true
    if (dest.startsWith('/produk/')) return products.has(dest.slice('/produk/'.length))
    if (dest.startsWith('/posts/')) {
      // /posts/<slug> or /posts/<category>/<slug>
      const parts = dest.split('/').filter(Boolean) // ['posts', ...]
      const slug = parts[parts.length - 1]
      return posts.has(slug)
    }
    if (dest.startsWith('/case-studies/')) return true // case studies handled by their own route
    // flat page destination
    return pages.has(dest.replace(/^\//, ''))
  }

  const hubFor = (dest: string): string => {
    if (dest.startsWith('/produk')) return '/produk'
    if (dest.startsWith('/posts')) return '/posts'
    if (dest.startsWith('/case-studies')) return '/case-studies'
    return '/'
  }

  let removedShadow = 0
  let retargetedDead = 0
  let retargetedDeep = 0
  const out: Redirect[] = []

  for (const r of raw) {
    const srcSlug = r.source.replace(/^\//, '')

    // (1a) Source matches a real PAGE slug → the flat route `/[...slug]` will
    // serve that page, so a redirect here would shadow it. Drop the redirect.
    if (pages.has(srcSlug)) {
      removedShadow++
      continue
    }

    // (1b) Source matches a real PRODUCT or POST slug. Those are NOT reachable
    // at the flat root (products live at /produk/<slug>, posts at
    // /posts/<slug>), so instead of removing, retarget the redirect to the
    // real deep URL so the legacy URL resolves to real content.
    if (products.has(srcSlug)) {
      out.push({ ...r, destination: `/produk/${srcSlug}` })
      retargetedDeep++
      continue
    }
    if (posts.has(srcSlug)) {
      out.push({ ...r, destination: `/posts/${srcSlug}` })
      retargetedDeep++
      continue
    }

    // (2) retarget dead destinations to their hub
    if (!destExists(r.destination)) {
      const hub = hubFor(r.destination)
      if (hub !== r.destination) {
        out.push({ ...r, destination: hub })
        retargetedDead++
        continue
      }
    }

    out.push(r)
  }

  // Sort longest source first so specific sources win (matches original policy).
  out.sort((a, b) => b.source.length - a.source.length)

  fs.writeFileSync(REDIRECTS_FILE, JSON.stringify(out, null, 2) + '\n')

  console.log('Redirect reconciliation complete:')
  console.log('  input redirects      :', raw.length)
  console.log('  removed (page shadow):', removedShadow)
  console.log('  retargeted → deep URL:', retargetedDeep)
  console.log('  retargeted (dead)    :', retargetedDead)
  console.log('  output redirects     :', out.length)
  console.log('  DB slugs — products:', products.size, 'posts:', posts.size, 'pages:', pages.size)
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
