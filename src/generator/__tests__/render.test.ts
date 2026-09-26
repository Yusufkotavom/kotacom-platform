import assert from 'node:assert/strict'
import { test } from 'node:test'

import { lexicalFromText } from '../lexical'
import { planToPageBlocks, planToPostBlocks } from '../blocks'
import type { ContentPlan } from '../blocks'
import { buildDraft } from '../render'
import { assessDraft } from '../qa'
import type { GeneratorProgramLite, GeneratorRow, GeneratorTemplateLite } from '../types'

const program: GeneratorProgramLite = {
  defaultCategory: 'cat-1',
  defaultAuthors: ['user-1'],
  entityType: 'page',
  id: 'p1',
  outputStatus: 'draft',
}

const template: GeneratorTemplateLite = {
  entityType: 'page',
  h1Pattern: '{{primaryKeyword}} {{city}}',
  id: 't1',
  routeBase: '/percetakan/cetak-buku',
  seoDescriptionPattern: '{{introShort}}',
  seoTitlePattern: '{{primaryKeyword}} {{city}} | Kotacom',
  slugPattern: '{{routeBase}}/{{city}}',
}

const row: GeneratorRow = {
  city: 'Bandung',
  key: 'bandung',
  primaryKeyword: 'Jasa Cetak Buku Bandung',
  secondaryKeywords: ['cetak buku murah'],
}

const plan: ContentPlan = {
  cta: { body: 'Hubungi kami', buttonLabel: 'Konsultasi', heading: 'Siap cetak buku?' },
  faq: [{ a: 'Ya, bisa.', q: 'Apakah bisa satuan?' }],
  intro: 'Kotacom melayani cetak buku di Bandung.',
  metaDescription: 'a'.repeat(140),
  metaTitle: 'Cetak Buku Bandung Cepat & Berkualitas',
  sections: [{ body: 'Isi bagian.', heading: 'Kenapa memilih kami' }],
  steps: [{ body: 'Kirim naskah.', title: 'Konsultasi' }],
  title: 'Jasa Cetak Buku Bandung',
}

test('lexicalFromText builds paragraphs, headings and lists', () => {
  const value = lexicalFromText('Paragraf\n\n## Sub\n\n- satu\n- dua') as { root: { children: { type: string }[] } }
  const types = value.root.children.map((c) => c.type)
  assert.deepEqual(types, ['paragraph', 'heading', 'list'])
})

test('planToPostBlocks emits blogContent blocks', () => {
  const blocks = planToPostBlocks(plan)
  assert.ok(blocks.length >= 1)
  assert.ok(blocks.every((b) => b.blockType === 'blogContent'))
})

test('planToPageBlocks emits native page blocks', () => {
  const types = planToPageBlocks(plan).map((b) => b.blockType as string)
  assert.ok(types.includes('content'))
  assert.ok(types.includes('steps'))
})

test('buildDraft produces a valid page draft with normalized meta', () => {
  const draft = buildDraft({ entityType: 'page', plan, program, row, template })
  assert.equal(draft.entityType, 'page')
  assert.equal(draft.slug, 'percetakan/cetak-buku/bandung')
  assert.equal(draft.title, 'Jasa Cetak Buku Bandung')
  assert.ok((draft.meta.title || '').length >= 30)
  assert.ok((draft.meta.description || '').length >= 120)
  assert.ok(draft.entityType === 'page' && draft.layout.length > 0)
})

test('buildDraft produces a valid post draft with relations', () => {
  const postTemplate = { ...template, entityType: 'post' as const, slugPattern: '{{primaryKeyword}}' }
  const draft = buildDraft({
    entityType: 'post',
    plan,
    program: { ...program, entityType: 'post' },
    row,
    template: postTemplate,
  })
  assert.equal(draft.entityType, 'post')
  assert.equal(draft.slug, 'jasa-cetak-buku-bandung')
  if (draft.entityType === 'post') {
    assert.equal(draft.category, 'cat-1')
    assert.deepEqual(draft.authors, ['user-1'])
    assert.ok(draft.content.length > 0)
  }
})

test('buildDraft without a plan is a valid (empty-layout) draft', () => {
  const draft = buildDraft({ entityType: 'page', plan: null, program, row, template })
  assert.equal(draft.entityType, 'page')
  assert.ok(draft.title.length > 0)
})

test('assessDraft flags a duplicate as blocked', () => {
  const draft = buildDraft({ entityType: 'page', plan, program, row, template })
  const result = assessDraft({
    draft,
    existing: [{ id: 9, slug: draft.slug, generator: { keywordKey: 'k', programId: 'p1', rowKey: 'bandung' } }],
  })
  assert.equal(result.severity, 'blocked')
  assert.ok(result.issues.some((i) => i.code === 'duplicate-slug'))
})

test('assessDraft returns ready for a complete unique draft', () => {
  const draft = buildDraft({ entityType: 'page', plan, program, row, template })
  const result = assessDraft({ draft, existing: [] })
  assert.equal(result.severity, 'ready')
})
