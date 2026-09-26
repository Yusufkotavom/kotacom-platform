/**
 * Minimal Lexical authoring helpers — build the richText JSON that Payload's
 * `blogContent`, `aiContent.generatedText`, `excerpt`, etc. expect, from plain
 * text the AI returns. Supports paragraphs, `##`/`###` headings and simple
 * `-`/`1.` lists. Nested marks (bold/italic) are intentionally out of scope for
 * generated copy (the writer prompt asks for plain prose + light structure).
 */

type LexNode = Record<string, unknown>

const textNode = (text: string): LexNode => ({
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text,
  type: 'text',
  version: 1,
})

const paragraphNode = (text: string): LexNode => ({
  children: [textNode(text)],
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  textStyle: '',
  type: 'paragraph',
  version: 1,
})

const headingNode = (text: string, tag: 'h2' | 'h3' | 'h4'): LexNode => ({
  children: [textNode(text)],
  direction: 'ltr',
  format: '',
  indent: 0,
  tag,
  type: 'heading',
  version: 1,
})

const listNode = (items: string[], listType: 'bullet' | 'number'): LexNode => ({
  children: items.map((item) => ({
    children: [textNode(item)],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'listitem',
    value: 1,
    version: 1,
  })),
  direction: 'ltr',
  format: '',
  indent: 0,
  listType,
  start: 1,
  tag: listType === 'bullet' ? 'ul' : 'ol',
  type: 'list',
  version: 1,
})

const emptyRoot = (): LexNode => ({
  children: [],
  direction: 'ltr',
  format: '',
  indent: 0,
  type: 'root',
  version: 1,
})

export type LexicalValue = { root: LexNode }

/** Turn multi-line AI text into a Lexical root. Handles headings + lists. */
export const lexicalFromText = (text: string): LexicalValue => {
  const lines = (text || '').replace(/\r\n/g, '\n').split('\n')
  const children: LexNode[] = []
  let listBuffer: string[] = []
  let listType: 'bullet' | 'number' = 'bullet'

  const flushList = (): void => {
    if (listBuffer.length) {
      children.push(listNode(listBuffer, listType))
      listBuffer = []
    }
  }

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) {
      flushList()
      continue
    }

    const heading = /^(#{2,4})\s+(.*)$/.exec(line)
    if (heading) {
      flushList()
      const level = heading[1].length
      children.push(headingNode(heading[2].trim(), level <= 2 ? 'h2' : level === 3 ? 'h3' : 'h4'))
      continue
    }

    const bullet = /^[-*]\s+(.*)$/.exec(line)
    if (bullet) {
      if (listType !== 'bullet') flushList()
      listType = 'bullet'
      listBuffer.push(bullet[1].trim())
      continue
    }

    const numbered = /^\d+[.)]\s+(.*)$/.exec(line)
    if (numbered) {
      if (listType !== 'number') flushList()
      listType = 'number'
      listBuffer.push(numbered[1].trim())
      continue
    }

    flushList()
    children.push(paragraphNode(line))
  }
  flushList()

  return { root: { ...emptyRoot(), children } }
}

/** Plain-text (no structure) Lexical value — for short excerpts / one-liners. */
export const lexicalFromPlain = (text: string): LexicalValue => ({
  root: { ...emptyRoot(), children: text ? [paragraphNode(text)] : [] },
})

/** True when a Lexical value has at least one non-empty text node. */
export const lexicalHasText = (value: unknown): boolean => {
  if (!value || typeof value !== 'object') return false
  const root = (value as { root?: LexNode }).root
  if (!root) return false
  let found = false
  const walk = (node: LexNode): void => {
    if (found) return
    if (typeof node.text === 'string' && node.text.trim()) found = true
    if (Array.isArray(node.children)) (node.children as LexNode[]).forEach(walk)
  }
  walk(root)
  return found
}
