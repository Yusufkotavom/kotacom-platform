import { fetchBlogPosts } from '@data/index'

export const dynamic = 'force-dynamic'

const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://kotacom.id').replace(/\/$/, '')

const escape = (str: string): string =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

export async function GET(): Promise<Response> {
  let posts: Array<{ slug?: string | null; title?: string | null; publishedOn?: string | null }> = []
  try {
    posts = await fetchBlogPosts()
  } catch {
    posts = []
  }

  const items = posts
    .filter((p) => p?.slug)
    .map((p) => {
      const url = `${base}/posts/${p.slug}`
      return `    <item>
      <title>${escape(p.title || 'Artikel Kotacom')}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      ${p.publishedOn ? `<pubDate>${new Date(p.publishedOn).toUTCString()}</pubDate>` : ''}
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Kotacom — Artikel &amp; Insights</title>
    <link>${base}/posts</link>
    <description>Artikel seputar IT, software, dan percetakan dari tim Kotacom.</description>
    <language>id-ID</language>
    <atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800, s-maxage=1800',
    },
  })
}
