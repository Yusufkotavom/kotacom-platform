'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Card, NumBadge } from './Card'
import { RichText } from '@components/RichText/index'

export interface QuoteSlide {
  id?: string
  quote?: string
  author?: string
  role?: string
  richText?: any
  logo?: any
}

export function BauhausSlider({
  slides,
  introContent,
  id,
}: {
  slides: QuoteSlide[]
  introContent?: any
  id?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)

  const checkScroll = () => {
    const el = containerRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanScrollLeft(scrollLeft > 10)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)

    // Calculate approximate active index
    const slideWidth = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth + 24 : 320
    const idx = Math.round(scrollLeft / slideWidth)
    setActiveIndex(Math.min(Math.max(0, idx), slides.length - 1))
  }

  useEffect(() => {
    checkScroll()
    const el = containerRef.current
    if (!el) return
    el.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll)
    return () => {
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [slides])

  const scroll = (direction: 'left' | 'right') => {
    const el = containerRef.current
    if (!el) return
    const slideWidth = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth + 24 : 340
    el.scrollBy({
      left: direction === 'left' ? -slideWidth : slideWidth,
      behavior: 'smooth',
    })
  }

  const scrollToIndex = (idx: number) => {
    const el = containerRef.current
    if (!el) return
    const slideWidth = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth + 24 : 340
    el.scrollTo({
      left: idx * slideWidth,
      behavior: 'smooth',
    })
  }

  if (!slides || slides.length === 0) return null

  return (
    <div className="relative w-full">
      {/* Header Controls */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        {introContent ? (
          <div className="max-w-2xl">
            <RichText content={introContent} />
          </div>
        ) : (
          <div />
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="Slide sebelumnya"
            className={`flex h-11 w-11 items-center justify-center border-2 border-ink bg-paper font-black transition-transform active:translate-x-0.5 active:translate-y-0.5 ${
              canScrollLeft
                ? 'cursor-pointer shadow-nb-sm hover:bg-nb-yellow'
                : 'cursor-not-allowed opacity-40 shadow-none'
            }`}
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label="Slide berikutnya"
            className={`flex h-11 w-11 items-center justify-center border-2 border-ink bg-paper font-black transition-transform active:translate-x-0.5 active:translate-y-0.5 ${
              canScrollRight
                ? 'cursor-pointer shadow-nb-sm hover:bg-nb-yellow'
                : 'cursor-not-allowed opacity-40 shadow-none'
            }`}
          >
            →
          </button>
        </div>
      </div>

      {/* Slider Track with Native CSS Scroll Snap */}
      <div
        ref={containerRef}
        className="flex gap-6 overflow-x-auto pb-6 pt-2 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {slides.map((s, i) => (
          <div
            key={s.id || i}
            className="w-[85vw] max-w-[380px] shrink-0 snap-start sm:w-[45vw] sm:max-w-[420px] lg:w-[32vw]"
          >
            <Card
              cornerShape="circle"
              cornerTone={i % 3 === 0 ? 'yellow' : i % 3 === 1 ? 'red' : 'blue'}
              className="flex h-full flex-col justify-between p-7"
            >
              <div>
                <NumBadge n={String(i + 1).padStart(2, '0')} />
                {s.quote ? (
                  <blockquote className="mt-4 font-serif text-lg font-bold italic leading-snug text-ink sm:text-xl">
                    “{s.quote}”
                  </blockquote>
                ) : null}
                {s.richText ? (
                  <div className="mt-4 text-sm leading-relaxed text-ink/80">
                    <RichText content={s.richText} />
                  </div>
                ) : null}
              </div>

              {s.author ? (
                <div className="mt-6 border-t-2 border-ink/10 pt-4">
                  <p className="font-mono text-xs font-black uppercase tracking-wider text-ink">
                    {s.author}
                  </p>
                  {s.role ? (
                    <p className="font-mono text-[11px] text-ink/70">
                      {s.role}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </Card>
          </div>
        ))}
      </div>

      {/* Slide Pagination Dots / Progress Bar */}
      <div className="mt-4 flex items-center justify-between border-t-2 border-ink/20 pt-4">
        <div className="flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollToIndex(idx)}
              aria-label={`Ke slide ${idx + 1}`}
              className={`h-3 border-2 border-ink transition-all ${
                activeIndex === idx
                  ? 'w-8 bg-nb-red shadow-nb-sm'
                  : 'w-3 bg-paper hover:bg-nb-yellow'
              }`}
            />
          ))}
        </div>
        <div className="font-mono text-xs font-bold uppercase tracking-wider text-ink/70">
          Slide {activeIndex + 1} / {slides.length}
        </div>
      </div>
    </div>
  )
}

export default BauhausSlider
