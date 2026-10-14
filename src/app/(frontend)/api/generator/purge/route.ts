import type { NextRequest } from 'next/server'

import configPromise from '@payload-config'
import { purgeProgram } from '@root/generator/purge'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

// Deleting many docs can take a while on large programs.
export const maxDuration = 300

const json = (body: unknown, status = 200): NextResponse => NextResponse.json(body, { status })

/**
 * `POST /api/generator/purge`
 *
 * Delete documents produced by a generator program (matched by lineage
 * `generator.programId`). Hand-authored docs have no lineage → never matched.
 *
 * Body: `{ programId, entityType?: 'page'|'post', confirm?: boolean, secret? }`.
 * Auth: logged-in admin (cookie / Bearer) OR `secret === GENERATOR_SECRET`.
 *
 * SAFETY: defaults to a DRY RUN. Nothing is deleted unless `confirm: true` is
 * sent explicitly — the response then reports matched vs deleted counts.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const payload = await getPayload({ config: configPromise })

  let body: Record<string, unknown> = {}
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return json({ error: 'Body JSON tidak valid.' }, 400)
  }

  const { user } = await payload.auth({ headers: req.headers })
  const isAdminUser =
    Boolean(user) &&
    'roles' in (user as object) &&
    (user as { roles?: string[] }).roles?.includes('admin')
  const secret = typeof body.secret === 'string' ? body.secret : ''
  const secretOk = Boolean(process.env.GENERATOR_SECRET) && secret === process.env.GENERATOR_SECRET

  if (!isAdminUser && !secretOk) {
    return json({ error: 'Tidak diizinkan. Login sebagai admin atau kirim `secret` yang benar.' }, 401)
  }

  const programId = body.programId
  if (programId === undefined || programId === null || programId === '') {
    return json({ error: '`programId` wajib.' }, 400)
  }

  const entityType = body.entityType
  if (
    entityType !== undefined &&
    !(typeof entityType === 'string' && ['page', 'post'].includes(entityType))
  ) {
    return json({ error: "`entityType` harus 'page' atau 'post' bila diisi." }, 400)
  }

  // Dry run unless the caller explicitly confirms the destructive delete.
  const dryRun = body.confirm !== true

  try {
    const result = await purgeProgram(payload, {
      dryRun,
      entityType: entityType as 'page' | 'post' | undefined,
      programId: programId as number | string,
    })
    return json({ ok: true, ...result })
  } catch (err) {
    payload.logger.error({ err, msg: 'generator purge failed' })
    return json({ error: String((err as Error).message), ok: false }, 500)
  }
}

/** `GET /api/generator/purge` → usage hint (no auth needed for info). */
export function GET(): NextResponse {
  return json({
    hint: 'POST { programId, entityType?: page|post, confirm?: boolean, secret? }. Default dry-run; kirim confirm:true untuk menghapus.',
    ok: true,
  })
}
