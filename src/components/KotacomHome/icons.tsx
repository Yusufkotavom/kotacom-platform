import React from 'react'

/* ── registration crosshair (blueprint/editorial mark) ───────────────────── */
export const CrossMark = ({ className }: { className?: string }) => (
  <span className={className} aria-hidden="true">
    <svg viewBox="0 0 12 12" width="11" height="11">
      <path d="M6 0v12M0 6h12" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  </span>
)

/* ── service glyphs — hairline, 1px stroke, 28px box ─────────────────────── */
const glyph = {
  width: 28,
  height: 28,
  viewBox: '0 0 28 28',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.25,
  'aria-hidden': true as const,
}

export const GlyphWebsite = () => (
  <svg {...glyph}>
    <rect x="2.5" y="4.5" width="23" height="19" />
    <path d="M2.5 10.5h23" />
    <path d="M6 7.5h.01M9 7.5h.01M12 7.5h.01" strokeLinecap="round" />
    <path d="M6 14.5h9M6 18.5h13" />
  </svg>
)

export const GlyphSoftware = () => (
  <svg {...glyph}>
    <path d="M10.5 9 4.5 14l6 5" />
    <path d="M17.5 9l6 5-6 5" />
    <path d="M15.5 6.5l-3 15" />
  </svg>
)

export const GlyphInfra = () => (
  <svg {...glyph}>
    <rect x="3.5" y="4.5" width="21" height="7" />
    <rect x="3.5" y="16.5" width="21" height="7" />
    <path d="M7 8h.01M7 20h.01" strokeLinecap="round" />
    <path d="M17 8h4M17 20h4" />
  </svg>
)

export const GlyphPrint = () => (
  <svg {...glyph}>
    <path d="M8.5 10.5V3.5h11v7" />
    <path d="M8.5 20.5h-4v-10h19v10h-4" />
    <rect x="8.5" y="16.5" width="11" height="8" />
    <path d="M20.5 14h.01" strokeLinecap="round" />
  </svg>
)

/* ── arrow / plus used across the page ───────────────────────────────────── */
export const Arrow = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
    <path d="M2 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
)

export const Plus = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
    <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
)
