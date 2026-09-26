'use client'

import { Button } from '@components/Button/index'
import { usePrivacy } from '@root/providers/Privacy/index'
import Link from 'next/link'
import * as React from 'react'

import classes from './index.module.scss'

export const PrivacyBanner: React.FC = () => {
  const [closeBanner, setCloseBanner] = React.useState(false)
  const [animateOut, setAnimateOut] = React.useState(false)

  const { showConsent, updateCookieConsent } = usePrivacy()

  const handleCloseBanner = () => {
    setAnimateOut(true)
  }

  React.useEffect(() => {
    if (animateOut) {
      setTimeout(() => {
        setCloseBanner(true)
      }, 300)
    }
  }, [animateOut])

  if (!showConsent || closeBanner) {
    return null
  }

  return (
    <div
      className={[classes.privacyBanner, animateOut && classes.animateOut]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={classes.contentWrap}>
        <p className={classes.content}>
          Kami menggunakan cookie untuk menganalisis penggunaan situs dan memastikan pengalaman
          terbaik, serta menampilkan konten yang relevan. Baca{' '}
          <Link className={classes.privacyLink} href="/kebijakan-privasi" prefetch={false}>
            kebijakan privasi
          </Link>{' '}
          kami untuk informasi lebih lanjut.
        </p>
        <div className={classes.buttonWrap}>
          <Button
            appearance="secondary"
            className={classes.rejectButton}
            label="Tolak"
            onClick={() => {
              updateCookieConsent(false)
              handleCloseBanner()
            }}
          />
          <Button
            appearance="primary"
            className={classes.acceptButton}
            label="Terima"
            onClick={() => {
              updateCookieConsent(true)
              handleCloseBanner()
            }}
          />
        </div>
      </div>
    </div>
  )
}
