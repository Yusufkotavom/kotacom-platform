import type { Block } from 'payload'

import { blockFields } from '../../fields/blockFields'

export const WhatsAppCTA: Block = {
  slug: 'whatsappCta',
  labels: { singular: 'WhatsApp CTA', plural: 'WhatsApp CTAs' },
  fields: [
    blockFields({
      name: 'whatsappFields',
      fields: [
        {
          name: 'heading',
          type: 'text',
          admin: { description: 'Judul opsional di atas tombol.' },
        },
        {
          name: 'body',
          type: 'textarea',
          admin: { description: 'Deskripsi singkat opsional.' },
        },
        {
          name: 'context',
          type: 'select',
          defaultValue: 'general',
          options: [
            { label: 'Umum (general)', value: 'general' },
            { label: 'Beranda (home)', value: 'home' },
            { label: 'Layanan / Produk', value: 'service' },
            { label: 'Produk', value: 'product' },
            { label: 'Studi Kasus', value: 'case-study' },
            { label: 'Artikel', value: 'post' },
            { label: 'Harga / Paket', value: 'pricing' },
            { label: 'Kontak', value: 'contact' },
          ],
        },
        {
          name: 'variant',
          type: 'select',
          defaultValue: 'button',
          options: [
            { label: 'Tombol', value: 'button' },
            { label: 'Inline', value: 'inline' },
            { label: 'Hero (besar)', value: 'hero' },
            { label: 'Link teks', value: 'link' },
          ],
        },
        { name: 'label', type: 'text', admin: { description: 'Kosongkan untuk label default dari WhatsApp Marketing.' } },
        {
          name: 'align',
          type: 'select',
          defaultValue: 'left',
          options: [
            { label: 'Kiri', value: 'left' },
            { label: 'Tengah', value: 'center' },
          ],
        },
      ],
    }),
  ],
}
