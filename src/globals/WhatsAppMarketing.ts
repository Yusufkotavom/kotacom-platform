import type { GlobalConfig } from 'payload'

import { revalidatePath } from 'next/cache'

import { isAdmin } from '../access/isAdmin'

/**
 * Controls every WhatsApp marketing touchpoint. Message templates are keyed by
 * context so each CTA can send a message tailored to what the visitor is
 * looking at, and the source URL of the page is appended automatically.
 */
export const WhatsAppMarketing: GlobalConfig = {
  slug: 'whatsapp-marketing',
  label: 'WhatsApp Marketing',
  access: {
    read: () => true,
    update: isAdmin,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Floating & Sticky',
          fields: [
            { name: 'enableFloating', type: 'checkbox', defaultValue: true },
            {
              name: 'floatingLabel',
              type: 'text',
              defaultValue: 'Chat via WhatsApp',
            },
            {
              name: 'floatingGreeting',
              type: 'textarea',
              defaultValue:
                'Halo! Ada yang bisa kami bantu? Tim Kotacom siap membantu kebutuhan IT & percetakan Anda.',
            },
            {
              name: 'floatingPosition',
              type: 'select',
              defaultValue: 'right',
              options: [
                { label: 'Kanan bawah', value: 'right' },
                { label: 'Kiri bawah', value: 'left' },
              ],
            },
            {
              name: 'enableStickyBar',
              type: 'checkbox',
              defaultValue: true,
              admin: { description: 'Bar tipis di bawah layar (khusus mobile).' },
            },
            {
              name: 'stickyBarLabel',
              type: 'text',
              defaultValue: 'Konsultasi Gratis via WhatsApp',
            },
          ],
        },
        {
          label: 'Messages',
          fields: [
            {
              name: 'defaultButtonLabel',
              type: 'text',
              defaultValue: 'Chat via WhatsApp',
            },
            {
              name: 'appendSourceUrl',
              type: 'checkbox',
              defaultValue: true,
              admin: { description: 'Setiap pesan otomatis menyertakan URL halaman sumber.' },
            },
            { name: 'includePageTitle', type: 'checkbox', defaultValue: true },
            {
              name: 'sourceLabel',
              type: 'text',
              defaultValue: 'Sumber',
            },
            {
              name: 'templates',
              type: 'array',
              labels: { singular: 'Template', plural: 'Templates' },
              admin: {
                description:
                  'Pesan per konteks. Placeholder yang didukung: {page}, {title}, {business}.',
              },
              fields: [
                {
                  name: 'context',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Umum (general)', value: 'general' },
                    { label: 'Beranda (home)', value: 'home' },
                    { label: 'Detail Layanan/Produk', value: 'service' },
                    { label: 'Produk', value: 'product' },
                    { label: 'Studi Kasus', value: 'case-study' },
                    { label: 'Artikel / Blog', value: 'post' },
                    { label: 'Harga / Paket', value: 'pricing' },
                    { label: 'Kontak', value: 'contact' },
                    { label: 'Terima kasih', value: 'thanks' },
                    { label: 'Tombol Floating', value: 'floating' },
                  ],
                },
                { name: 'label', type: 'text' },
                { name: 'message', type: 'textarea', required: true },
              ],
            },
          ],
        },
        {
          label: 'Tracking',
          fields: [
            { name: 'enableUtm', type: 'checkbox', defaultValue: true },
            { name: 'utmSource', type: 'text', defaultValue: 'whatsapp' },
            { name: 'utmMedium', type: 'text', defaultValue: 'cta' },
            { name: 'utmCampaign', type: 'text', defaultValue: 'kotacom-site' },
            {
              name: 'enableClickTracking',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Kirim event ke GA4 (gtag/dataLayer) setiap tombol WhatsApp diklik.',
              },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [() => revalidatePath('/', 'layout')],
  },
}
