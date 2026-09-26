import * as React from 'react'
import { cn } from '../../utilities/cn'

export type SectionBg = 'canvas' | 'paper' | 'muted' | 'red' | 'blue' | 'yellow' | 'ink'

const BG: Record<SectionBg, string> = {
  canvas: 'bg-canvas text-ink',
  paper: 'bg-paper text-ink',
  muted: 'bg-muted text-ink',
  red: 'bg-nb-red text-white',
  blue: 'bg-nb-blue text-white',
  yellow: 'bg-nb-yellow text-ink',
  ink: 'bg-ink text-white',
}

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  bg?: SectionBg
  /** Remove the bottom rule (e.g. last section before footer). */
  noRule?: boolean
  /** Tighter vertical rhythm (for compact bands like metric bars). */
  compact?: boolean
  /** Full-bleed: skip the max-width container (content supplies its own). */
  bleed?: boolean
  id?: string
}

export function Section({
  bg = 'canvas',
  noRule = false,
  compact = false,
  bleed = false,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn('relative', !noRule && 'border-b-4 border-ink', BG[bg], className)}
      {...props}
    >
      {bleed ? (
        children
      ) : (
        <div
          className={cn(
            'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8',
            compact ? 'py-8 sm:py-10' : 'py-12 sm:py-16 lg:py-24',
          )}
        >
          {children}
        </div>
      )}
    </section>
  )
}

/** Section eyebrow: "01 — LAYANAN" */
export function SectionTag({ index, label }: { index: string; label: string }) {
  return (
    <span className="inline-block border-2 border-ink bg-paper px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest">
      {index} — {label}
    </span>
  )
}
