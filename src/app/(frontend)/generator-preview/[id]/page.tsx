import React from 'react'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { BauhausBlocks } from '@components/nb/blocks/index'
import { BauhausPost } from '@components/nb/Post'
import { buildTokens, interpolate, deepReplace } from '@root/generator/tokens'
import type { GeneratorTemplateLite, GeneratorRow } from '@root/generator/types'

export const dynamic = 'force-dynamic'

const DUMMY_SAMPLE_ROW: GeneratorRow = {
  key: 'surabaya',
  city: 'Surabaya',
  primaryKeyword: 'Jasa Cetak Buku Murah Berkualitas',
  secondaryKeywords: 'percetakan buku surabaya, cetak novel cepat, vendor cetak buku',
  tokens: [
    { name: 'city', values: ['Surabaya'] },
    { name: 'kota', values: ['Surabaya'] },
    { name: 'daerah', values: ['Surabaya'] },
    { name: 'province', values: ['Jawa Timur'] },
    { name: 'layanan', values: ['Cetak Buku & Novel'] },
    { name: 'phone', values: ['0857-9952-0350'] },
  ],
}

export default async function GeneratorTemplatePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { isEnabled: isDraft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  let templateDoc: any = null
  try {
    templateDoc = await payload.findByID({
      collection: 'generator-templates',
      id,
      draft: isDraft,
      overrideAccess: true,
    })
  } catch {
    // try finding the first template if id is 'preview'
    if (id === 'preview') {
      const all = await payload.find({
        collection: 'generator-templates',
        limit: 1,
        overrideAccess: true,
      })
      templateDoc = all.docs[0]
    }
  }

  if (!templateDoc) {
    notFound()
  }

  const tokens = buildTokens(templateDoc as GeneratorTemplateLite, DUMMY_SAMPLE_ROW)

  const isPost = templateDoc.entityType === 'post'
  const title = interpolate(templateDoc.titlePattern || templateDoc.name || 'Preview Template', tokens)

  if (isPost) {
    const rawBlocks = Array.isArray(templateDoc.fieldBlocks) ? templateDoc.fieldBlocks : []
    const resolvedBlocks = deepReplace(rawBlocks, tokens)

    const dummyPost: any = {
      title,
      slug: 'sample-preview',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: resolvedBlocks,
      categories: [
        {
          title: 'Template Preview',
          slug: 'preview',
        },
      ],
      populatedAuthors: [
        {
          name: 'Preview Author',
        },
      ],
      meta: {
        title: interpolate(templateDoc.metaTitlePattern || title, tokens),
        description: interpolate(templateDoc.metaDescPattern || 'Deskripsi preview template', tokens),
      },
    }

    return (
      <div className="min-h-screen bg-canvas">
        <div className="bg-nb-yellow border-b-4 border-ink px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-center text-ink">
          🧪 MODE DRAFT PREVIEW TEMPLATE (Data Sampel: Kota Surabaya)
        </div>
        <BauhausPost post={dummyPost} />
      </div>
    )
  }

  // Page entity
  const rawBlocks = Array.isArray(templateDoc.layout) ? templateDoc.layout : []
  const resolvedBlocks = deepReplace(rawBlocks, tokens)

  return (
    <div className="min-h-screen bg-canvas">
      <div className="bg-nb-yellow border-b-4 border-ink px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-center text-ink">
        🧪 MODE DRAFT PREVIEW TEMPLATE (Data Sampel: Kota Surabaya)
      </div>
      <header className="border-b-4 border-ink bg-paper py-12 px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-block border-2 border-ink bg-nb-blue text-white px-3 py-1 font-mono text-xs font-black uppercase mb-4 shadow-nb-sm">
          Preview Template Halaman
        </div>
        <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-ink max-w-4xl mx-auto">
          {title}
        </h1>
      </header>
      <main>
        {resolvedBlocks.length > 0 ? (
          <BauhausBlocks blocks={resolvedBlocks} />
        ) : (
          <div className="py-24 text-center font-mono text-ink-muted">
            Belum ada block yang ditambahkan ke template ini.
          </div>
        )}
      </main>
    </div>
  )
}
