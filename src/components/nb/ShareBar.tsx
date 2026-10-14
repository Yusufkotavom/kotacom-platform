'use client'

import * as React from 'react'
import { Check, Copy, MessageCircle, Share2 } from 'lucide-react'

export function ShareBar({
  title,
  url,
  slug,
}: {
  title: string
  url: string
  slug?: string
}) {
  const [copied, setCopied] = React.useState(false)
  const fullUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : `https://kotacom.id/posts/${slug || ''}`

  const handleCopy = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const encodedUrl = encodeURIComponent(fullUrl)
  const encodedTitle = encodeURIComponent(title)
  const waShareUrl = `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`
  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`

  return (
    <div className="my-8 border-4 border-ink bg-nb-yellow p-4 shadow-nb-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-display text-sm font-black uppercase tracking-wider text-ink">
          <Share2 className="h-4 w-4" />
          <span>Bagikan Artikel Ini:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={waShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 border-2 border-ink bg-nb-green px-3 py-1.5 font-display text-xs font-black uppercase text-paper shadow-nb-xs transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp
          </a>
          <a
            href={linkedInShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 border-2 border-ink bg-nb-blue px-3 py-1.5 font-display text-xs font-black uppercase text-paper shadow-nb-xs transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            LinkedIn
          </a>
          <a
            href={twitterShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 border-2 border-ink bg-ink px-3 py-1.5 font-display text-xs font-black uppercase text-paper shadow-nb-xs transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            X / Twitter
          </a>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 border-2 border-ink bg-paper px-3 py-1.5 font-display text-xs font-black uppercase text-ink shadow-nb-xs transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-nb-green" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Salin Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
