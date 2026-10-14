import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Calendar, ChevronRight, Folder } from 'lucide-react'
import type { Category, Post } from '@types'
import { Card } from './Card'
import { Pill } from './Pill'
import { Section, SectionTag } from './Section'

function formatDate(d?: string | null): string {
  if (!d) return ''
  try {
    return new Date(d).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return ''
  }
}

export function BauhausCategoryArchive({
  archive,
  archives,
  category,
}: {
  archive: Partial<Category>
  archives: Partial<Category>[]
  category: string
}) {
  const posts = (archive.posts?.docs || []).filter(
    (p): p is Post => typeof p !== 'string' && Boolean(p?.slug),
  )

  const activeCategoryName = archive.name || archive.headline || category

  return (
    <>
      {/* Category Hero & Breadcrumb */}
      <Section bg="canvas" className="border-b-4 border-ink">
        <div className="mx-auto max-w-7xl">
          {/* Breadcrumbs */}
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex flex-wrap items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-ink/70"
          >
            <Link href="/" className="hover:text-nb-red hover:underline">
              Beranda
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/posts" className="hover:text-nb-red hover:underline">
              Artikel
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-ink">{activeCategoryName}</span>
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            <SectionTag index="Kategori" label="Topik" />
            <span className="inline-flex items-center gap-1.5 border-2 border-ink bg-nb-yellow px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-ink shadow-nb-sm">
              <Folder className="h-3.5 w-3.5" />
              <span>{posts.length} Artikel</span>
            </span>
          </div>

          <h1 className="mt-4 text-4xl uppercase leading-[0.95] tracking-tighter sm:text-5xl lg:text-6xl font-black">
            {activeCategoryName}
          </h1>

          {archive.description && (
            <p className="mt-5 max-w-3xl text-lg font-medium leading-relaxed text-ink/80">
              {archive.description}
            </p>
          )}

          {/* Category Tabs / Filter Bar */}
          {archives && archives.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-2 border-t-4 border-ink pt-6">
              <span className="mr-2 font-mono text-xs font-bold uppercase tracking-wider text-ink-muted">
                Kategori:
              </span>
              <Link
                href="/posts"
                className="border-2 border-ink bg-paper px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider hover:bg-nb-yellow transition-colors"
              >
                Semua
              </Link>
              {archives.map((cat) => {
                const isActive = cat.slug === category
                return (
                  <Link
                    key={cat.slug}
                    href={`/posts/${cat.slug}`}
                    className={`border-2 border-ink px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider transition-all ${
                      isActive
                        ? 'bg-nb-red text-white shadow-nb-xs'
                        : 'bg-paper text-ink hover:bg-nb-yellow'
                    }`}
                  >
                    {cat.name}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </Section>

      {/* Posts Grid */}
      <Section bg="paper">
        <div className="mx-auto max-w-7xl">
          {posts.length === 0 ? (
            <div className="border-4 border-ink bg-nb-canvas p-10 text-center shadow-nb">
              <p className="font-display text-xl font-black uppercase text-ink">
                Belum ada artikel di kategori {activeCategoryName}.
              </p>
              <p className="mt-2 text-sm text-ink-muted">
                Silakan cek kategori lainnya atau kembali ke halaman utama blog.
              </p>
              <div className="mt-6">
                <Link
                  href="/posts"
                  className="inline-flex items-center gap-2 border-2 border-ink bg-nb-blue px-6 py-3 font-display text-sm font-black uppercase text-white shadow-nb-sm hover:-translate-y-0.5 active:translate-y-0 transition-transform"
                >
                  Lihat Semua Artikel
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, idx) => {
                const image =
                  post.image && typeof post.image === 'object' ? (post.image as any) : null
                const shapes = ['circle', 'square', 'triangle', 'diamond'] as const
                const tones = ['yellow', 'blue', 'red', 'yellow'] as const

                return (
                  <article
                    key={post.slug || post.id}
                    className="flex flex-col border-4 border-ink bg-paper shadow-nb-sm transition-transform hover:-translate-y-1 hover:shadow-nb"
                  >
                    {image?.url && (
                      <div className="relative aspect-video w-full overflow-hidden border-b-4 border-ink bg-nb-canvas">
                        <Image
                          src={image.url}
                          alt={image.alt || post.title || 'Artikel Kotacom'}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-6">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <Pill tone="red">{activeCategoryName}</Pill>
                        {post.publishedOn && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-ink-muted">
                            <Calendar className="h-3 w-3" />
                            {formatDate(post.publishedOn)}
                          </span>
                        )}
                      </div>

                      <h2 className="mb-3 line-clamp-2 font-display text-xl font-black leading-tight uppercase text-ink">
                        <Link
                          href={`/posts/${post.slug}`}
                          className="hover:text-nb-red hover:underline transition-colors"
                        >
                          {post.title}
                        </Link>
                      </h2>

                      <div className="mt-auto pt-4 border-t-2 border-ink/10 flex items-center justify-between">
                        <Link
                          href={`/posts/${post.slug}`}
                          className="inline-flex items-center gap-1 font-display text-xs font-black uppercase text-nb-blue hover:text-nb-red transition-colors"
                        >
                          Baca Artikel
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </Section>
    </>
  )
}
