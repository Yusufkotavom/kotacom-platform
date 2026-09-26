import { RichText } from '@components/RichText/index'
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

export function BauhausPostCta() {
  return (
    <Section bg="yellow" noRule className="overflow-hidden">
      <span className="absolute -right-12 -top-12 h-48 w-48 rounded-full border-4 border-ink bg-nb-red opacity-70" />
      <div className="relative flex flex-wrap items-center justify-between gap-6">
        <h2 className="max-w-2xl text-3xl uppercase leading-[0.95] tracking-tighter sm:text-4xl">
          Butuh bantuan mengerjakan ini untuk bisnis Anda?
        </h2>
        <LinkButton href="https://wa.me/" variant="ink" size="lg">
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
    Array.isArray(post?.authors) && post.authors[0]?.name ? post.authors[0].name : null

  return (
    <>
      <Section bg="canvas">
        <article className="mx-auto max-w-3xl">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            {cat?.name ? <Pill tone="red">{cat.name}</Pill> : null}
            {date ? (
              <span className="font-mono text-xs font-bold uppercase tracking-widest">{date}</span>
            ) : null}
            {author ? (
              <span className="font-mono text-xs font-bold uppercase tracking-widest">
                · {author}
              </span>
            ) : null}
          </div>
          <h1 className="text-4xl uppercase leading-[0.95] tracking-tighter sm:text-5xl lg:text-6xl">
            {post?.title}
          </h1>
          {post?.excerpt ? (
            <div className="mt-6 text-lg">
              <RichText content={post.excerpt} />
            </div>
          ) : null}
        </article>
      </Section>

      {image?.url ? (
        <Section bg="canvas" compact>
          <div className="mx-auto max-w-4xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt={image.alt || ''}
              className="w-full border-4 border-ink shadow-nb-lg"
            />
          </div>
        </Section>
      ) : null}

      <Section bg="paper">
        <div className="mx-auto max-w-3xl">
          <RichText content={post?.content} />
        </div>
      </Section>

      {related.length > 0 ? (
        <Section bg="canvas">
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
        </Section>
      ) : null}

      <BauhausPostCta />
    </>
  )
}
