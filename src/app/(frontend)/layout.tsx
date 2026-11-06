import type { Metadata, Viewport } from 'next'

import { GoogleAnalytics } from '@components/Analytics/GoogleAnalytics/index'
import { GoogleTagManager } from '@components/Analytics/GoogleTagManager/index'
import { FloatingContact } from '@components/FloatingContact/index'
import { JsonLd } from '@components/SEO/JsonLd'
import { Providers } from '@providers/index'
import { PrivacyProvider } from '@root/providers/Privacy/index'
import { themeInitScript } from '@root/providers/Theme/shared'
import { mergeOpenGraph } from '@root/seo/mergeOpenGraph'
import { localBusinessSchema, organizationSchema, websiteSchema } from '@root/seo/schema'
import React from 'react'

import { outfit, untitledSans } from './fonts'
import './globals.css'

// No segment-level render mode here: each route group decides for itself (see
// (pages)/layout.tsx, which caches at the data layer so the build needs no database).

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kotacom.id'
// Branding is per-deployment: multi-site installs share this repo, so read the
// name/tagline/description from build-time env (NEXT_PUBLIC_* are inlined).
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Kotacom'
const siteTagline = process.env.NEXT_PUBLIC_SITE_TAGLINE || 'Solusi IT, Website, Software & Percetakan Surabaya'
const siteDescription =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
  'Kotacom adalah mitra IT & percetakan terpercaya sejak 2008: pembuatan website, software development, IT support, hingga cetak buku, brosur, dan kemasan untuk bisnis Anda.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — ${siteTagline}`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  category: 'technology',
  alternates: { canonical: '/' },
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    site: process.env.NEXT_PUBLIC_TWITTER_HANDLE,
    creator: process.env.NEXT_PUBLIC_TWITTER_HANDLE,
  },
  robots: {
    index: process.env.NEXT_PUBLIC_IS_LIVE === 'true',
    follow: process.env.NEXT_PUBLIC_IS_LIVE === 'true',
  },
}

export const viewport: Viewport = {
  themeColor: '#F0F0F0',
  colorScheme: 'light',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={[outfit.variable, untitledSans.variable].join(' ')}
    >
      <head>
        {/* Set the theme before first paint so `html { opacity: 0 }` never flashes. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link href="/images/favicon.svg" rel="icon" type="image/svg+xml" />
        <link href="https://www.googletagmanager.com" rel="preconnect" />
        <link href="https://www.google-analytics.com" rel="preconnect" />
        {/* Site-wide base graph: Organization + WebSite + LocalBusiness.
            Present on every page so entity pages can reference @id nodes and local rankings. */}
        <JsonLd schema={[organizationSchema(), websiteSchema(), localBusinessSchema()]} />
        <GoogleAnalytics />
      </head>
      <body>
        <GoogleTagManager />
        <PrivacyProvider>
          <Providers>{children}</Providers>
        </PrivacyProvider>
      </body>
    </html>
  )
}
