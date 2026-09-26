import { NextResponse } from 'next/server'

export const dynamic = 'force-static'

const manifest = {
  name: 'Kotacom — Solusi IT, Website, Software & Percetakan',
  short_name: 'Kotacom',
  description:
    'Mitra IT & percetakan terpercaya sejak 2008: website, software, IT support, dan percetakan untuk bisnis Anda.',
  start_url: '/',
  display: 'standalone',
  background_color: '#000000',
  theme_color: '#000000',
  icons: [
    { src: '/icon.png', sizes: '512x512', type: 'image/png' },
    { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
  ],
}

export function GET(): NextResponse {
  return NextResponse.json(manifest, {
    headers: { 'Content-Type': 'application/manifest+json' },
  })
}
