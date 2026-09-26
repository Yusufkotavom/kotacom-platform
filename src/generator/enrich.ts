import { aiChat } from './ai'
import { lexicalFromText } from './lexical'
import { extractJson } from './plan'
import { buildTokens } from './tokens'
import type { GeneratorRow, GeneratorTemplateLite } from './types'

type RichText = null | Record<string, unknown>

const SEGMENT_SCHEMA = `{"heading": "sub-judul menarik (boleh pertanyaan)", "body": "1-3 paragraf; boleh memakai '- ' untuk daftar; boleh '### ' untuk sub-sub-judul"}`

/**
 * Prompt for one `aiContent` slot. Local, specific and short on purpose: a
 * template can hold several `aiContent` blocks and each must read differently
 * for the same row (anti-clone), so `index`/`total` and sibling headings are
 * fed back to the model.
 */
const buildSegmentPrompt = (input: {
  entityType: 'page' | 'post'
  headings: string[]
  index: number
  prompt: string
  row: GeneratorRow
  title: string
  tokens: Record<string, string>
  total: number
}): string => {
  const { entityType, headings, index, prompt, row, title, tokens, total } = input
  return [
    `Kamu menulis SATU bagian dari ${entityType === 'post' ? 'artikel blog' : 'landing page'} berjudul: "${title}".`,
    `Bagian ini adalah bagian ke-${index + 1} dari ${total}.`,
    headings.length ? `Sub-judul lain di halaman ini (JANGAN ulangi): ${headings.join(' | ')}.` : '',
    `\nDATA:`,
    `- Kata kunci utama: ${tokens.primaryKeyword || row.primaryKeyword}`,
    `- Kata kunci pendukung: ${tokens.secondaryKeywords || '-'}`,
    `- Layanan: ${tokens.service || '-'}`,
    `- Kota/lokasi: ${tokens.city || '-'}`,
    `- Industri: ${tokens.industry || '-'}`,
    `- Penawaran/angle: ${tokens.offer || '-'}`,
    `- Konteks lokal: ${tokens.localCondition || '-'}`,
    `\nINSTRUKSI BAGIAN:`,
    prompt || 'Tulis bagian yang relevan, spesifik, dan berorientasi konversi.',
    `\nAturan: spesifik untuk kota & layanan di atas; jangan mengarang angka/testimoni/kontak; hindari frasa generik yang bisa dipakai kota lain.`,
    `Balas HANYA JSON valid (tanpa penjelasan, tanpa code fence): ${SEGMENT_SCHEMA}`,
  ]
    .filter(Boolean)
    .join('\n')
}

const segmentToRichText = (segment: { body?: string; heading?: string }): RichText =>
  lexicalFromText(
    [segment.heading ? `## ${segment.heading.trim()}` : '', (segment.body || '').trim()]
      .filter(Boolean)
      .join('\n\n'),
  ) as unknown as RichText

const isRichTextEmpty = (value: unknown): boolean => {
  if (!value || typeof value !== 'object') return true
  const root = (value as { root?: { children?: unknown[] } }).root
  return !root?.children?.length
}

/**
 * Turn a raw model reply into richText. Prefers strict JSON `{heading,body}`;
 * falls back to treating the reply as prose when it is not JSON at all (the
 * reasoning model sometimes answers with plain text). Returns null when there
 * is nothing usable.
 */
const rawToRichText = (raw: string): null | Record<string, unknown> => {
  const segment = extractJson<{ body?: string; heading?: string }>(raw)
  if (segment && (segment.body || segment.heading)) {
    return segmentToRichText(segment) as unknown as Record<string, unknown>
  }
  const text = (raw || '').trim()
  if (text.length > 40 && !text.startsWith('{')) {
    return lexicalFromText(text) as unknown as Record<string, unknown>
  }
  return null
}

/**
 * Fill every empty `aiContent` block in a block stack with AI-authored rich
 * text. Idempotent: a block that already has `generatedText` is left untouched
 * (so re-runs only fill what is missing). Returns the block count actually
 * generated and a token tally.
 */
export const enrichAiBlocks = async (input: {
  entityType: 'page' | 'post'
  layout: Record<string, unknown>[]
  row: GeneratorRow
  template: GeneratorTemplateLite
  title: string
}): Promise<{ enriched: number; layout: Record<string, unknown>[] }> => {
  const { entityType, layout, row, template, title } = input
  const tokens = buildTokens(template, row)

  const aiIndexes = layout.reduce<number[]>((acc, block, i) => {
    if (block?.blockType === 'aiContent') acc.push(i)
    return acc
  }, [])

  if (!aiIndexes.length) return { enriched: 0, layout }

  const headings = aiIndexes
    .map((i) => {
      const fields = layout[i].aiContentFields as Record<string, unknown> | undefined
      const text = typeof fields?.prompt === 'string' ? fields.prompt.trim().slice(0, 80) : ''
      return text
    })
    .filter(Boolean)

  const next = [...layout]
  let enriched = 0
  const model = process.env.AI_MODEL || 'pro-coding'

  for (let order = 0; order < aiIndexes.length; order += 1) {
    const idx = aiIndexes[order]
    const block = { ...(next[idx] as Record<string, unknown>) }
    const fields = { ...((block.aiContentFields as Record<string, unknown>) ?? {}) }

    if (!isRichTextEmpty(fields.generatedText)) {
      next[idx] = block
      continue
    }

    const prompt = typeof fields.prompt === 'string' ? fields.prompt : ''
    const promptText = buildSegmentPrompt({
      entityType,
      headings: headings.filter((h) => h !== prompt.slice(0, 80)),
      index: order,
      prompt,
      row,
      title,
      tokens,
      total: aiIndexes.length,
    })

    try {
      let richText: null | Record<string, unknown> = null
      // The local gateway occasionally returns empty/failed content under load;
      // one retry recovers most blocked slots (a slot must not silently stay empty).
      for (let attempt = 0; attempt < 2 && !richText; attempt += 1) {
        try {
          const raw = await aiChat(promptText, { maxTokens: 8192 })
          richText = rawToRichText(raw)
        } catch (err) {
          if (attempt === 1) {
            console.warn(`[generator] aiContent #${order} gagal:`, (err as Error)?.message)
          }
        }
        if (!richText) await new Promise((r) => setTimeout(r, 700))
      }
      if (richText && !isRichTextEmpty(richText)) {
        fields.generatedText = richText
        fields.model = model
        fields.generatedAt = new Date().toISOString()
        block.aiContentFields = fields
        enriched += 1
      }
    } catch (err) {
      console.warn(`[generator] aiContent #${order} gagal:`, (err as Error)?.message)
      // AI failure → leave generatedText empty; renderer falls back to `content`.
    }

    next[idx] = block
  }

  return { enriched, layout: next }
}
