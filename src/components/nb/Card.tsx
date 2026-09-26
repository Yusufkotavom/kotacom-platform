import * as React from 'react'
import { cn } from '../../utilities/cn'
import { Shape, type ShapeKind, type ShapeTone } from './Shape'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional geometric corner decoration (top-right). */
  cornerShape?: ShapeKind
  cornerTone?: ShapeTone
}

/** White Bauhaus card: 4px black border, hard 8px offset shadow, optional corner shape. */
export function Card({
  cornerShape,
  cornerTone = 'red',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'relative border-4 border-ink bg-paper shadow-nb-lg lift',
        className,
      )}
      {...props}
    >
      {cornerShape ? (
        <Shape
          kind={cornerShape}
          tone={cornerTone}
          className="absolute right-4 top-4 h-9 w-9"
        />
      ) : null}
      {children}
    </div>
  )
}

/**
 * Numbered geometric badge used for "how it works" steps and card indices.
 * Rotates the primitive through circle / square / triangle per index.
 */
export function NumBadge({
  n,
  tone = 'red',
  shape,
  className,
}: {
  n: string | number
  tone?: ShapeTone
  shape?: ShapeKind
  className?: string
}) {
  const order: ShapeKind[] = ['circle', 'square', 'triangle', 'diamond']
  const kind = shape ?? order[(Number(n) - 1 + order.length) % order.length]
  const toneMap: Record<ShapeKind, ShapeTone> = {
    circle: 'yellow',
    square: 'blue',
    triangle: 'red',
    diamond: 'yellow',
  }
  const finalTone = tone ?? toneMap[kind]
  const textTone = finalTone === 'yellow' || finalTone === 'white' ? 'text-ink' : 'text-white'
  return (
    <span className={cn('relative inline-block h-14 w-14', className)}>
      <Shape kind={kind} tone={finalTone} className="absolute inset-0 h-full w-full" />
      <span
        className={cn(
          'absolute inset-0 flex items-center justify-center text-xl font-black',
          textTone,
          kind === 'triangle' && 'pt-3',
        )}
      >
        {n}
      </span>
    </span>
  )
}
