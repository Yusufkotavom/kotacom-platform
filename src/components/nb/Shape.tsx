import * as React from 'react'
import { cn } from '../../utilities/cn'

export type ShapeKind = 'circle' | 'square' | 'triangle' | 'diamond'
export type ShapeTone = 'red' | 'blue' | 'yellow' | 'ink' | 'white'

const TONE: Record<ShapeTone, string> = {
  red: 'bg-nb-red',
  blue: 'bg-nb-blue',
  yellow: 'bg-nb-yellow',
  ink: 'bg-ink',
  white: 'bg-paper',
}

export interface ShapeProps extends React.HTMLAttributes<HTMLSpanElement> {
  kind?: ShapeKind
  tone?: ShapeTone
  border?: boolean
}

/** One Bauhaus primitive: circle, square, triangle or 45°-rotated diamond. */
export function Shape({
  kind = 'square',
  tone = 'red',
  border = true,
  className,
  ...props
}: ShapeProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'block',
        kind === 'circle' && 'rounded-full',
        kind === 'triangle' && 'tri',
        kind === 'diamond' && 'rot',
        border && 'border-2 border-ink',
        TONE[tone],
        className,
      )}
      {...props}
    />
  )
}
