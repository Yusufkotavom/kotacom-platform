'use client'

import React, { useEffect, useRef, useState } from 'react'

import classes from './index.module.scss'

/**
 * Animated deploy console — loops quietly, respects prefers-reduced-motion.
 * Doubles as a visual proof of the engineering work, Vercel-style.
 */
const SCRIPT = [
  { kind: 'cmd', text: 'kotacom deploy --env production' },
  { kind: 'ok', text: 'Build selesai · 38s · 0 error' },
  { kind: 'ok', text: 'Migrasi database · 12 skema' },
  { kind: 'ok', text: 'Aset disebar ke 3 edge location' },
  { kind: 'ok', text: 'SSL & DNS terverifikasi' },
  { kind: 'live', text: 'Produksi aktif — payload.kotacom.id' },
] as const

export function Terminal() {
  const [step, setStep] = useState(0)
  const [typed, setTyped] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduce) {
      setStep(SCRIPT.length)
      setTyped('')
      return
    }

    let cancelled = false
    let s = 0
    let c = 0

    const tick = () => {
      if (cancelled) return

      if (s >= SCRIPT.length) {
        timer.current = setTimeout(() => {
          if (cancelled) return
          s = 0
          c = 0
          setStep(0)
          setTyped('')
          tick()
        }, 7000)
        return
      }

      const line = SCRIPT[s]

      if (line.kind === 'cmd') {
        if (c <= line.text.length) {
          setTyped(line.text.slice(0, c))
          c += 1
          timer.current = setTimeout(tick, 32)
        } else {
          s += 1
          c = 0
          setStep(s)
          timer.current = setTimeout(tick, 400)
        }
      } else {
        s += 1
        setStep(s)
        timer.current = setTimeout(tick, 450)
      }
    }

    tick()

    return () => {
      cancelled = true
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  const done = SCRIPT.slice(0, step)
  const typing = step < SCRIPT.length ? SCRIPT[step] : null
  const typingPartial = typing && typing.kind === 'cmd' ? typed : null

  return (
    <div className={classes.term}>
      <div className={classes.termBar}>
        <span className={classes.termTitle}>deploy — kotacom</span>
        <span className={classes.termEnv}>production</span>
      </div>

      <div className={classes.termBody}>
        {done.map((l, i) => (
          <p className={classes[`termLine_${l.kind}`]} key={`${l.kind}-${i}`}>
            {l.kind === 'cmd' && <span className={classes.termPrompt}>$</span>}
            {l.kind === 'ok' && <span className={classes.termCheck}>✓</span>}
            {l.kind === 'live' && <span className={classes.termPulse} />}
            <span>{l.text}</span>
          </p>
        ))}

        {typingPartial !== null && (
          <p className={classes.termLine_cmd}>
            <span className={classes.termPrompt}>$</span>
            <span>{typingPartial}</span>
            <span className={classes.caret} />
          </p>
        )}

        {typingPartial === null && step >= SCRIPT.length && (
          <p className={classes.termLine_cmd}>
            <span className={classes.termPrompt}>$</span>
            <span className={classes.caret} />
          </p>
        )}
      </div>
    </div>
  )
}
