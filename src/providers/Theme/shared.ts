import type { Theme } from './types'

export const themeLocalStorageKey = 'payload-theme'

// Kotacom is a dark-first site (AMOLED base #000). System preference no longer
// flips the theme; only an explicit user choice does.
export const defaultTheme: Theme = 'dark'

export const resolveInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return defaultTheme
  try {
    const saved = window.localStorage.getItem(themeLocalStorageKey)
    return saved === 'light' || saved === 'dark' ? saved : defaultTheme
  } catch {
    return defaultTheme
  }
}

// Inline pre-paint script: keeps SSR and client consistent and avoids the
// `html { opacity: 0 }` flash that the theme effect would otherwise cause.
export const themeInitScript = `(function(){try{var k='${themeLocalStorageKey}';var t=localStorage.getItem(k);if(t!=='light'&&t!=='dark'){t='${defaultTheme}';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','${defaultTheme}');}})();`

