import * as React from 'react'
import Link from 'next/link'
import { Logo } from './Header'
import { Pill } from './Pill'

export interface FooterColumn {
  title: string
  links: { label: string; href: string }[]
}

const DEFAULT_COLUMNS: FooterColumn[] = [
  {
    title: 'Layanan',
    links: [
      { label: 'Website', href: '/layanan/website' },
      { label: 'Software', href: '/layanan/software' },
      { label: 'IT Support', href: '/layanan/it-support' },
      { label: 'Percetakan', href: '/layanan/percetakan' },
    ],
  },
  {
    title: 'Kontak',
    links: [
      { label: 'WhatsApp', href: '#' },
      { label: 'Surabaya, ID', href: '/tentang' },
      { label: 'EST. 2008', href: '/tentang' },
    ],
  },
]

export function Footer({
  columns = DEFAULT_COLUMNS,
  summary = 'Studio digital & percetakan di Surabaya. Website, software, infrastruktur IT, dan cetak.',
}: {
  columns?: FooterColumn[]
  summary?: string
}) {
  return (
    <footer className="border-t-4 border-ink bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <span className="inline-flex items-center gap-2 text-xl font-black uppercase tracking-tight">
            <span className="inline-flex items-center">
              <span className="block h-6 w-6 rounded-full border-2 border-white bg-nb-red" />
              <span className="-ml-1 block h-6 w-6 rotate-45 border-2 border-white bg-nb-blue" />
              <span className="tri -ml-1 block h-5 w-5 border-2 border-white bg-nb-yellow" />
            </span>
            Kotacom
          </span>
          <p className="mt-4 max-w-xs font-medium leading-relaxed text-white/80">{summary}</p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-white/60">
              {col.title}
            </p>
            <ul className="mt-4 space-y-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="font-bold uppercase tracking-wide hover:text-nb-yellow"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t-2 border-white/20">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 sm:px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-widest text-white/70">
            © {new Date().getFullYear()} Kotacom — Form follows function.
          </p>
          <Pill tone="yellow">EST. 2008</Pill>
        </div>
      </div>
    </footer>
  )
}
