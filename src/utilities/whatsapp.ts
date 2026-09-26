/**
 * WhatsApp link builder — the ONE place every WhatsApp CTA in the site routes
 * through. The number comes from the `site-settings` global; templates and
 * tracking options come from `whatsapp-marketing`. Messages always carry the
 * source URL of the page they were clicked from.
 *
 * Safe to import from both server and client components: it never touches the
 * Payload SDK — callers pass the settings objects in.
 */

export type WaContext =
  | 'general'
  | 'home'
  | 'service'
  | 'product'
  | 'case-study'
  | 'post'
  | 'pricing'
  | 'contact'
  | 'thanks'
  | 'floating'

export type WaTemplate = {
  context?: WaContext | null
  label?: string | null
  message: string
}

export type WaSettings = {
  whatsappNumber?: string | null
  businessName?: string | null
  defaultButtonLabel?: string | null
  appendSourceUrl?: boolean | null
  includePageTitle?: boolean | null
  sourceLabel?: string | null
  templates?: WaTemplate[] | null
  enableUtm?: boolean | null
  utmSource?: string | null
  utmMedium?: string | null
  utmCampaign?: string | null
} | null

export type WaBuildOptions = {
  pageUrl?: string
  pageTitle?: string
  business?: string
  label?: string
}

/** Strip everything but digits — wa.me only accepts an international number. */
export const sanitizeWaNumber = (input?: string | null): string =>
  (input || '').replace(/[^0-9]/g, '')

export const getWaTemplate = (settings: WaSettings, context: WaContext): string => {
  const templates = settings?.templates || []
  const exact = templates.find((t) => t.context === context)
  const general = templates.find((t) => t.context === 'general')
  return (
    exact?.message ||
    general?.message ||
    'Halo {business}, saya ingin bertanya tentang layanan Anda.'
  )
}

export const getWaButtonLabel = (
  settings: WaSettings,
  context: WaContext,
  override?: string,
): string => {
  if (override) return override
  const template = (settings?.templates || []).find((t) => t.context === context)
  return template?.label || settings?.defaultButtonLabel || 'Chat via WhatsApp'
}

const appendUtm = (url: string, settings: WaSettings, context: WaContext): string => {
  if (!settings?.enableUtm) return url
  try {
    const u = new URL(url)
    u.searchParams.set('utm_source', settings.utmSource || 'whatsapp')
    u.searchParams.set('utm_medium', settings.utmMedium || 'cta')
    u.searchParams.set('utm_campaign', settings.utmCampaign || 'kotacom-site')
    u.searchParams.set('utm_content', context)
    return u.toString()
  } catch {
    return url
  }
}

export const buildWaMessage = (
  settings: WaSettings,
  context: WaContext,
  opts: WaBuildOptions = {},
): string => {
  const business = opts.business || 'Kotacom'
  const pageTitle = opts.pageTitle || ''

  let msg = getWaTemplate(settings, context)
  msg = msg
    .replace(/\{business\}/g, business)
    .replace(/\{title\}/g, pageTitle)
    .replace(/\{page\}/g, opts.pageUrl || '')

  const parts: string[] = [msg.trim()]

  if (settings?.includePageTitle && pageTitle && !getWaTemplate(settings, context).includes('{title}')) {
    parts.push(`Topik: ${pageTitle}`)
  }

  if (settings?.appendSourceUrl && opts.pageUrl) {
    const sourceUrl = appendUtm(opts.pageUrl, settings, context)
    parts.push(`${settings?.sourceLabel || 'Sumber'}: ${sourceUrl}`)
  }

  return parts.join('\n\n')
}

export const buildWaLink = (number: string, message: string): string =>
  `https://wa.me/${sanitizeWaNumber(number)}?text=${encodeURIComponent(message)}`

/**
 * The single helper every CTA uses. Returns an href (or '#' when no number is
 * configured). Pass the page's absolute URL + title so the message is unique.
 */
export const buildWaHref = (
  settings: WaSettings,
  context: WaContext,
  opts: WaBuildOptions = {},
): string => {
  const number = settings?.whatsappNumber
  if (!number) return '#'
  return buildWaLink(number, buildWaMessage(settings, context, opts))
}

export const waLinkAttrs = {
  target: '_blank',
  rel: 'noopener noreferrer',
} as const

/** Absolute URL for a path, using the public site URL (server-safe). */
export const absoluteUrl = (path: string): string => {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://kotacom.id'
  try {
    return new URL(path, base).toString()
  } catch {
    return base
  }
}

/** Fire a GA4/GTM event when a WhatsApp CTA is clicked (client-only, no-op safe). */
export const trackWhatsAppClick = (
  context: WaContext,
  extra: Record<string, unknown> = {},
): void => {
  if (typeof window === 'undefined') return
  const payload = {
    event: 'whatsapp_click',
    wa_context: context,
    page_path: window.location.pathname,
    ...extra,
  }
  type WaWindow = Window & {
    gtag?: (...args: unknown[]) => void
    dataLayer?: Record<string, unknown>[]
  }
  const w = window as WaWindow
  try {
    if (typeof w.gtag === 'function') {
      w.gtag('event', 'whatsapp_click', payload)
    }
    if (Array.isArray(w.dataLayer)) {
      w.dataLayer.push(payload)
    }
  } catch {
    // never let analytics break navigation
  }
}
