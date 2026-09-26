'use client'

import { useEffect } from 'react'

/**
 * Subtle, restrained reveal (Geist-style): elements with [data-reveal] fade in
 * once when they enter the viewport. No parallax, no bounce — 320ms opacity.
 */
export function Reveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('[data-reveal]'))
    if (!els.length) return

    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.setAttribute('data-revealed', 'true'))
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.setAttribute('data-revealed', 'true')
            io.unobserve(e.target)
          }
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 },
    )

    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <noscript>
      {/* eslint-disable-next-line react/no-danger */}
      <style
        dangerouslySetInnerHTML={{
          __html:
            '[data-reveal]{opacity:1 !important;transform:none !important}',
        }}
      />
    </noscript>
  )
}
