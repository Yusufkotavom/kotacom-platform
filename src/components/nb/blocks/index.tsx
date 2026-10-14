import * as React from 'react'
import { RichText } from '@components/RichText/index'
import { cn } from '@root/utilities/cn'
import { LinkButton } from '../Button'
import { Card, NumBadge } from '../Card'
import { Pill } from '../Pill'
import { Section, SectionTag } from '../Section'
import { Shape } from '../Shape'

/* --------------------------------------------------------------- helpers */

type AnyLink = {
  label?: string | null
  url?: string | null
  newTab?: boolean | null
  doc?: { slug?: string | null } | string | null
} | null

function hrefOf(l?: AnyLink): string {
  if (!l) return '#'
  if (l.url) return l.url
  const doc = l.doc
  if (doc && typeof doc === 'object' && doc.slug) return `/${doc.slug}`
  return '#'
}

function NewMedia({
  m,
  className,
  ratio,
}: {
  m: any
  className?: string
  ratio?: string
}) {
  if (!m || typeof m === 'string') return null
  const url = m.url || m.sizes?.large?.url || m.sizes?.card?.url
  if (!url) return null
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={m.alt || ''}
      width={m.width}
      height={m.height}
      className={cn('w-full border-4 border-ink object-cover shadow-nb-lg', ratio, className)}
    />
  )
}

/* ---------------------------------------------------------------- blocks */

function ContentBlock({ fields, id }: { fields: any; id?: string }) {
  const { layout = 'oneColumn', columnOne, columnTwo, columnThree, useLeadingHeader, leadingHeader } =
    fields || {}
  const cols: any[] = [columnOne, columnTwo, columnThree].filter(Boolean)
  const gridCls =
    layout === 'twoColumns' || layout === 'halfAndHalf'
      ? 'md:grid-cols-2'
      : layout === 'twoThirdsOneThird'
        ? 'md:grid-cols-3 md:[&>*:first-child]:col-span-2'
        : layout === 'threeColumns'
          ? 'md:grid-cols-3'
          : 'grid-cols-1'
  return (
    <Section bg="canvas" id={id}>
      {useLeadingHeader && leadingHeader ? (
        <div className="mb-8">
          <RichText content={leadingHeader} />
        </div>
      ) : null}
      <div className={cn('grid gap-8', gridCls)}>
        {cols.map((c, i) => (
          <div key={i}>
            <RichText content={c} />
          </div>
        ))}
      </div>
    </Section>
  )
}

function CardGridBlock({ fields, id }: { fields: any; id?: string }) {
  const { richText, links, cards } = fields || {}
  const hasCards = Array.isArray(cards) && cards.length > 0
  const shapes = ['circle', 'square', 'triangle', 'diamond'] as const
  const tones = ['yellow', 'blue', 'red', 'yellow'] as const
  return (
    <Section bg="canvas" id={id}>
      {richText ? (
        <div className="mb-8 max-w-3xl">
          <RichText content={richText} />
        </div>
      ) : null}
      {Array.isArray(links) && links.length > 0 ? (
        <div className="mb-8 flex flex-wrap gap-3">
          {links.map((l: any, i: number) => (
            <LinkButton key={i} href={hrefOf(l?.link)} variant={i === 0 ? 'primary' : 'outline'}>
              {l?.link?.label || 'Selengkapnya'}
            </LinkButton>
          ))}
        </div>
      ) : null}
      {hasCards ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c: any, i: number) => (
            <Card
              key={c.id || i}
              cornerShape={shapes[i % shapes.length]}
              cornerTone={tones[i % tones.length]}
              className="p-7"
            >
              <h3 className="text-2xl uppercase tracking-tight">{c.title}</h3>
              {c.description ? (
                <p className="mt-3 font-medium leading-relaxed">{c.description}</p>
              ) : null}
              {c.enableLink && c.link ? (
                <LinkButton href={hrefOf(c.link)} variant="ink" size="sm" className="mt-5">
                  Selengkapnya
                </LinkButton>
              ) : null}
            </Card>
          ))}
        </div>
      ) : null}
    </Section>
  )
}

