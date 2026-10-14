import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Calendar } from 'lucide-react'
import type { Post } from '@types'
import { Pill } from './Pill'
import { Section } from './Section'

function formatDate(d?: string | null): string {
  if (!d) return ''
  try {
    return new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

export function RelatedPostsSection({
  posts,
  title = 'Artikel Terkait Lainnya',
}: {
  posts?: Partial<Post>[] | null
  title?: string
}) {
  if (!posts || posts.length === 0) return null

  return (
    <Section bg="canvas" className="border-t-4 border-ink py-12 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-8 flex items-center justify-between border-b-4 border-ink pb-4">
          <h3 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-ink">
            {title}
          </h3>
          <Link
            href="/posts"
            className="inline-flex items-center gap-1 font-display text-xs sm:text-sm font-black uppercase text-nb-red hover:underline"
          >
            Semua Artikel
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => {
            const cat = p.category && typeof p.category === 'object' ? (p.category as any) : null
            const image = p.image && typeof p.image === 'object' ? (p.image as any) : null
            const slug = p.slug

            return (
              <article
                key={slug || p.id}
                className="flex flex-col border-4 border-ink bg-paper shadow-nb-sm transition-transform hover:-translate-y-1 hover:shadow-nb"
              >
                {image?.url && (
                  <div className="relative aspect-video w-full overflow-hidden border-b-4 border-ink bg-nb-canvas">
                    <Image
                      src={image.url}
                      alt={image.alt || p.title || 'Artikel Kotacom'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    {cat?.name && (
                      <Pill tone="yellow">
                        {cat.name}
                      </Pill>
                    )}
                    {p.publishedOn && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-ink-muted">
                        <Calendar className="h-3 w-3" />
                        {formatDate(p.publishedOn)}
                      </span>
                    )}
                  </div>
                  <h4 className="mb-2 line-clamp-2 font-display text-lg font-black leading-snug uppercase text-ink">
                    <Link
                      href={`/posts/${slug}`}
                      className="hover:text-nb-red hover:underline transition-colors"
                    >
                      {p.title}
                    </Link>
                  </h4>
                  <div className="mt-auto pt-4">
                    <Link
                      href={`/posts/${slug}`}
                      className="inline-flex items-center gap-1 font-display text-xs font-black uppercase text-nb-blue hover:text-nb-red transition-colors"
                    >
                      Baca Selengkapnya
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </Section>
  )
}
