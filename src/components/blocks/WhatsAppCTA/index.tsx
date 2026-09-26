import type { Page } from '@root/payload-types'

import { BackgroundGrid } from '@components/BackgroundGrid/index'
import { BlockWrapper } from '@components/BlockWrapper/index'
import { Gutter } from '@components/Gutter/index'
import { WhatsAppCTA as WhatsAppCTAClient } from '@components/WhatsAppCTA/index'
import { useWhatsAppSettings } from '@root/providers/WhatsApp/index'
import type { WaContext } from '@root/utilities/whatsapp'
import React from 'react'

import classes from './index.module.scss'

export type WhatsAppCTABlockProps = {
  hideBackground?: boolean
} & Extract<Page['layout'][0], { blockType: 'whatsappCta' }>

export const WhatsAppCTABlock: React.FC<WhatsAppCTABlockProps> = ({ hideBackground, whatsappFields }) => {
  const { align, body, context, heading, label, variant } = whatsappFields || {}
  const { settings, business } = useWhatsAppSettings()

  return (
    <BlockWrapper hideBackground={hideBackground} settings={whatsappFields?.settings}>
      <BackgroundGrid zIndex={0} />
      <Gutter>
        <div
          className={[classes.wrapper, align === 'center' && classes.center]
            .filter(Boolean)
            .join(' ')}
        >
          {heading && <h2 className={classes.heading}>{heading}</h2>}
          {body && <p className={classes.body}>{body}</p>}
          <WhatsAppCTAClient
            business={business}
            context={(context as WaContext) || 'general'}
            label={label || undefined}
            settings={settings}
            track={{ source: 'block' }}
            variant={(variant as 'button') || 'button'}
          />
        </div>
      </Gutter>
    </BlockWrapper>
  )
}
