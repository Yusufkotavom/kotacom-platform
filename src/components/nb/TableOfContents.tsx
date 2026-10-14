'use client'

import * as React from 'react'
import { AlignLeft, ChevronDown } from 'lucide-react'

export interface TocItem {
  id: string
  text: string
  level: number
}

export function TableOfContents({ items }: { items: TocItem[] }) {
  const [open, setOpen] = React.useState(true)

  if (!items || items.length === 0) return null

  return (
    <div className="my-8 border-4 border-ink bg-nb-canvas p-4 sm:p-6 shadow-nb-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left font-display text-base sm:text-lg font-black uppercase tracking-wide text-ink"
      >
        <span className="flex items-center gap-2">
          <AlignLeft className="h-5 w-5 text-nb-red" />
          Daftar Isi Artikel
        </span>
        <ChevronDown
          className={`h-5 w-5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <nav aria-label="Daftar Isi" className="mt-4 border-t-2 border-ink pt-4">
          <ol className="space-y-2 text-sm">
            {items.map((item, idx) => (
              <li
                key={`${item.id}-${idx}`}
                className={item.level === 3 ? 'ml-4 list-[circle]' : 'list-decimal list-inside font-bold'}
              >
                <a
                  href={`#${item.id}`}
                  className="text-ink hover:text-nb-red hover:underline underline-offset-2 transition-colors"
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}
    </div>
  )
}
