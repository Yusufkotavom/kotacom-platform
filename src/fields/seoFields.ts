import type { Field } from 'payload'

/**
 * SEO sidebar group — the same shape the Payload SEO plugin generates
 * (`meta.title`, `meta.description`, `meta.image`), declared explicitly so a
 * collection or global can opt in with one line: `fields: [..., seoFields()]`.
 *
 * Kept flat (no plugin dependency) so it works for globals too.
 */
export const seoFields = (
  label = 'SEO',
): Field => ({
  name: 'meta',
  type: 'group',
  label,
  admin: {
    position: 'sidebar',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Judul SEO',
      maxLength: 70,
      admin: {
        description: 'Judul untuk hasil pencarian. Kosongkan untuk memakai judul halaman.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Deskripsi SEO',
      maxLength: 200,
      admin: {
        description: 'Deskripsi meta (~120–155 karakter). Kosongkan untuk memakai ringkasan.',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Gambar sosial (OG)',
      admin: {
        description: 'Gambar 1200×630 untuk dibagikan di sosial media.',
      },
    },
  ],
})
