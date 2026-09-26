import config from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'

import type {
  CaseStudy,
  Category,
  Footer,
  Form,
  MainMenu,
  Page,
  Post,
  Product,
  SiteSetting,
  TopBar,
  WhatsappMarketing,
} from '../../payload-types'

export const fetchGlobals = async (): Promise<{
  footer: Footer
  mainMenu: MainMenu
  topBar: TopBar
  siteSettings: SiteSetting
  whatsapp: WhatsappMarketing
}> => {
  const payload = await getPayload({ config })
  const mainMenu = await payload.findGlobal({
    slug: 'main-menu',
    depth: 1,
  })
  const footer = await payload.findGlobal({
    slug: 'footer',
    depth: 1,
  })
  const topBar = await payload.findGlobal({
    slug: 'topBar',
    depth: 1,
  })
  const siteSettings = await payload.findGlobal({
    slug: 'site-settings',
    depth: 1,
  })
  const whatsapp = await payload.findGlobal({
    slug: 'whatsapp-marketing',
    depth: 0,
  })

  return {
    footer,
    mainMenu,
    topBar,
    siteSettings,
    whatsapp,
  }
}

export const fetchSiteSettings = async (): Promise<SiteSetting> => {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'site-settings', depth: 1 })
}

export const fetchWhatsApp = async (): Promise<WhatsappMarketing> => {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'whatsapp-marketing', depth: 0 })
}

export const fetchPage = async (incomingSlugSegments: string[]): Promise<null | Page> => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config })
  const slugSegments = incomingSlugSegments || ['home']
  const fullPath = slugSegments.join('/')
  const lastSegment = slugSegments.at(-1)

  const data = await payload.find({
    collection: 'pages',
    depth: 2,
    draft,
    limit: 5,
    where: {
      and: [
        // Flat pages store only their last segment; generated pages store the
        // full nested path (`percetakan/cetak-buku/bandung`). Match either.
        {
          slug: {
            in: [...new Set([lastSegment, fullPath])],
          },
        },
        ...(draft
          ? []
          : [
              {
                _status: {
                  equals: 'published',
                },
              },
            ]),
      ],
    },
  })

  const pagePath = `/${fullPath}`

  const page =
    data.docs.find(({ breadcrumbs }: Page) => {
      if (!breadcrumbs) {
        return false
      }
      const { url } = breadcrumbs[breadcrumbs.length - 1]
      return url === pagePath
    }) ??
    // Generated/programmatic pages carry a full nested slug (e.g.
    // `percetakan/cetak-buku/bandung`); match the whole path too.
    data.docs.find(({ slug: docSlug }: Page) => `/${docSlug}` === pagePath)

  if (page) {
    return page
  }

  return null
}

export const fetchPages = async (): Promise<Partial<Page>[]> => {
  const payload = await getPayload({ config })
  const data = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 300,
    select: {
      breadcrumbs: true,
    },
    where: {
      and: [
        {
          slug: {
            not_equals: 'cloud',
          },
        },
        {
          _status: {
            equals: 'published',
          },
        },
      ],
    },
  })

  return data.docs
}

export const fetchPosts = async (): Promise<Partial<Post>[]> => {
  const payload = await getPayload({ config })
  const data = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 300,
    select: {
      slug: true,
      category: true,
    },
  })

  return data.docs
}

export const fetchBlogPosts = async (): Promise<Partial<Post>[]> => {
  const currentDate = new Date()
  const payload = await getPayload({ config })

  const data = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 300,
    select: {
      slug: true,
      authors: true,
      image: true,
      publishedOn: true,
      title: true,
    },
    sort: '-publishedOn',
    where: {
      and: [
        { publishedOn: { less_than_equal: currentDate } },
        { _status: { equals: 'published' } },
      ],
    },
  })
  return data.docs
}

export const fetchArchive = async (slug: string, draft?: boolean): Promise<Partial<Category>> => {
  const payload = await getPayload({ config })
  const currentDate = new Date()

  const data = await payload.find({
    collection: 'categories',
    depth: 2,
    draft,
    joins: {
      posts: {
        sort: '-publishedOn',
        where: {
          and: [
            { publishedOn: { less_than_equal: currentDate } },
            { _status: { equals: 'published' } },
          ],
        },
      },
    },
    limit: 1,
    select: {
      name: true,
      slug: true,
      description: true,
      headline: true,
      posts: true,
    },
    where: {
      and: [{ slug: { equals: slug } }],
    },
  })
  return data.docs[0]
}

