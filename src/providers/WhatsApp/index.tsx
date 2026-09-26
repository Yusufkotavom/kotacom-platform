'use client'

import React, { createContext, use } from 'react'

import type { WaSettings } from '@root/utilities/whatsapp'

type WhatsAppContextValue = {
  settings: WaSettings
  business: string
}

const WhatsAppContext = createContext<WhatsAppContextValue>({
  settings: null,
  business: 'Kotacom',
})

export const WhatsAppProvider: React.FC<{
  children: React.ReactNode
  settings: WaSettings
  business?: string
}> = ({ children, settings, business }) => (
  <WhatsAppContext value={{ settings, business: business || 'Kotacom' }}>{children}</WhatsAppContext>
)

export const useWhatsAppSettings = (): WhatsAppContextValue => use(WhatsAppContext)
