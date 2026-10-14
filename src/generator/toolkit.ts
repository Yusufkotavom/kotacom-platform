import type { BasePayload } from 'payload'

import type { EntityType } from './types'

import { lexicalFromText } from './lexical'
import { purgeProgram } from './purge'
import { runProgram } from './run'

/**
 * Generator toolkit — one reusable surface for building generator jobs, so new
 * generation tasks are consistent and low-boilerplate. Scripts and future tools
 * should call these instead of hand-writing `payload.create/update` blocks.
 *
 * Everything is idempotent by name/lineage:
 *  - datasets/templates/programs upsert by unique `name`
 *  - generation writes pages/posts (runner handles overwrite-by-lineage)
 *  - purge deletes by lineage (`generator.programId`)
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyPayload = BasePayload

/** Rich-text helper: turn markdown-ish text into a Lexical value. */
export const rt = (text: string): any => lexicalFromText(text)

/** Upsert a doc by a unique `where`; returns the created/updated doc. */
const upsertByName = async (
  payload: AnyPayload,
  collection: 'generator-datasets' | 'generator-programs' | 'generator-templates',
  name: string,
  data: Record<string, unknown>,
): Promise<any> => {
  const found = await payload.find({
    collection,
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { name: { equals: name } },
  })
  if (found.docs[0]) {
    return payload.update({
      id: (found.docs[0] as { id: number | string }).id,
      collection,
      data: data as never,
      overrideAccess: true,
    })
  }
  return payload.create({ collection, data: data as never, overrideAccess: true })
}

/**
 * Create/update a dataset from a CSV blob. The collection's beforeChange hook
 * parses `sourceCsv` into `rows`, so callers only supply the CSV + key column.
 */
export const upsertDatasetFromCsv = (
  payload: AnyPayload,
  input: { csv: string; keyColumn?: string; name: string; notes?: string },
): Promise<any> =>
  upsertByName(payload, 'generator-datasets', input.name, {
    name: input.name,
    keyColumn: input.keyColumn,
    notes: input.notes,
    sourceCsv: input.csv,
  })

/** Create/update a template. `layout`/`hero` accept ready-made block stacks. */
export const upsertTemplate = (
  payload: AnyPayload,
  input: {
    entityType: EntityType
    h1Pattern?: string
    hero?: Record<string, unknown>
    layout?: Record<string, unknown>[]
    name: string
    routeBase: string
    seoDescriptionPattern?: string
    seoTitlePattern?: string
    slugPattern?: string
  },
): Promise<any> =>
  upsertByName(payload, 'generator-templates', input.name, { ...input })

/** Create/update a program binding a template + dataset(s). */
export const upsertProgram = (
  payload: AnyPayload,
  input: {
    aiMode?: 'dry' | 'generate' | 'off'
    datasets: (number | string)[]
    defaultAuthors?: (number | string)[]
    defaultCategory?: number | string
    defaultImage?: number | string
    entityType: EntityType
    name: string
    outputStatus?: 'draft' | 'published'
    routeBase?: string
    template: number | string
    writeMode?: 'create' | 'overwrite'
  },
): Promise<any> =>
  upsertByName(payload, 'generator-programs', input.name, {
    name: input.name,
    aiMode: input.aiMode ?? 'off',
    datasets: input.datasets,
    defaultAuthors: input.defaultAuthors,
    defaultCategory: input.defaultCategory,
    defaultImage: input.defaultImage,
    entityType: input.entityType,
    outputStatus: input.outputStatus ?? 'draft',
    routeBase: input.routeBase,
    template: input.template,
    writeMode: input.writeMode ?? 'overwrite',
  })

/**
 * One-shot helper: build dataset + template + program from plain inputs, run
 * the generator, and return the run result + the created program id.
 */
export const buildAndRun = async (
  payload: AnyPayload,
  input: {
    csv: string
    dataset: { keyColumn?: string; name: string; notes?: string }
    mode?: 'dry' | 'generate' | 'off'
    program: {
      name: string
    } & Omit<Parameters<typeof upsertProgram>[1], 'datasets' | 'entityType' | 'template'>
    template: Parameters<typeof upsertTemplate>[1]
  },
): Promise<{ programId: number | string; result: Awaited<ReturnType<typeof runProgram>> }> => {
  const dataset = await upsertDatasetFromCsv(payload, { csv: input.csv, ...input.dataset })
  const template = await upsertTemplate(payload, input.template)
  const program = await upsertProgram(payload, {
    ...input.program,
    datasets: [dataset.id],
    entityType: input.template.entityType,
    template: template.id,
  })
  const result = await runProgram(payload, {
    mode: input.mode ?? 'generate',
    programId: program.id,
  })
  return { programId: program.id, result }
}

/** List documents produced by a program (by lineage). */
export const listGenerated = async (
  payload: AnyPayload,
  input: { entityType?: EntityType; programId: number | string },
): Promise<{ id: number | string; slug: string; status?: string; title: string }[]> => {
  const collection = input.entityType === 'post' ? 'posts' : 'pages'
  const res = await payload.find({
    collection,
    depth: 0,
    limit: 500,
    overrideAccess: true,
    pagination: false,
    sort: 'slug',
    where: { 'generator.programId': { equals: String(input.programId) } },
  })
  return (res.docs as any[]).map((d) => ({
    id: d.id,
    slug: d.slug,
    status: d._status,
    title: d.title,
  }))
}

// Re-export the primitives so callers import everything from the toolkit.
export { purgeProgram, runProgram }
