import React from 'react'

type Schema = Record<string, unknown>

/**
 * Renders one or more JSON-LD schema objects into a single <script> tag.
 * Server component — safe to use in any route.
 */
export const JsonLd: React.FC<{ schema: Schema | Schema[] }> = ({ schema }) => {
  const data = Array.isArray(schema) ? schema : [schema]
  return (
    <script
      type="application/ld+json"
      // schema comes from our own builder functions, never user HTML
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
