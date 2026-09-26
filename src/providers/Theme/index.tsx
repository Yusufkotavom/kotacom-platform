'use client'

import canUseDom from '@root/utilities/can-use-dom'
import React, { createContext, use, useCallback, useEffect, useState } from 'react'

import type { Theme, ThemePreferenceContextType } from './types'

import { defaultTheme, resolveInitialTheme, themeLocalStorageKey } from './shared'

const initialContext: ThemePreferenceContextType = {
  setTheme: () => null,
  theme: undefined,
}

const ThemePreferenceContext = createContext(initialContext)

export const ThemePreferenceProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme | undefined>(
    canUseDom ? (document.documentElement.getAttribute('data-theme') as Theme) : undefined,
  )

  const setTheme = useCallback((themeToSet: null | Theme) => {
    const next = themeToSet === null ? defaultTheme : themeToSet
    setThemeState(next)
    try {
      window.localStorage.setItem(themeLocalStorageKey, next)
    } catch {
      // storage can be unavailable (private mode); the attribute still applies
    }
    document.documentElement.setAttribute('data-theme', next)
  }, [])

  useEffect(() => {
    // The inline pre-paint script already set the attribute; this only syncs
    // React state so theme toggles re-render. Dark is the default (AMOLED #000).
    const themeToSet = resolveInitialTheme()
    document.documentElement.setAttribute('data-theme', themeToSet)
    setThemeState(themeToSet)
  }, [])

  return <ThemePreferenceContext value={{ setTheme, theme }}>{children}</ThemePreferenceContext>
}

export const useThemePreference = (): ThemePreferenceContextType => use(ThemePreferenceContext)
