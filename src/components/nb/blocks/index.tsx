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
  const { richText, media } = fields || {}
  return (
    <Section bg="canvas" id={id}>
      <div className="mx-auto max-w-3xl text-center">
        {media ? <NewMedia m={media} className="mx-auto mb-8 max-w-md" /> : null}
        {richText ? <RichText content={richText} /> : null}
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
  const { richText, author, role } = fields || {}
  return (
    <Section bg="canvas" id={id}>
      <div className="mx-auto max-w-3xl border-4 border-ink bg-paper p-8 shadow-nb-lg">
        <div className="text-center">
          {richText ? <RichText content={richText} /> : null}
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

  if (richTexts.length === 0 && cards.length === 0 && links.length === 0) return null

  return (
    <Section bg="canvas" id={id}>
      {richTexts.map((rt, i) => (
        <div key={i} className={i === 0 ? 'mb-6 max-w-3xl' : 'mb-6'}>
          <RichText content={rt} />
        </div>
      ))}
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

const RENDERERS: Record<string, React.FC<{ fields: any; id?: string }>> = {
  content: ContentBlock,
  cardGrid: CardGridBlock,
  steps: StepsBlock,
  mediaBlock: MediaBlock,
  cta: CtaBlock,
  hoverCards: HoverCardsBlock,
  statement: StatementBlock,
  banner: BannerBlock,
  callout: CalloutBlock,
  linkGrid: LinkGridBlock,
  contentGrid: GenericBlock,
  hoverHighlights: GenericBlock,
  pricing: GenericBlock,
  comparisonTable: GenericBlock,
  mediaContent: GenericBlock,
  mediaContentAccordion: GenericBlock,
  logoGrid: GenericBlock,
  caseStudyCards: GenericBlock,
  caseStudiesHighlight: GenericBlock,
  stickyHighlights: GenericBlock,
  slider: GenericBlock,
  codeFeature: GenericBlock,
  code: GenericBlock,
}

function fieldsOf(block: any): any {
  if (!block) return {}
  const key = Object.keys(block).find((k) => k.endsWith('Fields'))
  return key ? block[key] : {}
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