export const fetchArchives = async (slug?: string): Promise<Partial<Category>[]> => {
  const payload = await getPayload({ config })

  const data = await payload.find({
    collection: 'categories',
    depth: 0,
    select: {
      name: true,
      slug: true,
    },
    sort: 'name',
    ...(slug && {
      where: {
        slug: {
          not_equals: slug,
        },
      },
    }),
  })

  return data.docs
}

export const fetchBlogPost = async (slug: string, category): Promise<Partial<Post>> => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config })

  const data = await payload.find({
    collection: 'posts',
    depth: 2,
    draft,
    limit: 1,
    overrideAccess: draft,
    select: {
      authors: true,
      authorType: true,
      category: true,
      content: true,
      excerpt: true,
      featuredMedia: true,
      guestAuthor: true,
      guestSocials: true,
      image: true,
      meta: true,
      publishedOn: true,
      relatedPosts: true,
      title: true,
      videoUrl: true,
    },
    where: {
      and: [
        { slug: { equals: slug } },
        { 'category.slug': { equals: category } },
        ...(draft
          ? []
          : [
              {
                _status: {
                  equals: 'published',
                },
              },
            ]),
      ],
    },
  })

  return data.docs[0]
}

/**
 * Resolve a post by its slug alone, ignoring the category segment.
 * Powers the flat `/posts/<slug>` URL that the admin preview and
 * formatPagePath() emit, so a post never depends on its category slug
 * staying stable.
 */
export const fetchPostBySlug = async (slug: string): Promise<Partial<Post>> => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config })

  const data = await payload.find({
    collection: 'posts',
    depth: 2,
    draft,
    limit: 1,
    overrideAccess: draft,
    select: {
      authors: true,
      authorType: true,
      category: true,
      content: true,
      excerpt: true,
      featuredMedia: true,
      guestAuthor: true,
      guestSocials: true,
      image: true,
      meta: true,
      publishedOn: true,
      relatedPosts: true,
      title: true,
      videoUrl: true,
    },
    where: {
      and: [
        { slug: { equals: slug } },
        ...(draft
          ? []
          : [
              {
                _status: {
                  equals: 'published',
                },
              },
            ]),
      ],
    },
  })

  return data.docs[0]
}

export const fetchCaseStudies = async (): Promise<Partial<CaseStudy>[]> => {
  const payload = await getPayload({ config })
  const data = await payload.find({
    collection: 'case-studies',
    depth: 0,
    limit: 300,
    select: {
      slug: true,
    },
  })

  return data.docs
}

export const fetchCaseStudy = async (slug: string): Promise<CaseStudy> => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config })

  const data = await payload.find({
    collection: 'case-studies',
    depth: 1,
    draft,
    limit: 1,
    where: {
      and: [
        { slug: { equals: slug } },
        ...(draft
          ? []
          : [
              {
                _status: {
                  equals: 'published',
                },
              },
            ]),
      ],
    },
  })

  return data.docs[0]
}

export const fetchProducts = async (): Promise<Partial<Product>[]> => {
  const payload = await getPayload({ config })
  const data = await payload.find({
    collection: 'products',
    depth: 0,
    limit: 300,
    select: { slug: true, offeringType: true },
    sort: '-createdAt',
  })
  return data.docs
}

export const fetchProduct = async (slug: string): Promise<Product> => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config })
  const data = await payload.find({
    collection: 'products',
    depth: 1,
    draft,
    limit: 1,
    where: {
      and: [
        { slug: { equals: slug } },
        ...(draft ? [] : [{ _status: { equals: 'published' as const } }]),
      ],
    },
  })
  return data.docs[0]
}

export const fetchForm = async (name: string): Promise<Form> => {
  const payload = await getPayload({ config })

  const data = await payload.find({
    collection: 'forms',
    depth: 1,
    limit: 1,
    where: {
      title: {
        equals: name,
      },
    },
  })

  return data.docs[0]
}
