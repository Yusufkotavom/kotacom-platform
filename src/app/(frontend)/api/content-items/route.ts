import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url)
  const collection = searchParams.get('collection') || 'case-studies'
  const mode = searchParams.get('mode') || 'latest'
  const limitParam = parseInt(searchParams.get('limit') || '6', 10)
  const limit = Math.min(Math.max(1, isNaN(limitParam) ? 6 : limitParam), 20)

  const allowed = ['case-studies', 'posts', 'products', 'pages']
  const targetCollection = allowed.includes(collection) ? collection : 'case-studies'

  try {
    const payload = await getPayload({ config: configPromise })

    // If random mode, query a slightly larger batch and shuffle
    const fetchLimit = mode === 'random' ? Math.max(limit * 3, 15) : limit

    const res = await payload.find({
      collection: targetCollection as any,
      limit: fetchLimit,
      sort: mode === 'random' ? undefined : '-createdAt',
      depth: 1,
      where: {
        _status: {
          equals: 'published',
        },
      },
    })

    let docs = res.docs || []

    if (mode === 'random') {
      // Shuffle array
      docs = [...docs].sort(() => Math.random() - 0.5)
      docs = docs.slice(0, limit)
    }

    // Normalize items
    const items = docs.map((doc: any) => {
      let slug = doc.slug || ''
      let url = `/${targetCollection}/${slug}`
      let badge = 'Studi Kasus'

      if (targetCollection === 'posts') {
        const cat = typeof doc.category === 'object' && doc.category?.slug ? doc.category.slug : 'blog'
        url = `/posts/${cat}/${slug}`
        badge = 'Artikel'
      } else if (targetCollection === 'products') {
        url = `/produk/${slug}`
        badge = 'Produk'
      } else if (targetCollection === 'pages') {
        url = `/${slug}`
        badge = 'Halaman'
      } else if (targetCollection === 'case-studies') {
        url = `/case-studies/${slug}`
        badge = 'Studi Kasus'
      }

      const featuredImg = doc.featuredImage || doc.image || doc.meta?.image
      const imgUrl = typeof featuredImg === 'object' && featuredImg?.url ? featuredImg.url : null

      return {
        id: doc.id,
        title: doc.title || 'Untitled',
        excerpt: doc.excerpt || doc.meta?.description || doc.shortDescription || '',
        url,
        badge,
        imageUrl: imgUrl,
      }
    })

    return NextResponse.json({ ok: true, items })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message, items: [] }, { status: 500 })
  }
}
