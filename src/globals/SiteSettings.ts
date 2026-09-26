import type { GlobalConfig } from 'payload'

import { revalidatePath } from 'next/cache'

import { isAdmin } from '../access/isAdmin'

/**
 * Single source of truth for business identity, contact details and the
 * WhatsApp number used across the entire site. Every WhatsApp link (floating
 * button, sticky bar, inline CTAs, blocks, footer) reads the number from here —
 * never hardcode a phone number anywhere else.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  access: {
    read: () => true,
    update: isAdmin,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identity',
          fields: [
            { name: 'businessName', type: 'text', required: true, defaultValue: 'Kotacom' },
            { name: 'legalName', type: 'text' },
            { name: 'tagline', type: 'text' },
            {
              name: 'description',
              type: 'textarea',
              admin: {
                description:
                  'Dipakai untuk meta description default, Organization schema, dan OG fallback.',
              },
            },
            { name: 'foundedYear', type: 'text', defaultValue: '2008' },
            { name: 'logo', type: 'upload', relationTo: 'media' },
            {
              name: 'defaultOgImage',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Fallback OG/Twitter image (ideal 1200x630).' },
            },
          ],
        },
        {
          label: 'Contact',
          fields: [
            {
              name: 'whatsappNumber',
              type: 'text',
              required: true,
              defaultValue: '6285799520350',
              admin: {
                description:
                  'Format internasional TANPA + / spasi / tanda hubung. Contoh: 6285799520350. Ini SATU-SATUNYA sumber nomor WhatsApp untuk seluruh situs.',
              },
            },
            {
              name: 'whatsappNumberSecondary',
              type: 'text',
              admin: { description: 'Opsional (mis. lini sales/support kedua).' },
            },
            { name: 'phone', type: 'text', admin: { description: 'Nomor telepon tampil (boleh +62 …).' } },
            { name: 'email', type: 'email' },
            { name: 'supportEmail', type: 'email' },
          ],
        },
        {
          label: 'Address',
          fields: [
            { name: 'street', type: 'text' },
            { name: 'city', type: 'text', defaultValue: 'Surabaya' },
            { name: 'region', type: 'text', defaultValue: 'Jawa Timur' },
            { name: 'postalCode', type: 'text' },
            { name: 'country', type: 'text', defaultValue: 'ID' },
            {
              name: 'geo',
              type: 'group',
              fields: [
                { name: 'latitude', type: 'text' },
                { name: 'longitude', type: 'text' },
              ],
            },
            { name: 'openingHours', type: 'text', defaultValue: 'Mo-Sa 08:00-17:00' },
            { name: 'mapsUrl', type: 'text' },
          ],
        },
        {
          label: 'Social & SEO',
          fields: [
            {
              name: 'socials',
              type: 'array',
              fields: [
                {
                  name: 'platform',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Facebook', value: 'facebook' },
                    { label: 'Instagram', value: 'instagram' },
                    { label: 'X / Twitter', value: 'twitter' },
                    { label: 'YouTube', value: 'youtube' },
                    { label: 'LinkedIn', value: 'linkedin' },
                    { label: 'TikTok', value: 'tiktok' },
                    { label: 'Telegram', value: 'telegram' },
                  ],
                },
                { name: 'url', type: 'text', required: true },
              ],
            },
            {
              name: 'twitterHandle',
              type: 'text',
              admin: { description: 'Contoh: @kotacom (dipakai di Twitter card).' },
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
