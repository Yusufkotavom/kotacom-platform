'use client'

import type { Footer as FooterType } from '@types'

import { BackgroundGrid } from '@components/BackgroundGrid/index'
import { CMSLink } from '@components/CMSLink/index'
import { Gutter } from '@components/Gutter/index'
import { usePathname } from 'next/navigation'
import React from 'react'

import classes from './index.module.scss'

// Footer is driven entirely by the `footer` global (up to 3 CMS columns). The
// template's fourth column — Payload's own social links, newsletter signup, theme
// switcher and 3D logo — was removed: it pointed at payloadcms.com accounts and is
// not part of the Kotacom site.
export const Footer: React.FC<FooterType> = ({ columns }) => {
  const pathname = usePathname()

  // The cloud dashboard renders its own chrome; keep a top border there so the
  // footer reads as separate from the app shell.
  const allowedSegments = [
    'cloud',
    'cloud-terms',
    'forgot-password',
    'join-team',
    'login',
    'logout',
    'new',
    'reset-password',
    'verify',
    'signup',
  ]
  const isCloudPage = pathname.split('/').filter(Boolean).some((s) => allowedSegments.includes(s))

  return (
    <footer className={classes.footer} data-theme="dark">
      <BackgroundGrid
        className={[classes.background, isCloudPage ? classes.topBorder : '']
          .filter(Boolean)
          .join(' ')}
        zIndex={2}
      />
      <Gutter className={classes.container}>
        <div className={[classes.grid, 'grid'].filter(Boolean).join(' ')}>
          {(columns ?? []).map((column, columnIndex) => (
            <div
              className={['cols-4 cols-m-8 cols-s-8'].filter(Boolean).join(' ')}
              key={columnIndex}
            >
              <p className={classes.colHeader}>{column?.label}</p>
              <div className={classes.colItems}>
                {column?.navItems?.map(({ link }, index) => (
                  <React.Fragment key={index}>
                    <CMSLink className={classes.link} {...link} />
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Gutter>
    </footer>
  )
}
