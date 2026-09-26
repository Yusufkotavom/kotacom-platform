import React from 'react'

import classes from './index.module.scss'

type BackgroundGradientProps = {
  className?: string
}

/**
 * Ambient background for hero / CTA blocks.
 *
 * Previously this rendered a 8.5 MB video hosted on Vercel Blob. That is gone:
 * everything is self-hosted on this VPS, and the design system is strict Geist
 * (flat, hairline, no glass / glow / gradient). This is now pure CSS — a masked
 * blueprint grid plus one soft radial wash, which keeps the visual interest
 * without pulling bytes over the network or depending on a third party.
 */
export default function BackgroundGradient(props: BackgroundGradientProps) {
  const { className } = props

  return (
    <div className={[className, classes.backgroundGradientWrapper].filter(Boolean).join(' ')}>
      <span aria-hidden className={classes.grid} />
      <span aria-hidden className={classes.wash} />
    </div>
  )
}
