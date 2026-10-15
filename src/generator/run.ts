import type { BasePayload } from 'payload'

import { aiConfigured, aiInfo, extractAiPrompts, replacePromptsIn } from './ai'
import type { ContentPlan } from './blocks'
import { findDuplicate } from './dedupe'
import { enrichAiBlocks } from './enrich'
import {
  buildInterlinkCatalog,
  selectInterlinks,
  type InterlinkResult,
  type InterlinkTarget,
} from './interlink'
import { buildStructurePrompt, extractJson, generateLightPlan, generatePlan, normalizePlan } from './plan'
import { assessDraft } from './qa'
import { buildDraft } from './render'
import { buildGeneratorSlug } from './slug'
import { buildTokens } from './tokens'
import type {
  EntityType,
  ExistingDoc,
  GeneratedDraft,
  GeneratorProgramLite,
  GeneratorRow,
  GeneratorTemplateLite,
  QaResult,
} from './types'

export type RunOptions = {
  /** Batas paralel worker (1-8). Default dari program atau 4. */
  concurrency?: number
  /** Hard cap on rows processed in this call. */
  maxRows?: number
  /** Force a mode regardless of the program's own setting. */
  mode?: 'dry' | 'generate' | 'off'
  programId: number | string
  /** Scope eksekusi: 'all' (semua), 'new_only' (hanya belum ada doc), 'failed_only' (ulangi yang gagal). */
  scope?: 'all' | 'failed_only' | 'new_only'
  /** Override program writeMode ('create' = skip existing, 'overwrite' = update existing). */
  writeMode?: 'create' | 'overwrite'
}

export type RowReport = {
  action: 'created' | 'dry-run' | 'skipped' | 'updated'
  docId?: number | string
  enriched?: number
  entityType: EntityType
  issues: QaResult['issues']
  key: string
  severity: QaResult['severity']
  slug: string
  title: string
}

export type RunResult = {
  ai: { configured: boolean; model: string }
  durationMs: number
  entityType: EntityType
  mode: string
  programId: number | string
  report: RowReport[]
  runId: string
  totals: {
    blocked: number
    concurrency: number
    created: number
    ready: number
    rows: number
    scope: string
    skipped: number
    totalDatasetRows: number
    updated: number
    warning: number
  }
  writeMode: string
}

const slugOf = (doc: AnyObj): string => String((doc as Record<string, unknown>)?.slug ?? '')

type AnyObj = Record<string, unknown>

const asRows = (datasetDocs: AnyObj[]): GeneratorRow[] =>
  datasetDocs.flatMap((dataset) =>
    ((dataset.rows as AnyObj[]) ?? []).map((row) => {
      const data = (row.data ?? {}) as AnyObj
      return {
        ...(data as object),
        key: String(row.key ?? (data.key as string) ?? ''),
        primaryKeyword: String(
          (data.primaryKeyword as string) ?? (data.primary_keyword as string) ?? row.key ?? '',
        ),
        tokens: undefined,
      } as GeneratorRow
    }),
  )

const loadTemplate = (doc: AnyObj): GeneratorTemplateLite => ({
  entityType: doc.entityType as EntityType,
  h1Pattern: (doc.h1Pattern as string) ?? null,
  hero: (doc.hero as AnyObj) ?? null,
  id: doc.id as number | string,
  layout: (doc.layout as AnyObj[]) ?? [],
  routeBase: String(doc.routeBase ?? ''),
  seoDescriptionPattern: (doc.seoDescriptionPattern as string) ?? null,
  seoTitlePattern: (doc.seoTitlePattern as string) ?? null,
  slugPattern: (doc.slugPattern as string) ?? null,
  tokenDefinitions: (doc.tokens as GeneratorTemplateLite['tokenDefinitions']) ?? null,
})

const relIds = (value: unknown): number | string | undefined => {
  if (value == null) return undefined
  if (typeof value === 'object') return (value as AnyObj).id as number | string
  return value as number | string
}

