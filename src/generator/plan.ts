import { aiChat } from './ai'
import type { ContentPlan } from './blocks'
import type { GeneratorRow, GeneratorTemplateLite } from './types'

/** Escape raw control chars that appear *inside* JSON strings (models often
 * emit literal newlines), which JSON.parse rejects. Leaves structural
 * whitespace and proper escapes untouched. */
const escapeBareControlChars = (input: string): string => {
  let out = ''
  let inString = false
  let escaped = false
  for (const ch of input) {
    if (escaped) {
      out += ch
      escaped = false
      continue
    }
    if (ch === '\\') {
      out += ch
      escaped = true
      continue
    }
    if (ch === '"') {
      inString = !inString
      out += ch
      continue
    }
    if (inString && (ch === '\n' || ch === '\r' || ch === '\t')) {
      out += ch === '\n' ? '\\n' : ch === '\r' ? '\\r' : '\\t'
      continue
    }
    out += ch
  }
  return out
}

/** Pull the first balanced JSON object out of a model response. */
export const extractJson = <T = Record<string, unknown>>(text: string): null | T => {
  const cleaned = (text || '').replace(/```(?:json)?/gi, '').trim()

  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null

  const candidate = cleaned.slice(start, end + 1)
  try {
    return JSON.parse(candidate) as T
  } catch {
    try {
      return JSON.parse(escapeBareControlChars(candidate)) as T
    } catch {
      return null
    }
  }
}

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])
const str = (value: unknown): string => (typeof value === 'string' ? value.trim() : '')

/** Coerce an arbitrary model JSON into the typed ContentPlan shape. */
export const normalizePlan = (raw: Record<string, unknown>): ContentPlan => ({
  cards: asArray(raw.cards).map((c) => ({
    description: str((c as Record<string, unknown>)?.description),
    title: str((c as Record<string, unknown>)?.title),
  })),
  cta: raw.cta && typeof raw.cta === 'object'
    ? {
        body: str((raw.cta as Record<string, unknown>).body),
        buttonLabel: str((raw.cta as Record<string, unknown>).buttonLabel),
        heading: str((raw.cta as Record<string, unknown>).heading),
      }
    : undefined,
  faq: asArray(raw.faq).map((f) => ({
    a: str((f as Record<string, unknown>)?.a),
    q: str((f as Record<string, unknown>)?.q),
  })),
  heroSubheadline: str(raw.heroSubheadline),
  intro: str(raw.intro),
  metaDescription: str(raw.metaDescription),
  metaTitle: str(raw.metaTitle),
  pricing: asArray(raw.pricing).map((p) => ({
    description: str((p as Record<string, unknown>)?.description),
    features: asArray((p as Record<string, unknown>)?.features).map(str).filter(Boolean),
    name: str((p as Record<string, unknown>)?.name),
    price: str((p as Record<string, unknown>)?.price),
  })),
  sections: asArray(raw.sections).map((s) => ({
    body: str((s as Record<string, unknown>)?.body),
    heading: str((s as Record<string, unknown>)?.heading),
  })),
  steps: asArray(raw.steps).map((s) => ({
    body: str((s as Record<string, unknown>)?.body),
    title: str((s as Record<string, unknown>)?.title),
  })),
  title: str(raw.title),
})

const PLAN_SCHEMA = `{
  "title": "judul halaman (noun phrase, mengandung kata kunci)",
  "metaTitle": "judul SEO 45-60 karakter",
  "metaDescription": "deskripsi meta 120-155 karakter, persuasif, mengandung kata kunci",
  "heroSubheadline": "1 kalimat subjudul hero",
  "intro": "paragraf pembuka 2-3 kalimat",
  "sections": [{ "heading": "sub-judul (sebagian berupa pertanyaan)", "body": "2-3 paragraf, boleh memakai '- ' untuk daftar" }],
  "steps": [{ "title": "nama langkah", "body": "1-2 kalimat" }],
  "cards": [{ "title": "nama layanan/keunggulan", "description": "1-2 kalimat" }],
  "pricing": [{ "name": "nama paket", "price": "contoh: Rp 1.500.000 atau kosongkan jika paket kustom", "description": "1 kalimat", "features": ["fitur 1", "fitur 2"] }],
  "faq": [{ "q": "pertanyaan", "a": "jawaban 1-2 kalimat" }],
  "cta": { "heading": "ajakan singkat", "body": "1 kalimat", "buttonLabel": "mis. Konsultasi via WhatsApp" }
}`

export type StructureInput = {
  entityType: 'page' | 'post'
  row: GeneratorRow
  template: Pick<
    GeneratorTemplateLite,
    'h1Pattern' | 'seoDescriptionPattern' | 'seoTitlePattern' | 'slugPattern'
  >
  tokens: Record<string, string>
}

export const buildStructurePrompt = (input: StructureInput): string => {
  const { entityType, row, template, tokens } = input
  const isPost = entityType === 'post'

  return [
    `Buat konten SEO lengkap dan UNIK untuk ${isPost ? 'artikel blog' : 'landing page layanan'} berikut.`,
    `\nTOKEN / DATA:`,
    `- Kata kunci utama: ${tokens.primaryKeyword || row.primaryKeyword}`,
    `- Kata kunci pendukung: ${tokens.secondaryKeywords || '-'}`,
    `- Layanan: ${tokens.service || '-'}`,
    `- Kota/lokasi: ${tokens.city || '-'}`,
    `- Industri: ${tokens.industry || '-'}`,
    `- Penawaran/angle: ${tokens.offer || '-'}`,
    `- Konteks lokal unik: ${tokens.localCondition || '-'}`,
    `- Minimal seksi: ${isPost ? '4' : '3'}`,
    template.seoTitlePattern ? `- Pola judul SEO: ${template.seoTitlePattern}` : '',
    template.seoDescriptionPattern ? `- Pola deskripsi SEO: ${template.seoDescriptionPattern}` : '',
    template.slugPattern ? `- Jangan mengubah slug/URL.` : '',
    `\nAturan khusus:`,
    isPost
      ? '- Nada artikel edukatif/panduan; sertakan 4-6 bagian; 3-5 FAQ.'
      : '- Nada penawaran layanan; sertakan langkah proses (3-4), 4-6 kartu layanan/keunggulan, 3 paket harga INDICATIVE (kosongkan harga bila kustom), 3-5 FAQ.',
    '- metaDescription WAJIB 120-155 karakter (hitung dengan cermat).',
    '- Jangan mengarang testimoni, sertifikasi, angka statistik, atau nomor kontak.',
    '- Setiap kalimat harus spesifik ke konteks di atas; hindari frasa generik yang bisa dipakai untuk kota lain.',
    '- Jangan menyebut merek/agensi lain selain Kotacom.',
    '\nBalas HANYA dengan JSON valid (tanpa penjelasan, tanpa code fence) dengan bentuk:',
    PLAN_SCHEMA,
  ]
    .filter(Boolean)
    .join('\n')
}

/** Generate the content plan for a row via the local AI gateway. */
export const generatePlan = async (input: StructureInput): Promise<ContentPlan> => {
  const prompt = buildStructurePrompt(input)
  // 8192: the reasoning model needs headroom before emitting JSON (see ai.ts).
  const raw = await aiChat(prompt, { maxTokens: 8192 })
  const json = extractJson(raw)
  if (!json) throw new Error('AI tidak mengembalikan JSON valid')
  return normalizePlan(json)
}
