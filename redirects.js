import fs from 'fs'
import path from 'path'

/**
 * Redirect map.
 *
 * - `staticRedirects` are hand-written Next.js patterns (support `:slug`).
 * - `redirects.generated.json` is produced by the migration script from the
 *   legacy kotacom.id sitemap + Sanity/WP redirect list (1373 entries:
 *   /product, /products, /blog, /projects, location pages, old WP URLs).
 *   It is sorted longest-first so more specific sources win.
 */
export const redirects = async () => {
  const staticRedirects = [
    // Legacy blog index (/blog) lands on the new article hub.
    { source: '/blog', destination: '/posts', permanent: true },
    // Legacy flat blog URLs (/blog/<slug>) move to the flat post permalink.
    { source: '/blog/:slug', destination: '/posts/:slug', permanent: true },
  ]

  let generated = []
  try {
    const file = path.join(process.cwd(), 'src', 'redirects.generated.json')
    generated = JSON.parse(fs.readFileSync(file, 'utf-8'))
  } catch {
    generated = []
  }

  return [...staticRedirects, ...generated]
}