function StepsBlock({ fields, id }: { fields: any; id?: string }) {
  const { steps } = fields || {}
  if (!Array.isArray(steps)) return null
  return (
    <Section bg="paper" id={id}>
      <div className="grid gap-8 md:grid-cols-3">
        {steps.map((s: any, i: number) => (
          <div key={s.id || i}>
            <NumBadge n={String(i + 1).padStart(2, '0')} />
            <div className="mt-5">
              <RichText content={s.content} />
            </div>
            {s.media ? <div className="mt-5">{<NewMedia m={s.media} />}</div> : null}
          </div>
        ))}
      </div>
    </Section>
  )
}

function MediaBlock({ fields, id }: { fields: any; id?: string }) {
  const { media, caption, position } = fields || {}
  return (
    <Section bg="canvas" id={id}>
      <div className={cn('mx-auto', position === 'wide' ? 'max-w-7xl' : 'max-w-4xl')}>
        {media ? <NewMedia m={media} /> : null}
        {caption ? (
          <div className="mt-4">
            <RichText content={caption} />
          </div>
        ) : null}
      </div>
    </Section>
  )
}

function CtaBlock({ fields, id }: { fields: any; id?: string }) {
  const { richText, links } = fields || {}
  return (
    <Section bg="yellow" noRule id={id} className="overflow-hidden">
      <span className="absolute -right-12 -top-12 h-48 w-48 rounded-full border-4 border-ink bg-nb-red opacity-70" />
      <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
        {richText ? <RichText content={richText} /> : null}
        <div className="flex flex-wrap gap-4 lg:justify-end">
          {Array.isArray(links) && links.length > 0 ? (
            links.map((l: any, i: number) => (
              <LinkButton
                key={i}
                href={hrefOf(l?.link)}
                variant={i === 0 ? 'ink' : 'outline'}
                size="lg"
              >
                {l?.link?.label || 'Hubungi Kami'}
              </LinkButton>
            ))
          ) : null}
        </div>
      </div>
    </Section>
  )
}

