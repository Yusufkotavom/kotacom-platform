import * as React from 'react'
import { cn } from '../../utilities/cn'

export type PillTone = 'ink' | 'red' | 'blue' | 'yellow' | 'white'

const TONE: Record<PillTone, string> = {
  ink: 'bg-ink text-white border-ink',
  red: 'bg-nb-red text-white border-ink',
  blue: 'bg-nb-blue text-white border-ink',
  yellow: 'bg-nb-yellow text-ink border-ink',
  white: 'bg-paper text-ink border-ink',
}

export interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: PillTone
}

/** Small mono uppercase tag chip (NEXT.JS, FLUTTER, SERVER…). */
export function Pill({ tone = 'white', className, children, ...props }: PillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center border-2 px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-widest',
        TONE[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
