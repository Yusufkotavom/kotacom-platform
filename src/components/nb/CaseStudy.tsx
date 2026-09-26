import { RichText } from '@components/RichText/index'
import { LinkButton } from './Button'
import { BauhausBlocks } from './blocks/index'
import { Pill } from './Pill'
import { Section } from './Section'

export function BauhausCaseStudy({ study }: { study: any }) {
  const img = study?.featuredImage && typeof study.featuredImage === 'object' ? study.featuredImage : null
  const hasBlocks = Array.isArray(study?.layout) && study.layout.length > 0

  return (
    <>
      <Section bg="canvas">
        <div className="mx-auto max-w-3xl">
          {study?.client ? <Pill tone="red">{study.client}</Pill> : null}
          <h1 className="mt-5 text-4xl uppercase leading-[0.95] tracking-tighter sm:text-5xl lg:text-6xl">
            {study?.title}
          </h1>
          {study?.description ? (
            <p className="mt-6 text-lg font-medium leading-relaxed">{study.description}</p>
          ) : null}
        </div>
      </Section>

      {img?.url ? (
        <Section bg="canvas" compact>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.url}
            alt={img.alt || study?.title || ''}
            className="w-full border-4 border-ink shadow-nb-lg"
          />
        </Section>
      ) : null}

      {hasBlocks ? (
        <BauhausBlocks blocks={study.layout} />
      ) : study?.content ? (
        <Section bg="paper">
          <div className="mx-auto max-w-3xl">
            <RichText content={study.content} />
          </div>
        </Section>
      ) : null}

      <Section bg="yellow" noRule className="overflow-hidden">
        <span className="absolute -right-12 -top-12 h-48 w-48 rounded-full border-4 border-ink bg-nb-red opacity-70" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <h2 className="max-w-2xl text-3xl uppercase leading-[0.95] tracking-tighter sm:text-4xl">
            Punya tantangan serupa?
          </h2>
          <LinkButton href="https://wa.me/6285799520350" variant="ink" size="lg">
            Konsultasi gratis
          </LinkButton>
        </div>
      </Section>
    </>
  )
}