function HoverCardsBlock({ fields, id }: { fields: any; id?: string }) {
  const { richText, cards } = fields || {}
  const hasCards = Array.isArray(cards) && cards.length > 0
  return (
    <Section bg="paper" id={id}>
      {richText ? (
        <div className="mb-8 max-w-3xl">
          <RichText content={richText} />
        </div>
      ) : null}
      {hasCards ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c: any, i: number) => (
            <div key={c.id || i} className="border-4 border-ink bg-canvas p-6 shadow-nb lift">
              <h3 className="text-xl uppercase tracking-tight">{c.title}</h3>
              {c.description ? (
                <p className="mt-2 font-medium leading-relaxed">{c.description}</p>
              ) : null}
              {c.link?.label ? (
                <LinkButton href={hrefOf(c.link)} variant="primary" size="sm" className="mt-4">
                  {c.link.label}
                </LinkButton>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </Section>
  )
}

function StatementBlock({ fields, id }: { fields: any; id?: string }) {
  const { richText, media, links, code, assetType } = fields || {}
  const hasLinks = Array.isArray(links) && links.length > 0
  return (
    <Section bg="canvas" id={id}>
      <div className="mx-auto max-w-3xl text-center">
        {media ? <NewMedia m={media} className="mx-auto mb-8 max-w-md" /> : null}
        {richText ? <RichText content={richText} /> : null}
        {hasLinks ? (
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {links.map((l: any, i: number) => (
              <LinkButton key={i} href={hrefOf(l?.link)} variant={i === 0 ? 'primary' : 'outline'}>
                {l?.link?.label || 'Selengkapnya'}
              </LinkButton>
            ))}
          </div>
        ) : null}
      </div>
    </Section>
  )
}

function BannerBlock({ fields, id }: { fields: any; id?: string }) {
  const { content } = fields || {}
  return (
    <Section bg="paper" id={id}>
      <div className="mx-auto flex max-w-3xl items-center gap-4 border-4 border-ink bg-nb-yellow p-5 shadow-nb">
        <Shape kind="circle" tone="red" className="h-8 w-8 shrink-0" />
        <div className="font-bold uppercase">{content}</div>
      </div>
    </Section>
  )
}

function CalloutBlock({ fields, id }: { fields: any; id?: string }) {
  const { richText, author, role, logo, images } = fields || {}
  const hasImages = Array.isArray(images) && images.length > 0
  return (
    <Section bg="canvas" id={id}>
      <div className="mx-auto max-w-3xl border-4 border-ink bg-paper p-8 shadow-nb-lg">
        <div className="text-center">
          {logo ? <NewMedia m={logo} className="mx-auto mb-6 h-16 w-auto max-w-[200px] object-contain shadow-none border-0" /> : null}
          {richText ? <RichText content={richText} /> : null}
          {hasImages ? (
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              {images.map((item: any, i: number) => {
                const img = item?.image || item
                return img ? (
                  <NewMedia key={i} m={img} className="max-w-[240px]" />
                ) : null
              })}
            </div>
          ) : null}
          {author ? (
            <p className="mt-6 font-mono text-sm font-bold uppercase tracking-widest">
              {author}
              {role ? `, ${role}` : ''}
            </p>
          ) : null}
        </div>
      </div>
    </Section>
  )
}

function LinkGridBlock({ fields, id }: { fields: any; id?: string }) {
  const { links } = fields || {}
  if (!Array.isArray(links)) return null
  return (
    <Section bg="canvas" id={id}>
      <div className="grid gap-4 sm:grid-cols-2">
        {links.map((l: any, i: number) => (
          <a
            key={i}
            href={hrefOf(l?.link)}
            className="flex items-center justify-between border-4 border-ink bg-paper p-5 font-bold uppercase shadow-nb press"
          >
            <span>{l?.link?.label || 'Untitled'}</span>
            <span className="font-black">&rarr;</span>
          </a>
        ))}
      </div>
    </Section>
  )
}

/* ---------------------------------------------------- generic fallback */

function isRichText(v: any): boolean {
  return v && typeof v === 'object' && v.root && Array.isArray(v.root.children)
}

function isMedia(v: any): boolean {
  return (
    v &&
    typeof v === 'object' &&
    !Array.isArray(v) &&
    (typeof v.url === 'string' || (v.sizes && typeof v.sizes === 'object'))
  )
}

function findMediaItems(fields: any): any[] {
  const out: any[] = []
  const visit = (o: any, depth = 0) => {
    if (!o || typeof o !== 'object' || depth > 3) return
    if (isMedia(o)) {
      out.push(o)
      return
    }
    if (Array.isArray(o)) {
      o.forEach((x) => visit(x, depth + 1))
      return
    }
    for (const [k, v] of Object.entries(o)) {
      if (['media', 'image', 'images', 'logo', 'background'].includes(k) || isMedia(v)) {
        if (isMedia(v)) {
          out.push(v)
        } else if (Array.isArray(v)) {
          v.forEach((item) => {
            if (isMedia(item)) out.push(item)
            else if (item && isMedia(item.image)) out.push(item.image)
            else if (item && isMedia(item.media)) out.push(item.media)
          })
        }
      } else {
        visit(v, depth + 1)
      }
    }
  }
  visit(fields)
  return out
}

function findLinks(fields: any): AnyLink[] {
  const out: AnyLink[] = []
  const visit = (o: any, depth = 0) => {
    if (!o || typeof o !== 'object' || depth > 3) return
    if (Array.isArray(o)) return o.forEach((x) => visit(x, depth + 1))
    for (const [k, v] of Object.entries(o)) {
      if (k === 'link' && v && typeof v === 'object' && 'label' in (v as any)) out.push(v as AnyLink)
      else visit(v, depth + 1)
    }
  }
  visit(fields)
  return out.slice(0, 4)
}

/**
 * `aiContent` block: render the AI-authored `generatedText`, falling back to the
 * manual `content` richText. Prompt/model/tokens are authoring metadata and are
 * never rendered on the front-end.
 */
function AiContentBlock({ fields, id }: { fields: any; id?: string }) {
  const content = fields?.generatedText || fields?.content
  if (!content) return null
  return (
    <Section bg="canvas" id={id}>
      <div className="payload-richtext mx-auto max-w-3xl">
        <RichText content={content} />
      </div>
    </Section>
  )
}

function GenericBlock({ fields, id }: { fields: any; id?: string }) {
  const shapes = ['circle', 'square', 'triangle', 'diamond'] as const
  const tones = ['yellow', 'blue', 'red', 'yellow'] as const

  // RichText fields at the top level of the block.
  const richTexts = Object.values(fields || {}).filter(isRichText) as any[]

  // Generic cards: any array (top-level or one level deep) of objects with a title/heading.
  let cards: any[] = []
  const collectCards = (o: any, depth = 0) => {
    if (!o || typeof o !== 'object' || depth > 2) return
    if (Array.isArray(o)) {
      const looksLikeCards = o.every(
        (x) => x && typeof x === 'object' && !Array.isArray(x) && ('title' in x || 'heading' in x || 'label' in x),
      )
      if (looksLikeCards && o.length) {
        cards = o
        return
      }
      o.forEach((x) => collectCards(x, depth + 1))
    } else {
      Object.values(o).forEach((v) => collectCards(v, depth + 1))
    }
  }
  collectCards(fields)

  const links = findLinks(fields)
  const mediaItems = findMediaItems(fields)

  if (richTexts.length === 0 && cards.length === 0 && links.length === 0 && mediaItems.length === 0) return null

  return (
    <Section bg="canvas" id={id}>
      {richTexts.map((rt, i) => (
        <div key={i} className={i === 0 ? 'mb-6 max-w-3xl' : 'mb-6'}>
          <RichText content={rt} />
        </div>
      ))}
      {mediaItems.length > 0 ? (
        <div className="mb-8 flex flex-wrap gap-6 justify-center">
          {mediaItems.slice(0, 4).map((m, i) => (
            <div key={i} className="max-w-md w-full">
              <NewMedia m={m} />
            </div>
          ))}
        </div>
      ) : null}
      {links.length > 0 ? (
        <div className="mb-8 flex flex-wrap gap-3">
          {links.map((l, i) => (
            <LinkButton key={i} href={hrefOf(l)} variant={i === 0 ? 'primary' : 'outline'}>
              {l?.label || 'Selengkapnya'}
            </LinkButton>
          ))}
        </div>
      ) : null}
      {cards.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c, i) => (
            <Card
              key={c.id || i}
              cornerShape={shapes[i % shapes.length]}
              cornerTone={tones[i % tones.length]}
              className="p-7"
            >
              <h3 className="text-xl uppercase tracking-tight">{c.title || c.heading || c.label}</h3>
              {c.description || c.body || c.excerpt ? (
                <p className="mt-3 font-medium leading-relaxed">
                  {c.description || c.body || c.excerpt}
                </p>
              ) : null}
            </Card>
          ))}
        </div>
      ) : null}
    </Section>
  )
}

