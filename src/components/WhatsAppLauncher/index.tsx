import React from 'react'

import { WhatsAppCTA } from '@components/WhatsAppCTA/index'
import type { WaSettings } from '@root/utilities/whatsapp'

type Props = {
  settings: WaSettings
  business?: string
}

/**
 * Site-wide WhatsApp launcher: a floating action button plus a mobile sticky
 * bar, both driven by the `whatsapp-marketing` global. Renders nothing when the
 * feature is disabled or no number is configured.
 */
export const WhatsAppLauncher: React.FC<Props> = ({ settings, business }) => {
  if (!settings?.whatsappNumber) return null

  const { enableFloating, enableStickyBar, floatingLabel, floatingPosition, stickyBarLabel } =
    settings as WaSettings & {
      enableFloating?: boolean
      enableStickyBar?: boolean
      floatingLabel?: string
      floatingPosition?: 'left' | 'right'
      stickyBarLabel?: string
    }

  if (!enableFloating && !enableStickyBar) return null

  return (
    <>
      {enableStickyBar && (
        <WhatsAppCTA
          context="contact"
          label={stickyBarLabel || 'Konsultasi Gratis via WhatsApp'}
          settings={settings}
          business={business}
          variant="sticky"
        />
      )}
      {enableFloating && (
        <WhatsAppCTA
          context="floating"
          label={floatingLabel || 'Chat via WhatsApp'}
          position={floatingPosition || 'right'}
          settings={settings}
          business={business}
          variant="floating"
        />
      )}
    </>
  )
}
