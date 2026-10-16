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
      { label: 'Pembuatan Website', href: '/pembuatan-website' },
      { label: 'Software Development', href: '/software' },
      { label: 'IT Service & Support', href: '/layanan' },
      { label: 'Sistem POS', href: '/sistem-pos' },
      { label: 'Percetakan', href: '/percetakan' },
    ],
  },
  {
    title: 'Perusahaan',
    links: [
      { label: 'Studi Kasus', href: '/case-studies' },
      { label: 'Produk', href: '/produk' },
      { label: 'Blog', href: '/posts' },
      { label: 'Kontak', href: '/contact' },
    ],
  },
  {
    title: 'Populer',
    links: [
      { label: 'Jasa Cetak Buku Surabaya', href: '/jasa-cetak-buku-surabaya' },
      { label: 'Service Komputer Panggilan', href: '/service-komputer-surabaya-panggilan' },
      { label: 'Jasa Recovery Data', href: '/jasa-recovery-data-surabaya' },
      { label: 'Jasa Instal Aplikasi', href: '/jasa-instal-aplikasi-surabaya' },
    ],
  },
]

/** Two physical offices, mirrored from the live kotacom.id footer. */
const OFFICES = [
  {
    label: 'Kantor Sidoarjo',
    lines: ['Graha Indraprasta G7/15', 'Tulangan, Sidoarjo 61273', 'Jawa Timur, Indonesia'],
  },
  {
    label: 'Kantor Surabaya',
    lines: ['Jl. Tenggilis Mulya 76', 'Surabaya, Jawa Timur 60292', 'Indonesia'],
  },
]

/** Canonical contact details — single source used across the footer. */
const WHATSAPP_HREF = 'https://wa.me/6285799520350'
const PHONE_DISPLAY = '+62 857-9952-0350'
const PHONE_HREF = 'tel:+6285799520350'
const EMAIL = 'halo@kotacom.id'

export interface FooterProps {
  columns?: FooterColumn[]
  businessName?: string
  summary?: string
  whatsapp?: { href: string; display: string }
  phone?: { href: string; display: string }
  email?: string
  offices?: Array<{ label: string; lines: string[] }>
  foundedYear?: string
}

export function Footer({
  columns = [],
  businessName,
  summary,
  whatsapp,
  phone,
  email,
  offices = [],
  foundedYear,
}: FooterProps) {
  const hasContact = Boolean(whatsapp || phone || email)
  const hasOffices = Array.isArray(offices) && offices.length > 0
  const hasColumns = Array.isArray(columns) && columns.length > 0

  return (
    <footer className="border-t-4 border-ink bg-ink text-white">
      <div
        className={`mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 ${
          hasColumns ? 'lg:grid-cols-4' : 'lg:grid-cols-1'
        } lg:px-8`}
      >
        <div>
          <span className="inline-flex items-center gap-2 text-xl font-black uppercase tracking-tight">
            <span className="inline-flex items-center">
              <span className="block h-6 w-6 rounded-full border-2 border-white bg-nb-red" />
              <span className="-ml-1 block h-6 w-6 rotate-45 border-2 border-white bg-nb-blue" />
              <span className="tri -ml-1 block h-5 w-5 border-2 border-white bg-nb-yellow" />
            </span>
            {businessName || ''}
          </span>
          {summary ? (
            <p className="mt-4 max-w-xs font-medium leading-relaxed text-white/80">{summary}</p>
          ) : null}
          {hasContact ? (
            <div className="mt-5 space-y-1.5 text-sm font-bold">
              {whatsapp ? (
                <a
                  href={whatsapp.href}
                  className="block hover:text-nb-yellow"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  WhatsApp: {whatsapp.display}
                </a>
              ) : null}
              {phone ? (
                <a href={phone.href} className="block hover:text-nb-yellow">
                  Telp: {phone.display}
                </a>
              ) : null}
              {email ? (
                <a href={`mailto:${email}`} className="block lowercase hover:text-nb-yellow">
                  {email}
                </a>
              ) : null}
            </div>
          ) : null}
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

      {hasOffices ? (
        <div className="border-t-2 border-white/20">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:px-8">
            {offices.map((office) => (
              <div key={office.label}>
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-nb-yellow">
                  {office.label}
                </p>
                <address className="mt-3 not-italic font-medium leading-relaxed text-white/80">
                  {businessName ? (
                    <span className="block font-bold text-white">{businessName}</span>
                  ) : null}
                  {office.lines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="border-t-2 border-white/20">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 sm:px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-widest text-white/70">
            © {new Date().getFullYear()} {businessName || ''}
          </p>
          {foundedYear ? <Pill tone="yellow">EST. {foundedYear}</Pill> : null}
        </div>
      </div>
    </footer>
  )
}