const loadProgram = (doc: AnyObj): GeneratorProgramLite => ({
  aiMode: (doc.aiMode as GeneratorProgramLite['aiMode']) ?? 'off',
  concurrency: typeof doc.concurrency === 'number' ? doc.concurrency : null,
  defaultAuthors: ((doc.defaultAuthors as unknown[]) ?? []).map(relIds).filter(Boolean) as (
    | number
    | string
  )[],
  defaultCategory: relIds(doc.defaultCategory),
  defaultImage: relIds(doc.defaultImage),
  enableInterlink: doc.enableInterlink !== false,
  entityType: doc.entityType as EntityType,
  id: doc.id as number | string,
  interlinkCount: typeof doc.interlinkCount === 'number' ? doc.interlinkCount : 6,
  interlinkHeading: (doc.interlinkHeading as string) ?? 'Layanan Terkait di Kota Lain',
  outputStatus: (doc.outputStatus as 'draft' | 'published') ?? 'draft',
  routeBase: (doc.routeBase as string) ?? null,
  runScope: (doc.runScope as GeneratorProgramLite['runScope']) ?? 'all',
  writeMode: (doc.writeMode as 'create' | 'overwrite') ?? 'overwrite',
})

/** Resolve a prompt against the AI, returning text; '' when AI fails. */
const fillPrompt = async (prompt: string): Promise<string> => {
  try {
    const { aiChat } = await import('./ai')
    return await aiChat(prompt, { maxTokens: 1600 })
  } catch {
    return ''
  }
}

/**
 * Fetch existing documents that could collide with generated output and map
 * them to the shape the dedupe/QA gate understands (retains generator lineage).
 */
const loadExisting = async (
  payload: BasePayload,
  entityType: EntityType,
  programId: number | string,
): Promise<ExistingDoc[]> => {
  const collection = entityType === 'post' ? 'posts' : 'pages'
  const res = await payload.find({
    collection,
    depth: 0,
    limit: 5000,
    overrideAccess: true,
    pagination: false,
    where: { 'generator.programId': { equals: String(programId) } },
  })
  return (res.docs as unknown as AnyObj[]).map((doc) => ({
    generator: (doc.generator as ExistingDoc['generator']) ?? null,
    id: doc.id as number | string,
    slug: slugOf(doc),
  }))
}

/**
 * Build the effective block stack for a row, then (in generate mode) fill any
 * `aiContent` blocks from the local AI gateway.
 */
const buildBlocks = async (input: {
  draft: GeneratedDraft
  entityType: EntityType
  mode: string
  row: GeneratorRow
  template: GeneratorTemplateLite
}): Promise<{ draft: GeneratedDraft; enriched: number }> => {
  const { entityType, mode, row, template } = input
  const draft = input.draft

  if (entityType === 'post') {
    const post = draft as Extract<GeneratedDraft, { entityType: 'post' }>
    const content = [...post.content]
    if (mode === 'generate') {
      const { enriched, layout } = await enrichAiBlocks({
        entityType,
        layout: content,
        row,
        template,
        title: post.title,
      })
      return { draft: { ...post, content: layout }, enriched }
    }
    return { draft: { ...post, content }, enriched: 0 }
  }

  const page = draft as Extract<GeneratedDraft, { entityType: 'page' }>
  const layout = [...page.layout]
  if (mode === 'generate') {
    const { enriched, layout: filled } = await enrichAiBlocks({
      entityType,
      layout,
      row,
      template,
      title: page.title,
    })
    return { draft: { ...page, layout: filled }, enriched }
  }
  return { draft: { ...page, layout }, enriched: 0 }
}

/**
 * Execute a generator program.
 *
 * Mendukung:
 *  - Worker concurrency queue (configurable)
 *  - Arbitrary custom tokens
 *  - Incremental Run / Delta update (new_only, failed_only)
 *  - Safe Interlinking network (mesh ring + cluster)
 */
