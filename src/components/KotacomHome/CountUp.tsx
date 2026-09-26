'use client'

import React, { useEffect, useRef, useState } from 'react'

/**
 * Counts from 0 to `to` once, when it scrolls into view.
 * Falls back to the final value when motion is reduced or IO is unavailable.
 */
export function CountUp({
  to,
  duration = 1500,
  className,
}: {
  to: number
  duration?: number
  className?: string
}) {
  // start at the final value so SSR/no-JS shows the real number; the count-up
  // only takes over once the element scrolls into view
  const [val, setVal] = useState(to)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduce || !('IntersectionObserver' in window)) {
      setVal(to)
      return
    }

    let raf = 0
    let start = 0

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          io.unobserve(e.target)

          const step = (t: number) => {
            if (!start) start = t
            const p = Math.min(1, (t - start) / duration)
            const eased = 1 - Math.pow(1 - p, 3)
            setVal(Math.round(to * eased))
            if (p < 1) raf = requestAnimationFrame(step)
          }
          raf = requestAnimationFrame(step)
        })
      },
      { threshold: 0.4 },
    )

    io.observe(el)
    return () => {
      io.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [to, duration])

  return (
    <span ref={ref} className={className}>
      {val}
    </span>
  )
}
