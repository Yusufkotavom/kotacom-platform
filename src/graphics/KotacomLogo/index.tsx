import React from 'react'

import classes from './index.module.scss'

type Props = {
  className?: string
}

/**
 * Kotacom wordmark for the header nav. Replaces the upstream Payload FullLogo
 * (whose SVG literally spells "Payload") — the site is Kotacom, not Payload.
 */
export const KotacomLogo: React.FC<Props> = ({ className }) => (
  <span className={[classes.logo, className].filter(Boolean).join(' ')}>
    <span aria-hidden="true" className={classes.mark} />
    Kotacom
  </span>
)
