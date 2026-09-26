/**
 * AI client for the generator. Talks to the local OpenAI-compatible gateway
 * (default `http://localhost:20128/v1`, model `pro-coding` — the same model
 * Hermes runs on).
 *
 * IMPORTANT (verified by recon 2026-09-14): `pro-coding` is a REASONING model
 * routed by the gateway. Two behaviours must be handled or "100% AI" silently
 * yields empty content:
 *   1. it returns `message.reasoning_content`; with a small `max_tokens` the
 *      real `message.content` comes back EMPTY with finish_reason='length'
 *      → send a generous `max_tokens` and read `content` only.
 *   2. the gateway may answer as SSE (`text/event-stream`)
 *      → request `stream:false`; if the body still starts with `data:`,
 *        concatenate the deltas.
 */

const AI_BASE = (process.env.AI_BASE_URL || 'http://localhost:20128/v1').replace(/\/$/, '')
const AI_MODEL = process.env.AI_MODEL || 'pro-coding'
const AI_KEY = process.env.AI_API_KEY || ''
/**
 * `pro-coding` (reasoning model) burns most of its token budget on
 * `reasoning_content` before emitting `content`. Measured 2026-09-15: at
 * max_tokens=2048 the reply hit `finish_reason:'length'` with a 6.3k-char
 * reasoning trace and an EMPTY `content`; at 8192 it finished with real
 * content. Keep the default generous.
 */
const AI_MAX_TOKENS = Number(process.env.AI_MAX_TOKENS || 8192)
const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 90_000)

export const aiConfigured = (): boolean => process.env.AI_ENABLED !== 'false' && Boolean(AI_MODEL)

export const AI_WRITER_SYSTEM = [
  'Kamu adalah copywriter SEO berbahasa Indonesia untuk Kotacom (layanan IT: pembuatan website, software, percetakan/cetak buku, sistem POS).',
  'Tulis konten yang unik, spesifik untuk topik & lokasi yang diberikan, ramah pembaca, dan berorientasi konversi (lead via WhatsApp).',
  'Aturan: pakai kata kunci utama secara natural (tanpa keyword stuffing); sebagian sub-judul sebagai pertanyaan; sertakan struktur H2/H3 via awalan "## "/"### " dan daftar "- "; jangan mengarang data statistik atau nomor telepon; panjang wajar.',
  'Balas HANYA dengan JSON valid, tanpa penjelasan tambahan dan tanpa code fence.',
].join(' ')

const parseSse = (text: string): string => {
  let out = ''
  for (const line of text.split('\n')) {
    const trimmed = line.replace(/^data:\s*/, '').trim()
    if (!trimmed || trimmed === '[DONE]') continue
    try {
      const json = JSON.parse(trimmed)
      out += json?.choices?.[0]?.delta?.content ?? ''
    } catch {
      // ignore malformed SSE chunk
    }
  }
  return out
}

export const aiChat = async (
  prompt: string,
  opts?: { maxTokens?: number; system?: string; temperature?: number },
): Promise<string> => {
  const body = {
    messages: [
      { content: opts?.system ?? AI_WRITER_SYSTEM, role: 'system' },
      { content: prompt, role: 'user' },
    ],
    model: AI_MODEL,
    stream: false,
    temperature: opts?.temperature ?? 0.7,
    max_tokens: opts?.maxTokens ?? AI_MAX_TOKENS,
  }

  const res = await fetch(`${AI_BASE}/chat/completions`, {
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      ...(AI_KEY ? { Authorization: `Bearer ${AI_KEY}` } : {}),
    },
    method: 'POST',
    signal: AbortSignal.timeout(AI_TIMEOUT_MS),
  })

  if (!res.ok) {
    throw new Error(`AI HTTP ${res.status} ${res.statusText}`)
  }

  const text = await res.text()
  if (text.trimStart().startsWith('data:')) {
    return parseSse(text).trim()
  }

  const json = JSON.parse(text) as {
    choices?: { message?: { content?: string } }[]
  }
  return String(json?.choices?.[0]?.message?.content ?? '').trim()
}

// ---------------------------------------------------------------------------
// `[aigen:prompt]` shortcode support — resolve model prompts embedded in any
// richText string (mirrors Sanity-clean's ai.ts). Bodies from the content plan
// already arrive filled, so this only handles hand-authored placeholders.
// ---------------------------------------------------------------------------

const AIGEN = /\[aigen:([\s\S]*?)\]/g

export const extractAiPrompts = (obj: unknown): string[] => {
  const found = new Set<string>()
  const walk = (node: unknown): void => {
    if (typeof node === 'string') {
      let match: RegExpExecArray | null
      const re = new RegExp(AIGEN.source, 'g')
      while ((match = re.exec(node)) !== null) found.add(match[1])
    } else if (Array.isArray(node)) {
      node.forEach(walk)
    } else if (node && typeof node === 'object') {
      Object.values(node as Record<string, unknown>).forEach(walk)
    }
  }
  walk(obj)
  return [...found]
}

export const replacePromptsIn = (obj: unknown, replacements: Record<string, string>): unknown => {
  if (typeof obj === 'string') {
    return obj.replace(new RegExp(AIGEN.source, 'g'), (m, p: string) => replacements[p] || m)
  }
  if (Array.isArray(obj)) return obj.map((item) => replacePromptsIn(item, replacements))
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([k, v]) => [
        k,
        replacePromptsIn(v, replacements),
      ]),
    )
  }
  return obj
}

/** Resolve any remaining `[aigen:…]` placeholders in a draft (best-effort). */
export const resolveShortcodes = async (draft: unknown): Promise<{ draft: unknown; used: boolean }> => {
  const prompts = extractAiPrompts(draft)
  if (!prompts.length) return { draft, used: false }

  const replacements: Record<string, string> = {}
  for (const p of prompts) {
    try {
      replacements[p] = await aiChat(p)
    } catch {
      replacements[p] = p // leave the raw prompt text if the model failed
    }
  }
  return { draft: replacePromptsIn(draft, replacements), used: true }
}

export const aiInfo = () => ({ base: AI_BASE, configured: aiConfigured(), model: AI_MODEL })
