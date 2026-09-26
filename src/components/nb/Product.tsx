import { RichText } from '@components/RichText/index'
import { LinkButton } from './Button'
import { BauhausBlocks } from './blocks/index'
import { Pill } from './Pill'
import { Section } from './Section'

export function BauhausProduct({ product }: { product: any }) {
  const img = product?.featuredImage && typeof product.featuredImage === 'object' ? product.featuredImage : null
  const gallery = Array.isArray(product?.gallery)
    ? product.gallery.filter((g: any) => g?.image && typeof g.image === 'object')
    : []
  const specs = Array.isArray(product?.specs) ? product.specs.filter((s: any) => s?.label) : []
  const hasBlocks = Array.isArray(product?.layout) && product.layout.length > 0

  return (
    <>
      <Section bg="canvas">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            {product?.category ? <Pill tone="blue">{product.category}</Pill> : null}
            <h1 className="mt-5 text-4xl uppercase leading-[0.95] tracking-tighter sm:text-5xl lg:text-6xl">
              {product?.title}
            </h1>
            {product?.price ? (
              <p className="mt-5 inline-block border-4 border-ink bg-nb-yellow px-4 py-2 text-2xl font-black tracking-tight shadow-nb-sm">
                {product.price}
              </p>
            ) : null}
            {product?.shortDescription ? (
              <p className="mt-6 max-w-xl text-lg font-medium leading-relaxed">
                {product.shortDescription}
              </p>
            ) : null}
            <div className="mt-8 flex flex-wrap gap-4">
              <LinkButton href="https://wa.me/6285799520350" variant="primary" size="lg">
                Pesan via WhatsApp
              </LinkButton>
              <LinkButton href="/produk" variant="outline" size="lg">
                Lihat produk lain
              </LinkButton>
            </div>
          </div>
          <div>
            {img?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={img.url}
                alt={img.alt || product?.title || ''}
                className="w-full border-4 border-ink object-cover shadow-nb-lg"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center border-4 border-ink bg-paper shadow-nb-lg">
                <span className="tri h-24 w-24 border-2 border-ink bg-nb-red" />
              </div>
            )}
          </div>
        </div>
      </Section>

      {specs.length > 0 ? (
        <Section bg="paper">
          <h2 className="mb-6 text-3xl uppercase tracking-tighter">Spesifikasi</h2>
          <dl className="max-w-3xl border-4 border-ink bg-paper shadow-nb">
            {specs.map((s: any, i: number) => (
              <div
                key={s.id || i}
                className="flex flex-col gap-1 border-b-2 border-ink p-4 last:border-b-0 sm:flex-row sm:items-center"
              >
                <dt className="w-full font-mono text-xs font-bold uppercase tracking-widest text-ink/70 sm:w-1/3">
                  {s.label}
                </dt>
                <dd className="font-bold sm:w-2/3">{s.value}</dd>
              </div>
            ))}
          </dl>
        </Section>
      ) : null}

      {gallery.length > 0 ? (
        <Section bg="canvas">
          <h2 className="mb-6 text-3xl uppercase tracking-tighter">Galeri</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((g: any, i: number) => (
              <figure key={g.id || i}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={g.image.url}
                  alt={g.image.alt || ''}
                  className="w-full border-4 border-ink object-cover shadow-nb"
                />
                {g.caption ? (
                  <figcaption className="mt-2 font-mono text-xs font-bold uppercase tracking-widest">
                    {g.caption}
                  </figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        </Section>
      ) : null}

      {hasBlocks ? <BauhausBlocks blocks={product.layout} /> : null}

      <Section bg="yellow" noRule className="overflow-hidden">
        <span className="absolute -right-12 -top-12 h-48 w-48 rotate-45 border-4 border-ink bg-nb-blue opacity-70" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <h2 className="max-w-2xl text-3xl uppercase leading-[0.95] tracking-tighter sm:text-4xl">
            Siap mengerjakan {product?.title} untuk bisnis Anda?
          </h2>
          <LinkButton href="https://wa.me/6285799520350" variant="ink" size="lg">
            Hubungi kami
          </LinkButton>
        </div>
      </Section>
    </>
  )
}