/* -------------------------------------------------------------- renderer */

const SECTION_INDEX: Record<string, string> = {
  cardGrid: '01',
  steps: '02',
  hoverCards: '03',
}

/* ------------------------------------------------------- cta / commerce */

const WA_NUMBER = '6285799520350'

function WhatsAppCtaBlock({ fields }: { fields: any; id?: string }) {
  const { heading, body, variant = 'button', label } = fields || {}
  const text = encodeURIComponent(heading || body || 'Halo Kotacom, saya ingin bertanya.')
  const href = `https://wa.me/${WA_NUMBER}?text=${text}`
  if (variant === 'link') {
    return (
      <Section bg="canvas">
        <a
          href={href}
          className="inline-block text-lg font-bold uppercase tracking-widest underline decoration-4 underline-offset-4"
        >
          {label || heading || 'Chat via WhatsApp →'}
        </a>
      </Section>
    )
  }
  return (
    <Section bg="yellow">
      <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          {heading ? (
            <h2 className="max-w-2xl text-3xl uppercase leading-[0.95] tracking-tighter sm:text-4xl">
              {heading}
            </h2>
          ) : null}
          {body ? <p className="mt-3 max-w-2xl font-medium opacity-90">{body}</p> : null}
        </div>
        <LinkButton href={href} variant={variant === 'hero' ? 'primary' : 'ink'} size="lg">
          {label || 'Chat WhatsApp'}
        </LinkButton>
      </div>
    </Section>
  )
}

