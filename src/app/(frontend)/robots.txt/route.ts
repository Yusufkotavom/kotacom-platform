import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://kotacom.id').replace(/\/$/, '')

/**
 * Served as a real route (not a static file) so the catch-all `[...slug]` page
 * can never shadow it. In production (NEXT_PUBLIC_IS_LIVE=true) crawlers are
 * allowed; on the boilerplate/staging they are fully disallowed.
 */
export function GET(): NextResponse {
  const isLive = process.env.NEXT_PUBLIC_IS_LIVE === 'true'

  const body = isLive
    ? `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /api/preview
Disallow: /api/exit-preview
Disallow: /api/revalidate
Disallow: /preview
Disallow: /thanks-for-subscribing

Sitemap: ${base}/sitemap.xml
Host: ${base}
`
    : `User-agent: *
Disallow: /
`

  return new NextResponse(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
