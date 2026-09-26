'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../utilities/cn'

export interface AccordionItem {
  q: string
  a: React.ReactNode
}

/**
 * Bauhaus FAQ accordion: red header bar, expanded content on light-yellow.
 * Native <details> for accessibility + no-JS resilience.
 */
export function Accordion({ items, className }: { items: AccordionItem[]; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {items.map((item, i) => (
        <details
          key={i}
          className="group border-4 border-ink bg-paper shadow-nb-sm open:shadow-nb"
          open={i === 0}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 bg-nb-red p-5 font-bold uppercase text-white [&::-webkit-details-marker]:hidden">
            <span>{item.q}</span>
            <ChevronDown className="h-6 w-6 shrink-0 transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <div className="border-t-4 border-ink bg-[#FFF9C4] p-5 font-medium leading-relaxed text-ink">
            {item.a}
          </div>
        </details>
      ))}
    </div>
  )
}
