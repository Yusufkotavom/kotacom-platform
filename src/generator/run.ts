import type { BasePayload } from 'payload'

import { buildStructurePrompt, generatePlan, normalizePlan } from './plan'
import { extractJson } from './plan'
import { aiConfigured, aiInfo, extractAiPrompts, replacePromptsIn } from './ai'
import { buildDraft } from './render'
import { enrichAiBlocks } from './enrich'
import { assessDraft } from './qa'
import { buildTokens } from './tokens'
import type { ContentPlan } from './blocks'
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
  /** Force a mode regardless of the program's own setting. */
  mode?: 'dry' | 'generate' | 'off'
  /** Hard cap on rows processed in this call. */
  maxRows?: number
  programId: number | string
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
    created: number
    ready: number
    rows: number
    skipped: number
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
  defaultAuthors: ((doc.defaultAuthors as unknown[]) ?? []).map(relIds).filter(Boolean) as (
    | number
    | string
  )[],
  defaultCategory: relIds(doc.defaultCategory),
  defaultImage: relIds(doc.defaultImage),
  entityType: doc.entityType as EntityType,
  id: doc.id as number | string,
  outputStatus: (doc.outputStatus as 'draft' | 'published') ?? 'draft',
  routeBase: (doc.routeBase as string) ?? null,
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
 * Modes:
 *  - `dry`      → build drafts + run QA, write nothing.
 *  - `generate` → build drafts, fill AI blocks, then write docs (draft/published
 *                 per program.outputStatus). `writeMode:'overwrite'` updates the
 *                 existing doc (stable id); `'create'` skips slugs that exist.
 *  - `off`      → deterministic, no AI call at all.
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
  const writeMode = program.writeMode ?? 'overwrite'
  const maxRows = options.maxRows ?? Number(programDoc.maxRows ?? 0)
  const exclude = new Set<string>((programDoc.excludeRowKeys as string[]) ?? [])

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

  let rows = asRows(datasetDocs).filter((row) => row.key && !exclude.has(row.key))
  if (maxRows > 0) rows = rows.slice(0, maxRows)

  const existing = await loadExisting(payload, entityType, program.id)

  const report: RowReport[] = []
  let aiNeeded = mode === 'generate'

  for (const row of rows) {
    const tokens = buildTokens(template, row)

    // 1) Optional full content plan (drives fallback blocks + title/meta).
    let plan: ContentPlan | null = null
    if (aiNeeded && aiConfigured()) {
      for (let attempt = 0; attempt < 2 && !plan; attempt += 1) {
        try {
          plan = await generatePlan({ entityType, row, template, tokens })
        } catch (err) {
          if (attempt === 1) {
            payload.logger.warn(`[generator] plan gagal utk baris ${row.key}: ${(err as Error)?.message}`)
          }
          plan = null
        }
        if (!plan) await new Promise((r) => setTimeout(r, 700))
      }
    }

    // 2) Assemble the draft from the template skeleton (or plan fallback).
    let draft = buildDraft({ entityType, plan, program, row, template })

    // 3) Resolve any `[aigen:…]` shortcodes left in the skeleton.
    if (aiNeeded) {
      const prompts = extractAiPrompts(draft)
      if (prompts.length) {
        const replacements: Record<string, string> = {}
        for (const p of prompts) replacements[p] = await fillPrompt(p)
        draft = replacePromptsIn(draft, replacements) as GeneratedDraft
      }
    }

    // 4) Enrich `aiContent` blocks.
    const built = await buildBlocks({ draft, entityType, mode, row, template })
    draft = built.draft

    // 5) QA gate (duplicate + SEO + completeness).
    const qa = assessDraft({ draft, existing, overwrite: writeMode === 'overwrite' })

    const entry: RowReport = {
      action: 'dry-run',
      entityType,
      enriched: built.enriched,
      issues: qa.issues,
      key: row.key as string,
      severity: qa.severity,
      slug: draft.slug,
      title: draft.title,
    }

    if (mode !== 'generate' || qa.severity === 'blocked') {
      report.push(entry)
      continue
    }

    // 6) Write.
    const duplicate = existing.find((doc) => doc.slug === draft.slug)
    try {
      const data = toPayloadData(draft)
      if (duplicate && writeMode === 'overwrite') {
        await payload.update({
          collection: entityType === 'post' ? 'posts' : 'pages',
          data,
          id: duplicate.id,
          overrideAccess: true,
        })
        entry.action = 'updated'
        entry.docId = duplicate.id
      } else if (duplicate && writeMode === 'create') {
        entry.action = 'skipped'
      } else {
        const created = (await payload.create({
          collection: entityType === 'post' ? 'posts' : 'pages',
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

    report.push(entry)
  }

  const totals = {
    blocked: report.filter((r) => r.severity === 'blocked').length,
    created: report.filter((r) => r.action === 'created').length,
    ready: report.filter((r) => r.severity === 'ready').length,
    rows: report.length,
    skipped: report.filter((r) => r.action === 'skipped').length,
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

  // Persist the run report (best-effort — never fail the run on audit failure).
  try {
    await payload.create({
      collection: 'generator-runs',
      data: {
        aiModel: result.ai.model,
        entityType,
        finishedAt: new Date().toISOString(),
        mode,
        notes: `AI configured: ${result.ai.configured}`,
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
      data: { lastRunAt: new Date().toISOString(), lastRunSummary: totals as never, status: 'done' },
      id: program.id as number | string,
      overrideAccess: true,
    })
  } catch {
    // audit write is non-critical
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
