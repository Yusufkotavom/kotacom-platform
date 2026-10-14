import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CheckCircle2, ChevronRight, HelpCircle, MessageCircle, Phone, Tag } from 'lucide-react'
import { RichText } from '@components/RichText/index'
import type { Product } from '@types'
import { LinkButton } from './Button'
import { BauhausBlocks } from './blocks/index'
import { Pill } from './Pill'
import { Section } from './Section'
import { ShareBar } from './ShareBar'

export function BauhausProduct({
  product,
  relatedProducts,
}: {
  product: any
  relatedProducts?: Partial<Product>[]
}) {
  const img = product?.featuredImage && typeof product.featuredImage === 'object' ? product.featuredImage : null
  const gallery = Array.isArray(product?.gallery)
    ? product.gallery.filter((g: any) => g?.image && typeof g.image === 'object')
    : []
  const specs = Array.isArray(product?.specs) ? product.specs.filter((s: any) => s?.label) : []
  const hasBlocks = Array.isArray(product?.layout) && product.layout.length > 0
  const offeringLabel =
    product?.offeringType === 'service'
      ? 'Layanan'
      : product?.offeringType === 'portfolio'
        ? 'Portofolio'
        : 'Produk'

  return (
    <>
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
            <Link href="/produk" className="hover:text-nb-red hover:underline">
              Produk & Layanan
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-ink truncate max-w-xs">{product?.title}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Pill
                  tone={
                    product?.offeringType === 'service'
                      ? 'blue'
                      : product?.offeringType === 'product'
                        ? 'red'
                        : 'yellow'
                  }
                >
                  {offeringLabel}
                </Pill>
                {product?.category ? <Pill tone="white">{product.category}</Pill> : null}
              </div>

              <h1 className="mt-4 text-4xl uppercase leading-[0.95] tracking-tighter sm:text-5xl lg:text-6xl font-black">
                {product?.title}
              </h1>

              {product?.price ? (
                <div className="mt-5 inline-flex items-center gap-2 border-4 border-ink bg-nb-yellow px-5 py-2.5 text-2xl font-black tracking-tight shadow-nb-sm">
                  <Tag className="h-6 w-6 text-ink" />
                  <span>{product.price}</span>
                </div>
              ) : null}

              {product?.shortDescription ? (
                <p className="mt-6 max-w-xl text-lg font-medium leading-relaxed text-ink/90">
                  {product.shortDescription}
                </p>
              ) : null}

              {/* USP / Feature highlights */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t-2 border-b-2 border-ink py-4 font-mono text-xs font-bold uppercase">
                <div className="flex items-center gap-2 text-ink">
                  <CheckCircle2 className="h-4 w-4 text-nb-green" />
                  <span>Garansi Kualitas & QC Ketat</span>
                </div>
                <div className="flex items-center gap-2 text-ink">
                  <CheckCircle2 className="h-4 w-4 text-nb-green" />
                  <span>Konsultasi & Estimasi Cepat</span>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <LinkButton href="https://wa.me/6285799520350" variant="primary" size="lg">
                  Pesan via WhatsApp
                </LinkButton>
                <LinkButton href="/produk" variant="outline" size="lg">
                  Semua Produk
                </LinkButton>
              </div>
            </div>

            <div>
              {img?.url ? (
                <div className="relative aspect-4/3 w-full overflow-hidden border-4 border-ink bg-nb-canvas shadow-nb-lg">
                  <Image
                    src={img.url}
                    alt={img.alt || product?.title || 'Produk Kotacom'}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              ) : (
                <div className="flex aspect-4/3 items-center justify-center border-4 border-ink bg-paper shadow-nb-lg">
                  <span className="tri h-24 w-24 border-2 border-ink bg-nb-red" />
                </div>
              )}
            </div>
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

      {/* Share Bar */}
      <Section bg="canvas" className="py-2">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <ShareBar
            title={product?.title || 'Produk Kotacom'}
            url={`/produk/${product?.slug || ''}`}
            slug={product?.slug}
          />
        </div>
      </Section>

      {/* Related Products Section */}
      {relatedProducts && relatedProducts.length > 0 && (
        <Section bg="canvas" className="border-t-4 border-ink py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-8 flex items-center justify-between border-b-4 border-ink pb-4">
              <h3 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-ink">
                {offeringLabel} Lainnya
              </h3>
              <Link
                href="/produk"
                className="inline-flex items-center gap-1 font-display text-xs sm:text-sm font-black uppercase text-nb-red hover:underline"
              >
                Lihat Semua
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((p) => {
                const pImg =
                  p.featuredImage && typeof p.featuredImage === 'object'
                    ? (p.featuredImage as any)
                    : null
                return (
                  <article
                    key={p.slug}
                    className="flex flex-col border-4 border-ink bg-paper shadow-nb-sm transition-transform hover:-translate-y-1 hover:shadow-nb"
                  >
                    {pImg?.url ? (
                      <div className="relative aspect-video w-full overflow-hidden border-b-4 border-ink bg-nb-canvas">
                        <Image
                          src={pImg.url}
                          alt={pImg.alt || p.title || 'Produk Kotacom'}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    ) : null}
                    <div className="flex flex-1 flex-col p-5">
                      <div className="mb-2 flex items-center justify-between">
                        <Pill tone="yellow">{offeringLabel}</Pill>
                        {p.price && (
                          <span className="font-mono text-xs font-black uppercase text-nb-red">
                            {p.price}
                          </span>
                        )}
                      </div>
                      <h4 className="mb-2 line-clamp-2 font-display text-lg font-black leading-snug uppercase text-ink">
                        <Link
                          href={`/produk/${p.slug}`}
                          className="hover:text-nb-red hover:underline transition-colors"
                        >
                          {p.title}
                        </Link>
                      </h4>
                      <div className="mt-auto pt-4">
                        <Link
                          href={`/produk/${p.slug}`}
                          className="inline-flex items-center gap-1 font-display text-xs font-black uppercase text-nb-blue hover:text-nb-red transition-colors"
                        >
                          Detail {offeringLabel}
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
      )}

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
