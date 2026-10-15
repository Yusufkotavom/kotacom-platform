import Link from 'next/link'
import { Calendar, ChevronRight, Clock, Folder, User } from 'lucide-react'
import { RichText } from '@components/RichText/index'
import type { Post } from '@types'
import { BauhausBlocks } from './blocks'
import { LinkButton } from './Button'
import { Pill } from './Pill'
import { RelatedPostsSection } from './RelatedPosts'
import { Section } from './Section'
import { ShareBar } from './ShareBar'
import { TableOfContents, type TocItem } from './TableOfContents'

function fmtDate(d?: string | null): string {
  if (!d) return ''
  try {
    return new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return ''
  }
}

function readingTime(content: any): string {
  try {
    const text = JSON.stringify(content || '')
    const words = text.split(/\s+/).length
    const mins = Math.max(1, Math.round(words / 200))
    return `${mins} menit baca`
  } catch {
    return '3 menit baca'
  }
}

function extractHeadings(content: any): TocItem[] {
  const headings: TocItem[] = []
  if (!content) return headings

  const scanNode = (node: any) => {
    if (!node) return
    if (node.tag === 'h2' || node.tag === 'h3' || node.type === 'h2' || node.type === 'h3') {
      const text = node.children?.map((c: any) => c.text || '').join('').trim()
      if (text) {
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .slice(0, 50)
        headings.push({
          id,
          text,
          level: node.tag === 'h3' || node.type === 'h3' ? 3 : 2,
        })
      }
    }
    if (Array.isArray(node.children)) {
      node.children.forEach(scanNode)
    }
  }

  if (Array.isArray(content)) {
    content.forEach((block) => {
      // Check block fields like richText, generatedText, or block-specific field objects like blogContentFields
      const blockFields =
        block?.blogContentFields ||
        block?.contentFields ||
        block?.aiContentFields ||
        block?.fields ||
        block
      const blockContent =
        blockFields?.richText ||
        blockFields?.generatedText ||
        blockFields?.content ||
        block?.richText
      if (blockContent) {
        if (Array.isArray(blockContent)) blockContent.forEach(scanNode)
        else if (blockContent.root?.children) blockContent.root.children.forEach(scanNode)
      }
      if (block?.root?.children) {
        block.root.children.forEach(scanNode)
      }
    })
  } else if (content?.root?.children) {
    content.root.children.forEach(scanNode)
  }

  return headings
}

export function BauhausPostCta() {
  return (
    <Section bg="yellow" noRule className="overflow-hidden">
      <span className="absolute -right-12 -top-12 h-48 w-48 rounded-full border-4 border-ink bg-nb-red opacity-70" />
      <div className="relative flex flex-wrap items-center justify-between gap-6">
        <h2 className="max-w-2xl text-3xl uppercase leading-[0.95] tracking-tighter sm:text-4xl">
          Butuh bantuan mengerjakan ini untuk bisnis Anda?
        </h2>
        <LinkButton href="https://wa.me/6285799520350" variant="ink" size="lg">
          Konsultasi gratis
        </LinkButton>
      </div>
    </Section>
  )
}

export function BauhausPost({
  post,
  relatedPosts,
}: {
  post: any
  relatedPosts?: Partial<Post>[]
}) {
  const cat = post?.category && typeof post.category === 'object' ? post.category : null
  const image = post?.image && typeof post.image === 'object' ? post.image : null
  const date = fmtDate(post?.publishedOn)
  const author =
    Array.isArray(post?.authors) && post.authors[0]?.name
      ? post.authors[0].name
      : typeof post?.guestAuthor === 'string'
        ? post.guestAuthor
        : 'Kotacom Admin'
  const estTime = readingTime(post?.content)
  const tocItems = extractHeadings(post?.content)

  const effectiveRelated =
    relatedPosts && relatedPosts.length > 0
      ? relatedPosts
      : Array.isArray(post?.relatedPosts)
        ? post.relatedPosts.filter((r: any) => r && typeof r === 'object' && r.slug)
        : []

  return (
    <>
      <Section bg="canvas" className="border-b-4 border-ink">
        <article className="mx-auto max-w-4xl px-4 sm:px-6">
          {/* Breadcrumb visual */}
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-ink/70">
            <Link href="/" className="hover:text-nb-red hover:underline">
              Beranda
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/posts" className="hover:text-nb-red hover:underline">
              Artikel
            </Link>
            {cat?.name && cat?.slug ? (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <Link href={`/posts/${cat.slug}`} className="hover:text-nb-red hover:underline">
                  {cat.name}
                </Link>
              </>
            ) : null}
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="truncate max-w-[200px] sm:max-w-xs text-ink">{post?.title}</span>
          </nav>

          {/* Metadata badges: Category, Calendar, User, Reading Time */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            {cat?.name ? (
              <span className="inline-flex items-center gap-1.5 border-2 border-ink bg-nb-red px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-nb-sm">
                <Folder className="h-3.5 w-3.5" />
                {cat.name}
              </span>
            ) : null}
            {date ? (
              <span className="inline-flex items-center gap-1.5 border-2 border-ink bg-paper px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-ink shadow-nb-sm">
                <Calendar className="h-3.5 w-3.5 text-nb-blue" />
                <time dateTime={post?.publishedOn}>{date}</time>
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5 border-2 border-ink bg-paper px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-ink shadow-nb-sm">
              <User className="h-3.5 w-3.5 text-nb-red" />
              <span>{author}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 border-2 border-ink bg-paper px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-ink shadow-nb-sm">
              <Clock className="h-3.5 w-3.5 text-nb-yellow" />
              <span>{estTime}</span>
            </span>
          </div>

          <h1 className="text-3xl font-black uppercase leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            {post?.title}
          </h1>
          {post?.excerpt ? (
            <div className="mt-8 border-l-4 border-nb-yellow bg-paper p-5 text-base font-medium text-ink/90 shadow-nb-sm sm:text-lg">
              <RichText content={post.excerpt} />
            </div>
          ) : null}

          {/* Table of Contents */}
          {tocItems.length > 0 && <TableOfContents items={tocItems} />}
        </article>
      </Section>

      {image?.url ? (
        <Section bg="canvas" compact className="border-b-4 border-ink">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt={image.alt || ''}
              className="w-full border-4 border-ink shadow-nb-lg"
            />
          </div>
        </Section>
      ) : null}

      {Array.isArray(post?.content) ? (
        <BauhausBlocks blocks={post.content} />
      ) : post?.content ? (
        <Section bg="paper">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <RichText content={post.content} />
          </div>
        </Section>
      ) : null}

      {/* Social Share Bar */}
      <Section bg="canvas" className="py-2">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <ShareBar
            title={post?.title || 'Artikel Kotacom'}
            url={`/posts/${post?.slug || ''}`}
            slug={post?.slug}
          />
        </div>
      </Section>

      {/* Related Posts Section */}
      {effectiveRelated.length > 0 && (
        <RelatedPostsSection posts={effectiveRelated} />
      )}

      <BauhausPostCta />
    </>
  )
}
