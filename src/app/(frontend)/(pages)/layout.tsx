import { Footer } from '@components/nb/Footer'
import { Header } from '@components/nb/Header'
import React from 'react'

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
