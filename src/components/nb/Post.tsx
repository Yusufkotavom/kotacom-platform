import Link from 'next/link'
import { Calendar, ChevronRight, Clock, Folder, User } from 'lucide-react'
import { RichText } from '@components/RichText/index'
import { BauhausBlocks } from './blocks'
import { LinkButton } from './Button'
import { Pill } from './Pill'
import { Section } from './Section'

function fmtDate(d?: string) {
  if (!d) return null
  try {
    return new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return null
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

export function BauhausPost({ post }: { post: any }) {
  const cat = post?.category && typeof post.category === 'object' ? post.category : null
  const image = post?.image && typeof post.image === 'object' ? post.image : null
  const related = Array.isArray(post?.relatedPosts)
    ? post.relatedPosts.filter((r: any) => r && typeof r === 'object' && r.slug)
    : []
  const date = fmtDate(post?.publishedOn)
  const author =
    Array.isArray(post?.authors) && post.authors[0]?.name
      ? post.authors[0].name
      : typeof post?.guestAuthor === 'string'
        ? post.guestAuthor
        : 'Kotacom Admin'
  const estTime = readingTime(post?.content)

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

      {related.length > 0 ? (
        <Section bg="canvas">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <h2 className="mb-8 text-3xl uppercase tracking-tighter">Artikel lain</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r: any, i: number) => (
                <a
                  key={r.id || i}
                  href={`/posts/${r.slug}`}
                  className="block border-4 border-ink bg-paper p-5 shadow-nb press"
                >
                  <span className="text-lg font-black uppercase leading-tight tracking-tight">
                    {r.title || r.slug}
                  </span>
                  <span className="mt-3 block font-mono text-xs font-bold uppercase tracking-widest">
                    Baca artikel &rarr;
                  </span>
                </a>
              ))}
            </div>
          </div>
        </Section>
      ) : null}

      <BauhausPostCta />
    </>
  )
}
