/**
 * Standard generator CLI — operate any program without writing a new script.
 *
 *   ./node_modules/.bin/tsx scripts/generator.ts run   <program> [--mode dry|generate|off] [--max N]
 *   ./node_modules/.bin/tsx scripts/generator.ts list  <program>
 *   ./node_modules/.bin/tsx scripts/generator.ts purge <program> [--confirm] [--type page|post]
 *
 * <program> is a program NAME (exact) or its id. Purge defaults to a dry run;
 * pass --confirm to actually delete. Selection is by lineage, so hand-authored
 * docs are never touched.
 */
import 'dotenv/config'
import { config as loadEnv } from 'dotenv'
import { getPayload } from 'payload'

import configPromise from '../src/payload.config'
import { listGenerated, purgeProgram, runProgram } from '../src/generator/toolkit'

loadEnv({ path: '.env.local', override: true })

/* eslint-disable @typescript-eslint/no-explicit-any */
const argv = process.argv.slice(2)
const cmd = argv[0]
const target = argv[1]

const flag = (name: string): string | undefined => {
  const i = argv.indexOf(`--${name}`)
  return i !== -1 ? argv[i + 1] : undefined
}
const has = (name: string): boolean => argv.includes(`--${name}`)

const usage = (): never => {
  console.log(
    [
      'Usage:',
      '  generator.ts run   <program> [--mode dry|generate|off] [--max N]',
      '  generator.ts list  <program>',
      '  generator.ts purge <program> [--confirm] [--type page|post]',
      '',
      '<program> = program name (exact) or id.',
    ].join('\n'),
  )
  process.exit(1)
}

/** Resolve a program by id first, then by exact name. */
const resolveProgramId = async (payload: any, ref: string): Promise<number | string> => {
  try {
    const byId = await payload.findByID({ collection: 'generator-programs', depth: 0, id: ref, overrideAccess: true })
    if (byId?.id) return byId.id
  } catch {
    /* not an id — fall through to name lookup */
  }
  const found = await payload.find({
    collection: 'generator-programs',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { name: { equals: ref } },
  })
  if (!found.docs[0]) throw new Error(`Program tidak ditemukan: "${ref}"`)
  return found.docs[0].id
}

const main = async () => {
  if (!cmd || !target) usage()

  const payload = await getPayload({ config: configPromise })
  const programId = await resolveProgramId(payload, target)

  if (cmd === 'run') {
    const mode = (flag('mode') as 'dry' | 'generate' | 'off' | undefined) ?? 'generate'
    const max = flag('max') ? Number(flag('max')) : undefined
    const result = await runProgram(payload, { maxRows: max, mode, programId })
    console.log('totals:', JSON.stringify(result.totals))
  } else if (cmd === 'list') {
    const pages = await listGenerated(payload, { programId })
    console.log(`${pages.length} dokumen:`)
    for (const p of pages) console.log(`  /${p.slug}  —  ${p.title}  [${p.status}]`)
  } else if (cmd === 'purge') {
    const entityType = flag('type') as 'page' | 'post' | undefined
    const dryRun = !has('confirm')
    const res = await purgeProgram(payload, { dryRun, entityType, programId })
    console.log(
      `${dryRun ? 'DRY-RUN' : 'DELETED'} — matched ${res.totalMatched}, deleted ${res.totalDeleted}`,
    )
    for (const r of res.results) console.log(`  ${r.collection}: matched ${r.matched}, deleted ${r.deleted}`)
    if (dryRun && res.totalMatched > 0) console.log('Tambahkan --confirm untuk benar-benar menghapus.')
  } else {
    usage()
  }

  process.exit(0)
}

main().catch((e) => {
  console.error('generator cli error:', (e as Error).message)
  process.exit(1)
})
