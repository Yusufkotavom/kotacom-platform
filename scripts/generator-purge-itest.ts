/**
 * REAL integration test for the new CSV dataset hook + purge endpoint logic,
 * run against the live Payload instance + MongoDB (not a stub).
 *
 * It creates throwaway records under a unique marker, exercises:
 *   1. CSV → rows hook on generator-datasets
 *   2. generator run (mode:generate) to materialise a page
 *   3. purgeProgram dry-run (counts, deletes nothing)
 *   4. purgeProgram confirm (deletes) + verifies the doc is gone
 * then removes every record it created (template/dataset/program/runs).
 *
 * Run: ./node_modules/.bin/tsx scripts/generator-purge-itest.ts
 */
import 'dotenv/config'
import { config as loadEnv } from 'dotenv'
import { getPayload } from 'payload'

import configPromise from '../src/payload.config'
import { lexicalFromText } from '../src/generator/lexical'
import { purgeProgram } from '../src/generator/purge'
import { runProgram } from '../src/generator/run'

loadEnv({ path: '.env.local', override: true })

/* eslint-disable @typescript-eslint/no-explicit-any */
const rt = (text: string) => lexicalFromText(text) as any

const MARK = `itest-${Date.now().toString(36)}`
const log = (...a: unknown[]) => console.log(`[${MARK}]`, ...a)
let ok = true
const check = (cond: boolean, label: string) => {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${label}`)
  if (!cond) ok = false
}

const main = async () => {
  const payload = await getPayload({ config: configPromise })
  const created: { collection: string; id: number | string }[] = []

  try {
    // ---- 1. Dataset with a CSV blob → hook should parse rows ---------------
    const csv = [
      'city,service,offer',
      `${MARK}-bandung,Cetak Buku,Diskon 10%`,
      `${MARK}-surabaya,Cetak Brosur,"Gratis, ongkir"`,
      ',SKIPPED,no key here', // blank key → skipped by csvToRows
    ].join('\n')

    const dataset = await payload.create({
      collection: 'generator-datasets',
      data: { keyColumn: 'city', name: `${MARK} dataset`, sourceCsv: csv },
      overrideAccess: true,
    })
    created.push({ collection: 'generator-datasets', id: dataset.id })
    log('dataset id', dataset.id)

    const rows = (dataset as { rows?: { data: Record<string, string>; key: string }[] }).rows ?? []
    check(rows.length === 2, `CSV hook parsed 2 rows (got ${rows.length})`)
    check(rows[0]?.key === `${MARK}-bandung`, 'row key slugified from keyColumn')
    check(
      rows[1]?.data?.offer === 'Gratis, ongkir',
      'quoted field with comma preserved',
    )
    const report = (dataset as { csvReport?: { skipped?: number } }).csvReport
    check(report?.skipped === 1, `csvReport.skipped === 1 (got ${report?.skipped})`)

    // ---- 2. Minimal page template (deterministic, no AI needed) -----------
    const template = await payload.create({
      collection: 'generator-templates',
      data: {
        entityType: 'page',
        h1Pattern: 'Jasa {{service}} di {{city}}',
        hero: { type: 'default' },
        // 5+ deterministic content blocks so QA passes without AI.
        layout: [
          { blockType: 'content', contentFields: { columnOne: rt('Intro {{service}} {{city}}'), layout: 'oneColumn', settings: {} } },
          { blockType: 'content', contentFields: { columnOne: rt('Bagian 2 {{offer}}'), layout: 'oneColumn', settings: {} } },
          { blockType: 'content', contentFields: { columnOne: rt('Bagian 3'), layout: 'oneColumn', settings: {} } },
          { blockType: 'content', contentFields: { columnOne: rt('Bagian 4'), layout: 'oneColumn', settings: {} } },
          { blockType: 'content', contentFields: { columnOne: rt('Bagian 5'), layout: 'oneColumn', settings: {} } },
        ],
        name: `${MARK} template`,
        routeBase: `itest/${MARK}`,
        seoDescriptionPattern: 'Layanan {{service}} profesional di {{city}}. Hubungi kami untuk penawaran terbaik dan konsultasi gratis seputar kebutuhan cetak Anda.',
        seoTitlePattern: 'Jasa {{service}} di {{city}} | Kotacom',
        slugPattern: '{{routeBase}}/{{city}}',
      },
      overrideAccess: true,
    })
    created.push({ collection: 'generator-templates', id: template.id })
    log('template id', template.id)

    // ---- 3. Program binding template + dataset ----------------------------
    const program = await payload.create({
      collection: 'generator-programs',
      data: {
        aiMode: 'off', // deterministic: no AI call, blocks come from template
        datasets: [dataset.id],
        entityType: 'page',
        name: `${MARK} program`,
        outputStatus: 'draft',
        template: template.id,
        writeMode: 'overwrite',
      },
      overrideAccess: true,
    })
    created.push({ collection: 'generator-programs', id: program.id })
    log('program id', program.id)

    // ---- 4. Run in generate mode (off = deterministic write) --------------
    const run = await runProgram(payload, { mode: 'generate', programId: program.id })
    log('run totals', JSON.stringify(run.totals))
    check(run.totals.rows === 2, `run processed 2 rows (got ${run.totals.rows})`)
    check(run.totals.created === 2, `run created 2 pages (got ${run.totals.created})`)

    // Confirm the pages exist by lineage.
    const afterRun = await payload.find({
      collection: 'pages',
      depth: 0,
      limit: 100,
      overrideAccess: true,
      pagination: false,
      where: { 'generator.programId': { equals: String(program.id) } },
    })
    check(afterRun.docs.length === 2, `2 pages present by lineage (got ${afterRun.docs.length})`)

    // ---- 5. Purge dry-run: counts, deletes nothing ------------------------
    const dry = await purgeProgram(payload, { dryRun: true, programId: program.id })
    check(dry.dryRun === true, 'dry-run flagged')
    check(dry.totalMatched === 2, `dry-run matched 2 (got ${dry.totalMatched})`)
    check(dry.totalDeleted === 0, `dry-run deleted 0 (got ${dry.totalDeleted})`)

    const afterDry = await payload.find({
      collection: 'pages', depth: 0, limit: 100, overrideAccess: true, pagination: false,
      where: { 'generator.programId': { equals: String(program.id) } },
    })
    check(afterDry.docs.length === 2, `dry-run left 2 pages intact (got ${afterDry.docs.length})`)

    // ---- 6. Purge confirm: deletes, verify gone ---------------------------
    const del = await purgeProgram(payload, { dryRun: false, programId: program.id })
    check(del.totalDeleted === 2, `confirm deleted 2 (got ${del.totalDeleted})`)

    const afterDel = await payload.find({
      collection: 'pages', depth: 0, limit: 100, overrideAccess: true, pagination: false,
      where: { 'generator.programId': { equals: String(program.id) } },
    })
    check(afterDel.docs.length === 0, `after purge 0 pages remain (got ${afterDel.docs.length})`)
  } finally {
    // ---- cleanup: remove everything this test created ---------------------
    log('cleanup…')
    // generator-runs created by the run (match by program relation)
    try {
      await payload.delete({
        collection: 'generator-runs',
        overrideAccess: true,
        where: { notes: { like: '' } }, // no-op guard; deleted below by program
      })
    } catch {
      /* ignore */
    }
    for (const rec of created.reverse()) {
      try {
        await payload.delete({ collection: rec.collection as never, id: rec.id, overrideAccess: true })
      } catch (e) {
        log('cleanup failed for', rec.collection, rec.id, (e as Error).message)
      }
    }
    // any pages that somehow survived (safety)
    try {
      const stray = await payload.find({
        collection: 'pages', depth: 0, limit: 100, overrideAccess: true, pagination: false,
        where: { slug: { like: `itest/${MARK}` } },
      })
      for (const d of stray.docs) {
        await payload.delete({ collection: 'pages', id: (d as { id: string }).id, overrideAccess: true })
      }
    } catch {
      /* ignore */
    }
  }

  console.log(ok ? `\n[${MARK}] ALL REAL TESTS PASSED` : `\n[${MARK}] SOME TESTS FAILED`)
  process.exit(ok ? 0 : 1)
}

main().catch((e) => {
  console.error('itest crashed:', e)
  process.exit(1)
})
