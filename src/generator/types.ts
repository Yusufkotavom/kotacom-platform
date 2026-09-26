export type EntityType = 'page' | 'post'

export type GeneratorTokenDefinition = {
  fallbackValue?: null | string
  name: string
  sourceField?: null | string
}

export type GeneratorRowToken = { name: string; values?: null | string[] }

export type GeneratorRow = {
  categorySlug?: null | string
  city?: null | string
  industry?: null | string
  key?: null | string
  label?: null | string
  localCondition?: null | string
  offer?: null | string
  primaryKeyword: string
  secondaryKeywords?: null | string[]
  service?: null | string
  tokens?: GeneratorRowToken[] | null
}

export type GeneratorTemplateLite = {
  entityType: EntityType
  h1Pattern?: null | string
  hero?: null | Record<string, unknown>
  id: number | string
  layout?: null | Record<string, unknown>[]
  routeBase: string
  schemaType?: null | string
  seoDescriptionPattern?: null | string
  seoTitlePattern?: null | string
  slugPattern?: null | string
  tokenDefinitions?: GeneratorTokenDefinition[] | null
}

export type GeneratorProgramLite = {
  aiMode?: 'dry' | 'generate' | 'off' | null
  dataset?: null | number | string
  defaultAuthors?: null | (number | string)[]
  defaultCategory?: null | number | string
  defaultImage?: null | number | string
  entityType: EntityType
  id: number | string
  outputStatus?: 'draft' | 'published' | null
  routeBase?: null | string
  writeMode?: 'create' | 'overwrite' | null
}

export type ExistingDoc = {
  generator?: null | {
    keywordKey?: null | string
    programId?: null | number | string
    rowKey?: null | string
  }
  id: number | string
  slug?: null | string
}

export type GeneratedGeneratorMeta = {
  aiUsed: boolean
  datasetId?: number | string
  generatedAt?: string
  keywordKey: string
  programId: number | string
  rowKey: string
  templateId?: number | string
  version: string
}

export type GeneratedBase = {
  _status: 'draft' | 'published'
  entityType: EntityType
  generator: GeneratedGeneratorMeta
  keywordKey: string
  meta: { description?: string; title?: string }
  rowKey: string
  slug: string
  title: string
}

export type GeneratedPage = GeneratedBase & {
  breadcrumbs?: { label: string; url: string }[]
  entityType: 'page'
  hero: Record<string, unknown>
  layout: Record<string, unknown>[]
}

export type GeneratedPost = GeneratedBase & {
  authors?: (number | string)[]
  category?: number | string
  content: Record<string, unknown>[]
  entityType: 'post'
  excerpt: Record<string, unknown>
  image?: number | string
  publishedOn: string
}

export type GeneratedDraft = GeneratedPage | GeneratedPost

export type QaSeverity = 'blocked' | 'ready' | 'warning'

export type QaIssue = { code: string; message: string; severity: QaSeverity }

export type QaResult = { issues: QaIssue[]; severity: QaSeverity }
