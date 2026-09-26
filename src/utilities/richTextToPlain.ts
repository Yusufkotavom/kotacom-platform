type LexicalNode = { text?: string; children?: LexicalNode[] }

/**
 * Flatten a Lexical richText value to plain text — for `meta description`,
 * JSON-LD `description`, and other places that need a string, not a tree.
 */
export const richTextToPlain = (data: unknown): string => {
  if (!data || typeof data !== 'object') return ''
  const root = (data as { root?: LexicalNode }).root
  if (!root) return ''

  const out: string[] = []
  const walk = (node: LexicalNode): void => {
    if (typeof node.text === 'string') out.push(node.text)
    if (Array.isArray(node.children)) node.children.forEach(walk)
  }
  walk(root)

  return out.join(' ').replace(/\s+/g, ' ').trim()
}
