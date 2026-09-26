import assert from 'node:assert/strict'
import { test } from 'node:test'

import { extractAiPrompts, resolveShortcodes } from '../ai'
import { extractJson, normalizePlan } from '../plan'

test('extractAiPrompts finds shortcodes in nested objects', () => {
  const prompts = extractAiPrompts({ a: '[aigen:tulis intro]', b: { c: 'x [aigen:buat faq] y' } })
  assert.deepEqual(prompts.sort(), ['buat faq', 'tulis intro'])
})

test('resolveShortcodes never throws and returns a string', async () => {
  // Gateway may be up or down in a unit context — in BOTH cases the shortcode
  // is replaced by a string and nothing is thrown.
  const { draft } = await resolveShortcodes({ x: '[aigen:halo]' })
  assert.equal(typeof (draft as { x: unknown }).x, 'string')
  assert.ok(((draft as { x: string }).x || '').length > 0)
})

test('extractJson parses fenced and bare JSON', () => {
  assert.deepEqual(extractJson('```json\n{"a":1}\n```'), { a: 1 })
  assert.deepEqual(extractJson('bla {"a":2} bla'), { a: 2 })
  assert.equal(extractJson('no json here'), null)
})

test('extractJson repairs bare newlines inside string values', () => {
  const raw = '{"heading":"H","body":"baris satu\nbaris dua"}'
  const parsed = extractJson<{ body: string }>(raw)
  assert.ok(parsed)
  assert.equal(parsed?.body, 'baris satu\nbaris dua')
})

test('normalizePlan coerces partial model JSON safely', () => {
  const plan = normalizePlan({ sections: [{ body: 'b', heading: 'h' }], title: '  T  ' })
  assert.equal(plan.title, 'T')
  assert.equal(plan.sections?.[0].heading, 'h')
  assert.deepEqual(plan.faq, [])
  assert.deepEqual(plan.cards, [])
})
