import { lexicalFromText } from './lexical'

export type PlanSection = { body?: string; heading?: string }
export type PlanFaq = { a?: string; q?: string }
export type PlanStep = { body?: string; title?: string }
export type PlanCard = { description?: string; title?: string }
export type PlanPricing = { description?: string; features?: string[]; name?: string; price?: string }

export type ContentPlan = {
  cards?: PlanCard[]
  cta?: { body?: string; buttonLabel?: string; heading?: string }
  faq?: PlanFaq[]
  heroSubheadline?: string
  intro?: string
  metaDescription?: string
  metaTitle?: string
  pricing?: PlanPricing[]
  sections?: PlanSection[]
  steps?: PlanStep[]
  title?: string
}

const rt = (text: string): Record<string, unknown> => lexicalFromText(text) as unknown as Record<string, unknown>

const contentBlock = (text: string): Record<string, unknown> => ({
  blockType: 'content',
  contentFields: { columnOne: rt(text), layout: 'oneColumn', settings: {} },
})

const sectionText = (s: PlanSection): string =>
  [s.heading ? `## ${s.heading.trim()}` : '', (s.body || '').trim()].filter(Boolean).join('\n\n')

/** Map a content plan to native blocks valid inside `Posts.content`. */
export const planToPostBlocks = (plan: ContentPlan): Record<string, unknown>[] => {
  const blocks: Record<string, unknown>[] = []

  for (const section of plan.sections ?? []) {
    if (!section.heading && !section.body) continue
    blocks.push({
      blockType: 'blogContent',
      blogContentFields: { richText: rt(sectionText(section)), settings: {} },
    })
  }

  if (plan.faq?.length) {
    const faqText = plan.faq
      .filter((f) => f.q || f.a)
      .map((f) => `### ${(f.q || '').trim()}\n\n${(f.a || '').trim()}`)
      .join('\n\n')
    if (faqText) {
      blocks.push({
        blockType: 'blogContent',
        blogContentFields: { richText: rt(`## Pertanyaan yang Sering Diajukan\n\n${faqText}`), settings: {} },
      })
    }
  }

  return blocks
}

/** Map a content plan to native blocks valid inside `Pages.layout`. */
export const planToPageBlocks = (plan: ContentPlan): Record<string, unknown>[] => {
  const blocks: Record<string, unknown>[] = []

  if (plan.intro?.trim()) blocks.push(contentBlock(plan.intro.trim()))

  for (const section of plan.sections ?? []) {
    if (!section.heading && !section.body) continue
    blocks.push(contentBlock(sectionText(section)))
  }

  if (plan.steps?.length) {
    blocks.push({
      blockType: 'steps',
      stepsFields: {
        settings: {},
        steps: plan.steps
          .filter((s) => s.title || s.body)
          .map((s) => ({ content: rt([s.title ? `### ${s.title.trim()}` : '', (s.body || '').trim()].filter(Boolean).join('\n\n')) })),
      },
    })
  }

  if (plan.cards?.length) {
    const cards = plan.cards
      .filter((c) => c.title)
      .map((c) => ({ description: c.description || '', title: c.title as string }))
    if (cards.length) {
      blocks.push({
        blockType: 'cardGrid',
        cardGridFields: {
          cards,
          richText: rt('## Layanan & Keunggulan'),
          settings: {},
        },
      })
    }
  }

  if (plan.pricing?.length) {
    const plans = plan.pricing
      .filter((p) => p.name)
      .map((p) => ({
        description: p.description || '',
        ...(p.price
          ? { hasPrice: true, price: String(p.price) }
          : { hasPrice: false, title: p.name as string }),
        features: (p.features ?? []).filter(Boolean).map((f) => ({ feature: f, icon: 'check' })),
        name: p.name as string,
      }))
    if (plans.length) {
      blocks.push({ blockType: 'pricing', pricingFields: { plans, settings: {} } })
    }
  }

  if (plan.faq?.length) {
    const faqText = plan.faq
      .filter((f) => f.q || f.a)
      .map((f) => `### ${(f.q || '').trim()}\n\n${(f.a || '').trim()}`)
      .join('\n\n')
    if (faqText) blocks.push(contentBlock(`## Pertanyaan yang Sering Diajukan\n\n${faqText}`))
  }

  if (plan.cta?.heading || plan.cta?.body) {
    blocks.push({
      blockType: 'whatsappCta',
      whatsappFields: {
        align: 'left',
        body: plan.cta.body || '',
        context: 'pricing',
        heading: plan.cta.heading || '',
        label: plan.cta.buttonLabel || '',
        settings: {},
        variant: 'button',
      },
    })
  }

  return blocks
}

export const planToBlocks = (
  plan: ContentPlan,
  entityType: 'page' | 'post',
): Record<string, unknown>[] =>
  entityType === 'post' ? planToPostBlocks(plan) : planToPageBlocks(plan)