export const runProgram = async (
  payload: BasePayload,
  options: RunOptions,
): Promise<RunResult> => {
  const started = Date.now()
  const runId = `gen-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

  const programDoc = (await payload.findByID({
    collection: 'generator-programs',
    depth: 1,
    id: options.programId,
    overrideAccess: true,
  })) as unknown as AnyObj

  if (!programDoc) throw new Error(`Program ${options.programId} tidak ditemukan`)

  const program = loadProgram(programDoc)
  const templateDoc = programDoc.template as AnyObj
  const template = loadTemplate(
    (templateDoc && typeof templateDoc === 'object'
      ? templateDoc
      : await payload.findByID({
          collection: 'generator-templates',
          depth: 0,
          id: relIds(templateDoc) as number | string,
          overrideAccess: true,
        })) as unknown as AnyObj,
  )

  const entityType: EntityType = program.entityType
  const mode = options.mode ?? program.aiMode ?? 'off'
  const writeMode = options.writeMode ?? program.writeMode ?? 'overwrite'
  const maxRows = options.maxRows ?? Number(programDoc.maxRows ?? 0)
  const exclude = new Set<string>((programDoc.excludeRowKeys as string[]) ?? [])
  const scope = options.scope ?? program.runScope ?? 'all'

  const datasetIds = ((programDoc.datasets as unknown[]) ?? []).map(relIds).filter(Boolean)
  const datasetDocs = (await Promise.all(
    datasetIds.map((id) =>
      payload.findByID({
        collection: 'generator-datasets',
        depth: 0,
        id: id as number | string,
        overrideAccess: true,
      }),
    ),
  )) as unknown as AnyObj[]

  // Ambil semua baris valid dari dataset
  const allDatasetRows = asRows(datasetDocs).filter((row) => row.key && !exclude.has(row.key))
  const totalDatasetRows = allDatasetRows.length

  const existing = await loadExisting(payload, entityType, program.id)

  // 1. Safe Interlinking Catalog:
  // Bangun katalog interlink dari seluruh baris dataset program agar halaman yang di-generate
  // (termasuk delta) selalu dapat menautkan ke sesama cluster secara konsisten & aman.
  const interlinkTargets: InterlinkTarget[] =
    program.enableInterlink !== false
      ? buildInterlinkCatalog(allDatasetRows, template, program)
      : []

  // 2. Incremental / Delta Run Filtering
  let targetRows = [...allDatasetRows]

  if (scope === 'new_only') {
    const existingKeys = new Set(
      existing.map((e) => e.generator?.rowKey).filter(Boolean) as string[],
    )
    const existingSlugs = new Set(existing.map((e) => e.slug).filter(Boolean))

    targetRows = targetRows.filter((row) => {
      if (row.key && existingKeys.has(row.key)) return false
      const expectedSlug = buildGeneratorSlug({
        city: row.city,
        primaryKeyword: row.primaryKeyword,
        routeBase: program.routeBase || template.routeBase,
        service: row.service,
        slugPattern: template.slugPattern,
      })
      if (existingSlugs.has(expectedSlug)) return false
      return true
    })
  } else if (scope === 'failed_only') {
    try {
      const lastRun = await payload.find({
        collection: 'generator-runs',
        depth: 0,
        limit: 1,
        overrideAccess: true,
        sort: '-createdAt',
        where: { program: { equals: program.id } },
      })
      const lastReport = ((lastRun.docs[0] as unknown as AnyObj)?.report as RowReport[]) ?? []
      const rerunKeys = new Set(
        lastReport
          .filter(
            (r) =>
              r.action === 'skipped' ||
              r.severity === 'blocked' ||
              r.severity === 'warning',
          )
          .map((r) => r.key),
      )
      const existingKeys = new Set(
        existing.map((e) => e.generator?.rowKey).filter(Boolean) as string[],
      )
      targetRows = targetRows.filter((row) => {
        if (row.key && rerunKeys.has(row.key)) return true
        if (row.key && !existingKeys.has(row.key)) return true
        return false
      })
    } catch {
      // Fallback bila run history kosong: proses seluruh baris
    }
  }

  if (maxRows > 0) targetRows = targetRows.slice(0, maxRows)

  const aiNeeded = mode === 'generate'
  const collection = entityType === 'post' ? 'posts' : 'pages'
  const light = (template.layout ?? []).length > 0

  // 3. Concurrency worker queue setup (configurable per program / options)
  const poolSize = Math.max(
    1,
    Math.min(
      Number(
        options.concurrency ??
          program.concurrency ??
          process.env.GENERATOR_CONCURRENCY ??
          4,
      ),
      8,
    ),
  )

  const processRow = async (row: GeneratorRow, rowIdx: number): Promise<RowReport> => {
    const tokens = buildTokens(template, row)

    // A. Interlinking resolution untuk baris ini
    let interlink: InterlinkResult | null = null
    if (program.enableInterlink !== false && interlinkTargets.length > 1) {
      // Cari index baris ini di katalog target interlink
      const catalogIdx = interlinkTargets.findIndex(
        (t) => t.key === row.key || (row.city && t.city === row.city),
      )
      interlink = selectInterlinks({
        allTargets: interlinkTargets,
        count: program.interlinkCount ?? 6,
        currentIndex: catalogIdx >= 0 ? catalogIdx : rowIdx,
        currentRow: row,
      })
    }

    // B. AI Content Plan
    let plan: ContentPlan | null = null
    if (aiNeeded && aiConfigured()) {
      for (let attempt = 0; attempt < 2 && !plan; attempt += 1) {
        try {
          plan = light
            ? await generateLightPlan({ entityType, row, template, tokens })
            : await generatePlan({ entityType, row, template, tokens })
        } catch (err) {
          if (attempt === 1) {
            payload.logger.warn(
              `[generator] plan gagal utk baris ${row.key}: ${(err as Error)?.message}`,
            )
          }
          plan = null
        }
        if (!plan) await new Promise((r) => setTimeout(r, 700))
      }
    }

    // C. Assemble draft with custom tokens & interlinks
    let draft = buildDraft({
      entityType,
      interlink,
      plan,
      program,
      row,
      template,
    })

    // D. Resolve [aigen:...] shortcodes
    if (aiNeeded) {
      const prompts = extractAiPrompts(draft)
      if (prompts.length) {
        const replacements: Record<string, string> = {}
        for (const p of prompts) replacements[p] = await fillPrompt(p)
        draft = replacePromptsIn(draft, replacements) as GeneratedDraft
      }
    }

    // E. Enrich aiContent blocks
    const built = await buildBlocks({ draft, entityType, mode, row, template })
    draft = built.draft

    // F. QA Gate
    const qa = assessDraft({ draft, existing, overwrite: writeMode === 'overwrite' })

    const entry: RowReport = {
      action: 'dry-run',
      docId: undefined,
      enriched: built.enriched,
      entityType,
      issues: qa.issues,
      key: row.key as string,
      severity: qa.severity,
      slug: draft.slug,
      title: draft.title,
    }

    if (mode !== 'generate' || qa.severity === 'blocked') return entry

    // G. Write to DB
    const dupMatch = findDuplicate({
      existing,
      keywordKey: draft.keywordKey,
      programId: draft.generator.programId,
      rowKey: draft.rowKey,
      slug: draft.slug,
    })
    const targetDoc = dupMatch?.existing

    try {
      const data = toPayloadData(draft)
      if (targetDoc && writeMode === 'overwrite') {
        await payload.update({ collection, data, id: targetDoc.id, overrideAccess: true })
        entry.action = 'updated'
        entry.docId = targetDoc.id
      } else if (targetDoc && writeMode === 'create') {
        entry.action = 'skipped'
      } else {
        const created = (await payload.create({
          collection,
          data: data as never,
          overrideAccess: true,
        })) as unknown as AnyObj
        entry.action = 'created'
        entry.docId = created.id as number | string
        existing.push({
          generator: draft.generator,
          id: created.id as number | string,
          slug: draft.slug,
        })
      }
    } catch (err) {
      entry.action = 'skipped'
      entry.issues = [
        ...entry.issues,
        { code: 'write-error', message: String((err as Error).message), severity: 'blocked' },
      ]
      entry.severity = 'blocked'
    }

    return entry
  }

  // Bounded worker pool dengan urutan hasil yang dipertahankan
  const results: (RowReport | null)[] = new Array(targetRows.length).fill(null)
  let cursor = 0
  const worker = async (): Promise<void> => {
    while (cursor < targetRows.length) {
      const idx = cursor
      cursor += 1
      const row = targetRows[idx]
      if (!row) break
      results[idx] = await processRow(row, idx)
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(poolSize, targetRows.length || 1) }, worker),
  )

  const report: RowReport[] = results.filter((r): r is RowReport => r !== null)

  const totals = {
    blocked: report.filter((r) => r.severity === 'blocked').length,
    concurrency: poolSize,
    created: report.filter((r) => r.action === 'created').length,
    ready: report.filter((r) => r.severity === 'ready').length,
    rows: report.length,
    scope,
    skipped: report.filter((r) => r.action === 'skipped').length,
    totalDatasetRows,
    updated: report.filter((r) => r.action === 'updated').length,
    warning: report.filter((r) => r.severity === 'warning').length,
  }

  const result: RunResult = {
    ai: { configured: aiConfigured(), model: aiInfo().model },
    durationMs: Date.now() - started,
    entityType,
    mode,
    programId: program.id,
    report,
    runId,
    totals,
    writeMode,
  }

  // Persist run report
  try {
    await payload.create({
      collection: 'generator-runs',
      data: {
        aiModel: result.ai.model,
        entityType,
        finishedAt: new Date().toISOString(),
        mode,
        notes: `AI configured: ${result.ai.configured} | Concurrency: ${poolSize} | Scope: ${scope}`,
        program: program.id as never,
        report: report as never,
        runId,
        startedAt: new Date(started).toISOString(),
        status: 'done',
        totals: { ...totals } as never,
        writeMode,
      },
      overrideAccess: true,
    })
    await payload.update({
      collection: 'generator-programs',
      data: {
        lastRunAt: new Date().toISOString(),
        lastRunSummary: totals as never,
        status: 'done',
      },
      id: program.id as number | string,
      overrideAccess: true,
    })
  } catch {
    // non-critical
  }

  return result
}

/**
 * Map a generated draft to the write payload, keeping the generator lineage
 * group and dropping engine-only keys the collection does not declare.
 */
const toPayloadData = (draft: GeneratedDraft): Record<string, unknown> => {
  const base: Record<string, unknown> = {
    _status: draft._status,
    generator: draft.generator,
    meta: draft.meta,
    slug: draft.slug,
    title: draft.title,
  }

  if (draft.entityType === 'post') {
    return {
      ...base,
      authors: draft.authors,
      category: draft.category,
      content: draft.content,
      excerpt: draft.excerpt,
      image: draft.image,
      publishedOn: draft.publishedOn,
    }
  }

  return {
    ...base,
    breadcrumbs: draft.breadcrumbs,
    hero: draft.hero,
    layout: draft.layout,
  }
}

/** Dry-run helper: build the QA report for a program without writing. */
export const dryRunProgram = async (
  payload: BasePayload,
  options: Omit<RunOptions, 'mode'> & { mode?: 'dry' | 'off' },
): Promise<RunResult> => runProgram(payload, { ...options, mode: options.mode ?? 'dry' })

export { buildStructurePrompt, normalizePlan, extractJson }
