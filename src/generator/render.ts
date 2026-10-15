import { normalizeSeoDescription, normalizeSeoTitle } from '@root/seo/normalize'

import { planToBlocks, type ContentPlan } from './blocks'
import { buildInterlinkBlock, type InterlinkResult } from './interlink'
import { lexicalFromText } from './lexical'
import { buildGeneratorSlug } from './slug'
import { buildTokens, deepReplace } from './tokens'
import type { GeneratedDraft, GeneratorProgramLite, GeneratorRow, GeneratorTemplateLite } from './types'

export const GENERATOR_VERSION = 'v2'

export type BuildDraftInput = {
  entityType: 'page' | 'post'
  generatedAt?: string
  interlink?: InterlinkResult | null
  plan?: ContentPlan | null
  program: GeneratorProgramLite
  row: GeneratorRow
  template: GeneratorTemplateLite
}

/**
 * Assemble the entity payload for one row.
 *
 * In `generate` mode a `plan` (AI-produced) supplies title/meta/blocks. Without
 * a plan (dry-run, `aiMode:off`) it falls back to deterministic patterns so the
 * draft is always valid and inspectable.
 */
export const buildDraft = (input: BuildDraftInput): GeneratedDraft => {
  const { entityType, interlink, plan, program, row, template } = input
  const generatedAt = input.generatedAt ?? new Date().toISOString()
  const baseTokens = buildTokens(template, row)

  // Suntikkan token interlink jika tersedia
  const tokens: Record<string, string> = {
    ...baseTokens,
    ...(interlink
      ? {
          relatedCities: interlink.citiesList,
          relatedLinks: interlink.html,
          relatedLinksMarkdown: interlink.markdown,
        }
      : {}),
  }

  const slug = buildGeneratorSlug({
    city: row.city,
    primaryKeyword: row.primaryKeyword,
    routeBase: program.routeBase || template.routeBase,
    service: row.service,
    slugPattern: template.slugPattern,
  })

  const title = (
    plan?.title ||
    deepReplace(template.h1Pattern || '{{primaryKeyword}} {{city}}', tokens)
  ).trim()

  const rawTitle = plan?.metaTitle || title
  const rawDescription =
    plan?.metaDescription || tokens.introShort || tokens.offer || tokens.localCondition || title

  const meta = {
    description: normalizeSeoDescription(rawDescription) || undefined,
    title: normalizeSeoTitle(rawTitle) || undefined,
  }

  // Skeleton: prefer the template's own block stack (token-replaced, with any
  // `aiContent` blocks already enriched by the runner); otherwise fall back to
  // the AI content plan expanded into native blocks.
  const templateBlocks = (template.layout ?? []) as Record<string, unknown>[]
  let blocks: Record<string, unknown>[] = templateBlocks.length
    ? (deepReplace(templateBlocks, tokens) as Record<string, unknown>[])
    : plan
      ? planToBlocks(plan, entityType)
      : []

  // Safe Interlinking Block: sisipkan blok linkGrid sebelum CTA penutup atau di akhir layout
  if (
    program.enableInterlink !== false &&
    interlink &&
    interlink.links.length > 0 &&
    entityType === 'page'
  ) {
    const interlinkBlock = buildInterlinkBlock({
      heading: program.interlinkHeading || 'Layanan Terkait di Kota Lain',
      links: interlink.links,
    })

    // Cari letak sebelum cta / whatsappCta, jika ada
    const ctaIndex = blocks.findIndex(
      (b) => b.blockType === 'cta' || b.blockType === 'whatsappCta',
    )
    if (ctaIndex !== -1) {
      blocks = [
        ...blocks.slice(0, ctaIndex),
        interlinkBlock,
        ...blocks.slice(ctaIndex),
      ]
    } else {
      blocks.push(interlinkBlock)
    }
  }

  const aiUsed =
    Boolean(plan) ||
    templateBlocks.some((block) => {
      const fields = (block.aiContentFields ?? {}) as Record<string, unknown>
      return block.blockType === 'aiContent' && Boolean(fields.generatedText)
    })

  const rowKey = row.key || slug
  const common = {
    _status: (program.outputStatus || 'draft') as 'draft' | 'published',
    generator: {
      aiUsed,
      ...(program.dataset ? { datasetId: program.dataset } : {}),
      generatedAt,
      keywordKey: row.primaryKeyword,
      programId: program.id,
      rowKey,
      templateId: template.id,
      version: GENERATOR_VERSION,
    },
    keywordKey: row.primaryKeyword,
    meta,
    rowKey,
    slug,
    title,
  }

  if (entityType === 'post') {
    return {
      ...common,
      authors: program.defaultAuthors ?? undefined,
      category: program.defaultCategory ?? undefined,
      content: blocks,
      entityType: 'post',
      excerpt: lexicalFromText(
        plan?.intro || plan?.metaDescription || title,
      ) as unknown as Record<string, unknown>,
      image: program.defaultImage ?? undefined,
      publishedOn: new Date().toISOString(),
    }
  }

  const hero = deepReplace(
    (template.hero as Record<string, unknown>) ?? { type: 'default' },
    tokens,
  )

  return {
    ...common,
    breadcrumbs: [{ label: title, url: `/${slug}` }],
    entityType: 'page',
    hero,
    layout: blocks,
  }
}
