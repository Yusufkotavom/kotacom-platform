import type { AiContentBlock } from '@root/payload-types'

import { Gutter } from '@components/Gutter/index'
import { RichText } from '@components/RichText/index'
import React from 'react'

type Props = {
  disableGutter?: boolean
} & AiContentBlock

/**
 * Renders an `aiContent` block: prefer the AI `generatedText`, fall back to the
 * manual `content`. Missing both renders nothing — an AI failure degrades
 * gracefully instead of breaking the page.
 */
export const AiContent: React.FC<Props> = ({ aiContentFields, disableGutter }) => {
  const content = aiContentFields?.generatedText || aiContentFields?.content

  if (!content) {
    return null
  }

  return disableGutter ? (
    <RichText content={content} />
  ) : (
    <Gutter>
      <RichText content={content} />
    </Gutter>
  )
}
