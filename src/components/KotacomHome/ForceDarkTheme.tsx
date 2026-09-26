'use client'

import { useEffect } from 'react'

const STORAGE_KEY = 'payload-theme'

/**
 * Home page Kotacom tampil dark secara default (gaya Vercel/Payload, AMOLED).
 * Kalau user sudah memilih tema secara eksplisit (light/dark), pilihan itu dihormati.
 * Hanya berlaku selama halaman home aktif (unmount = lepas kontrol).
 */
export const ForceDarkTheme: React.FC = () => {
  useEffect(() => {
    const root = document.documentElement

    const apply = () => {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      const target = stored === 'light' ? 'light' : 'dark'
      if (root.getAttribute('data-theme') !== target) {
        root.setAttribute('data-theme', target)
      }
    }

    apply()
    const t1 = window.setTimeout(apply, 60)
    const t2 = window.setTimeout(apply, 350)

    const observer = new MutationObserver(apply)
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] })

    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      observer.disconnect()
    }
  }, [])

  return null
}
