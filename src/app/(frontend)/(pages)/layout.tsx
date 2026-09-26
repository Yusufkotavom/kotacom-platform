import { Footer } from '@components/nb/Footer'
import { Header } from '@components/nb/Header'
import React from 'react'

// Render the whole (pages) group on demand. `next build` must never prerender these
// routes: the Dokploy builder runs OUTSIDE `dokploy-network` and cannot reach the
// database, so any static prerender that initialises Payload fails the build
// (`payloadInitError` → "Export encountered an error on /(frontend)/(pages)/page: /").
// DB-backed routes in this group are already `force-dynamic`; this makes the group
// consistent so even fully-static pages (the home page) are not prerendered.
export const dynamic = 'force-dynamic'

/** Marketing/content shell: Bauhaus header + footer around page content. */
export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