function PricingBlock({ fields }: { fields: any; id?: string }) {
  const plans = fields?.plans || []
  const disclaimer = fields?.disclaimer
  if (!Array.isArray(plans) || plans.length === 0) return null
  return (
    <Section bg="canvas">
      <div
        className={cn(
          'grid gap-8',
          plans.length >= 3 ? 'lg:grid-cols-3' : plans.length === 2 ? 'lg:grid-cols-2' : '',
        )}
      >
        {plans.map((p: any, i: number) => (
          <Card
            key={i}
            className="flex h-full flex-col p-8"
            cornerShape={(['circle', 'square', 'triangle'] as const)[i % 3]}
            cornerTone={(['yellow', 'blue', 'red'] as const)[i % 3]}
          >
            <h3 className="text-2xl uppercase tracking-tight">{p.name || p.title}</h3>
            {p.price ? (
              <p className="mt-4 text-4xl font-black tracking-tighter">
                {p.price}
                <span className="ml-2 text-sm font-bold uppercase tracking-widest opacity-60">
                  / bulan
                </span>
              </p>
            ) : null}
            {p.description ? (
              <p className="mt-4 font-medium opacity-80">{p.description}</p>
            ) : null}
            {Array.isArray(p.features) && p.features.length ? (
              <ul className="mt-6 space-y-2">
                {p.features.map((f: any, j: number) => (
                  <li key={j} className="flex items-start gap-2 font-medium">
                    <span className="mt-1 inline-block h-3 w-3 shrink-0 border-2 border-ink bg-nb-yellow" />
                    <span>{f.feature}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="mt-auto pt-8">
              <LinkButton
                href={hrefOf(p.link) === '#' ? `https://wa.me/${WA_NUMBER}` : hrefOf(p.link)}
                variant={i === 0 ? 'primary' : 'outline'}
                size="lg"
              >
                Pilih paket
              </LinkButton>
            </div>
          </Card>
        ))}
      </div>
      {disclaimer ? (
        <p className="mt-6 font-mono text-xs font-bold uppercase tracking-widest opacity-60">
          {disclaimer}
        </p>
      ) : null}
    </Section>
  )
}

function LogoGridBlock({ fields }: { fields: any; id?: string }) {
  const logos = fields?.logos || []
  if (!Array.isArray(logos) || logos.length === 0) return null
  return (
    <Section bg="paper">
      <div className="grid grid-cols-2 items-center gap-6 sm:grid-cols-3 lg:grid-cols-5">
        {logos.map((l: any, i: number) => (
          <div key={i} className="flex items-center justify-center p-4">
            {l.logoMedia && typeof l.logoMedia === 'object' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={l.logoMedia.url || l.logoMedia.sizes?.small?.url}
                alt={l.logoMedia.alt || ''}
                className="max-h-16 w-auto object-contain"
              />
            ) : null}
          </div>
        ))}
      </div>
    </Section>
  )
}

function SliderBlock({ fields, id }: { fields: any; id?: string }) {
  const { quoteSlides, introContent } = fields || {}
  const slides = Array.isArray(quoteSlides) ? quoteSlides : []
  if (slides.length === 0 && !introContent) return null
  return (
    <Section bg="canvas" id={id}>
      {introContent ? (
        <div className="mb-8 max-w-3xl">
          <RichText content={introContent} />
        </div>
      ) : null}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {slides.map((s: any, i: number) => (
          <Card key={s.id || i} cornerShape="circle" cornerTone="yellow" className="p-7">
            <NumBadge n={String(i + 1).padStart(2, '0')} />
            {s.quote ? (
              <blockquote className="mt-4 font-medium italic leading-relaxed">
                “{s.quote}”
              </blockquote>
            ) : null}
            {s.richText ? (
              <div className="mt-4">
                <RichText content={s.richText} />
              </div>
            ) : null}
            {s.author ? (
              <p className="mt-5 font-mono text-xs font-bold uppercase tracking-wider text-ink/80">
                {s.author}
                {s.role ? `, ${s.role}` : ''}
              </p>
            ) : null}
          </Card>
        ))}
      </div>
    </Section>
  )
}

function ComparisonTableBlock({ fields }: { fields: any; id?: string }) {
  const header = fields?.header || {}
  const rows = fields?.rows || []
  return (
    <Section bg="canvas">
      {fields?.introContent ? (
        <div className="mb-8 max-w-3xl">
          <RichText content={fields.introContent} />
        </div>
      ) : null}
      <div className="overflow-hidden border-4 border-ink shadow-nb-lg">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-ink text-white">
              <th className="p-5 font-black uppercase tracking-wider">
                {header.tableTitle || 'Fitur'}
              </th>
              <th className="border-l-4 border-white/30 p-5 font-black uppercase tracking-wider">
                {header.columnOneHeader || 'Kotacom'}
              </th>
              <th className="border-l-4 border-white/30 p-5 font-black uppercase tracking-wider">
                {header.columnTwoHeader || 'Lainnya'}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any, i: number) => (
              <tr key={i} className={i % 2 ? 'bg-paper' : 'bg-muted'}>
                <td className="p-5 font-bold">{r.feature}</td>
                <td className="border-l-4 border-ink p-5">
                  {r.columnOneCheck ? (
                    <span className="font-black">✓ {r.columnOne}</span>
                  ) : (
                    r.columnOne
                  )}
                </td>
                <td className="border-l-4 border-ink p-5 opacity-80">
                  {r.columnTwoCheck ? <span className="font-black">✓ {r.columnTwo}</span> : r.columnTwo}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  )
}

function CodeDisplayBlock({ fields, id }: { fields: any; id?: string }) {
  const { code, heading, richText, codeTabs } = fields || {}
  const rawCode =
    typeof code === 'string'
      ? code
      : Array.isArray(codeTabs) && codeTabs.length > 0 && typeof codeTabs[0]?.code === 'string'
      ? codeTabs[0].code
      : ''
  const displayHeading =
    heading || (Array.isArray(codeTabs) && codeTabs[0]?.label) || ''

  return (
    <Section bg="canvas" id={id}>
      <div className="mx-auto max-w-4xl border-4 border-ink bg-nb-ink text-white p-6 shadow-nb-lg">
        {displayHeading ? (
          <div className="mb-4 border-b-2 border-white/20 pb-2 font-mono text-sm uppercase tracking-wider text-nb-yellow">
            {displayHeading}
          </div>
        ) : null}
        {richText ? (
          <div className="mb-4 text-white/90">
            <RichText content={richText} />
          </div>
        ) : null}
        {rawCode ? (
          <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-green-400 bg-black/60 border-2 border-white/10">
            <code>{rawCode}</code>
          </pre>
        ) : null}
      </div>
    </Section>
  )
}

function ContentGridBlock({ fields, id }: { fields: any; id?: string }) {
  const { content, cells, links } = fields || {}
  const cellList = Array.isArray(cells) ? cells : []
  const hasLinks = Array.isArray(links) && links.length > 0
  const shapes = ['circle', 'square', 'triangle', 'diamond'] as const
  const tones = ['yellow', 'blue', 'red', 'yellow'] as const

  return (
    <Section bg="canvas" id={id}>
      {content ? (
        <div className="mb-8 max-w-3xl">
          <RichText content={content} />
        </div>
      ) : null}
      {hasLinks ? (
        <div className="mb-8 flex flex-wrap gap-3">
          {links.map((l: any, i: number) => (
            <LinkButton key={i} href={hrefOf(l?.link)} variant={i === 0 ? 'primary' : 'outline'}>
              {l?.link?.label || 'Selengkapnya'}
            </LinkButton>
          ))}
        </div>
      ) : null}
      {cellList.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {cellList.map((c: any, i: number) => (
            <Card
              key={c.id || i}
              cornerShape={shapes[i % shapes.length]}
              cornerTone={tones[i % tones.length]}
              className="p-7"
            >
              {c.content ? <RichText content={c.content} /> : null}
            </Card>
          ))}
        </div>
      ) : null}
    </Section>
  )
}

function ExampleTabsBlock({ fields, id }: { fields: any; id?: string }) {
  const { content, tabs } = fields || {}
  const tabList = Array.isArray(tabs) ? tabs : []

  return (
    <Section bg="canvas" id={id}>
      {content ? (
        <div className="mb-8 max-w-3xl">
          <RichText content={content} />
        </div>
      ) : null}
      {tabList.length > 0 ? (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {tabList.map((t: any, i: number) => {
              const examples = Array.isArray(t.examples) ? t.examples : []
              return (
                <div key={t.id || i} className="border-4 border-ink bg-paper p-6 shadow-nb-lg">
                  <div className="mb-3 inline-block border-2 border-ink bg-nb-yellow px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-ink shadow-nb-sm">
                    {t.label || `Tab ${i + 1}`}
                  </div>
                  {t.content ? (
                    <div className="mb-4">
                      <RichText content={t.content} />
                    </div>
                  ) : null}
                  {examples.map((ex: any, j: number) => {
                    if (ex.code) {
                      return (
                        <pre
                          key={ex.id || j}
                          className="mt-3 overflow-x-auto border-2 border-ink bg-nb-ink p-4 font-mono text-xs text-green-400"
                        >
                          <code>{ex.code}</code>
                        </pre>
                      )
                    }
                    if (ex.media) {
                      return (
                        <div key={ex.id || j} className="mt-3">
                          <NewMedia m={ex.media} />
                        </div>
                      )
                    }
                    return null
                  })}
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
    </Section>
  )
}

function CaseStudyCardsBlock({ fields, id }: { fields: any; id?: string }) {
  const { cards } = fields || {}
  const cardList = Array.isArray(cards) ? cards : []
  return (
    <Section bg="canvas" id={id}>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {cardList.map((c: any, i: number) => {
          const cs = typeof c.caseStudy === 'object' ? c.caseStudy : null
          const title = cs?.title || `Studi Kasus ${i + 1}`
          const excerpt = cs?.excerpt || ''
          const url = cs?.slug ? `/case-studies/${cs.slug}` : '/case-studies'
          return (
            <Card key={c.id || i} cornerShape="square" cornerTone="blue" className="p-7">
              <h3 className="text-xl uppercase tracking-tight">{title}</h3>
              {c.richText ? (
                <div className="mt-3">
                  <RichText content={c.richText} />
                </div>
              ) : excerpt ? (
                <p className="mt-3 font-medium leading-relaxed">{excerpt}</p>
              ) : null}
              <LinkButton href={url} variant="outline" size="sm" className="mt-5">
                Baca Studi Kasus →
              </LinkButton>
            </Card>
          )
        })}
      </div>
    </Section>
  )
}

function CaseStudiesHighlightBlock({ fields, id }: { fields: any; id?: string }) {
  const { richText, caseStudies } = fields || {}
  const list = Array.isArray(caseStudies) ? caseStudies : []
  return (
    <Section bg="canvas" id={id}>
      {richText ? (
        <div className="mb-8 max-w-3xl">
          <RichText content={richText} />
        </div>
      ) : null}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((cs: any, i: number) => {
          const item = typeof cs === 'object' ? cs : null
          const title = item?.title || `Highlight Studi Kasus ${i + 1}`
          const excerpt = item?.excerpt || ''
          const url = item?.slug ? `/case-studies/${item.slug}` : '/case-studies'
          return (
            <Card key={item?.id || i} cornerShape="triangle" cornerTone="red" className="p-7">
              <h3 className="text-xl uppercase tracking-tight">{title}</h3>
              {excerpt ? <p className="mt-3 font-medium leading-relaxed">{excerpt}</p> : null}
              <LinkButton href={url} variant="primary" size="sm" className="mt-5">
                Eksplor Proyek →
              </LinkButton>
            </Card>
          )
        })}
      </div>
    </Section>
  )
}

function FormDisplayBlock({ fields, id }: { fields: any; id?: string }) {
  const { richText, form } = fields || {}
  const formTitle = typeof form === 'object' ? form?.title : 'Formulir Kontak Kotacom'
  return (
    <Section bg="canvas" id={id}>
      <div className="mx-auto max-w-2xl border-4 border-ink bg-paper p-8 shadow-nb-lg">
        <div className="mb-6 border-b-4 border-ink pb-4">
          <span className="inline-block border-2 border-ink bg-nb-red px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-nb-sm">
            Interactive Form
          </span>
          <h2 className="mt-3 text-2xl font-black uppercase tracking-tight">{formTitle}</h2>
          {richText ? (
            <div className="mt-2 text-ink/80">
              <RichText content={richText} />
            </div>
          ) : null}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            alert('Formulir berhasil disubmit.')
          }}
          className="space-y-4"
        >
          <div>
            <label className="block font-mono text-xs font-bold uppercase tracking-wider">Nama Lengkap</label>
            <input
              type="text"
              required
              placeholder="cth. Budi Santoso"
              className="mt-1 w-full border-2 border-ink bg-canvas px-4 py-3 font-medium shadow-nb-sm focus:outline-none focus:ring-2 focus:ring-nb-yellow"
            />
          </div>
          <div>
            <label className="block font-mono text-xs font-bold uppercase tracking-wider">Email Bisnis</label>
            <input
              type="email"
              required
              placeholder="budi@perusahaan.com"
              className="mt-1 w-full border-2 border-ink bg-canvas px-4 py-3 font-medium shadow-nb-sm focus:outline-none focus:ring-2 focus:ring-nb-yellow"
            />
          </div>
          <div>
            <label className="block font-mono text-xs font-bold uppercase tracking-wider">Kebutuhan Solusi</label>
            <textarea
              rows={3}
              required
              placeholder="Ceritakan proyek atau kebutuhan cetak & IT Anda..."
              className="mt-1 w-full border-2 border-ink bg-canvas px-4 py-3 font-medium shadow-nb-sm focus:outline-none focus:ring-2 focus:ring-nb-yellow"
            />
          </div>
          <button
            type="submit"
            className="w-full border-2 border-ink bg-nb-red py-3 font-black uppercase tracking-wider text-white shadow-nb press hover:bg-nb-red/90"
          >
            Kirim Permintaan Konsultasi →
          </button>
        </form>
      </div>
    </Section>
  )
}

const RENDERERS: Record<string, React.FC<{ fields: any; id?: string }>> = {
  form: FormDisplayBlock,
  content: ContentBlock,
  aiContent: AiContentBlock,
  cardGrid: CardGridBlock,
  steps: StepsBlock,
  mediaBlock: MediaBlock,
  cta: CtaBlock,
  hoverCards: HoverCardsBlock,
  statement: StatementBlock,
  banner: BannerBlock,
  callout: CalloutBlock,
  linkGrid: LinkGridBlock,
  contentGrid: ContentGridBlock,
  hoverHighlights: GenericBlock,
  pricing: PricingBlock,
  comparisonTable: ComparisonTableBlock,
  mediaContent: GenericBlock,
  mediaContentAccordion: GenericBlock,
  logoGrid: LogoGridBlock,
  caseStudyCards: CaseStudyCardsBlock,
  caseStudiesHighlight: CaseStudiesHighlightBlock,
  stickyHighlights: GenericBlock,
  slider: SliderBlock,
  codeFeature: CodeDisplayBlock,
  code: CodeDisplayBlock,
  exampleTabs: ExampleTabsBlock,
  whatsappCta: WhatsAppCtaBlock,
}

function fieldsOf(block: any): any {
  if (!block) return {}
  const key = Object.keys(block).find((k) => k.endsWith('Fields'))
  if (key && block[key]) return block[key]
  // Fallback: if block itself contains fields directly (or flat shape)
  return block
}

export function BauhausBlock({ block }: { block: any }) {
  const fields = fieldsOf(block)
  const Renderer = RENDERERS[block?.blockType] || GenericBlock
  return <Renderer fields={fields} />
}

export function BauhausBlocks({ blocks }: { blocks?: any[] | null }) {
  if (!Array.isArray(blocks) || blocks.length === 0) return null
  return (
    <>
      {blocks.map((b, i) => (
        <BauhausBlock key={b?.id || i} block={b} />
      ))}
    </>
  )
}
