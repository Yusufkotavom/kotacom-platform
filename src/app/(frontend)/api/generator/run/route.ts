import type { NextRequest } from 'next/server'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

import { aiInfo } from '@root/generator/ai'
import { runProgram } from '@root/generator/run'

// AI generation is slow (local reasoning model); allow a long run.
export const maxDuration = 800

const json = (body: unknown, status = 200): NextResponse =>
  NextResponse.json(body, { status })

/**
 * `POST /api/generator/run`
 *
 * Body: `{ programId, mode?: 'dry'|'generate'|'off', maxRows?, secret? }`.
 * Auth: a logged-in admin (cookie or `Authorization: Bearer <token>`).
 *
 * This is the surface that makes the generator *100% AI-operable*: an agent
 * logs in (token), creates template/dataset/program via the REST API, then
 * calls this endpoint to materialise pages/posts — no admin UI required.
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
    Boolean(user) && 'roles' in (user as object) && (user as { roles?: string[] }).roles?.includes('admin')
  const secret = typeof body.secret === 'string' ? body.secret : ''
  const secretOk =
    Boolean(process.env.GENERATOR_SECRET) && secret === process.env.GENERATOR_SECRET

  if (!isAdminUser && !secretOk) {
    return json({ error: 'Tidak diizinkan. Login sebagai admin atau kirim `secret` yang benar.' }, 401)
  }

  const programId = body.programId
  if (programId === undefined || programId === null || programId === '') {
    return json({ error: '`programId` wajib.' }, 400)
  }

  const mode = body.mode
  if (mode !== undefined && !['dry', 'generate', 'off'].includes(String(mode))) {
    return json({ error: "`mode` harus salah satu: 'dry' | 'generate' | 'off'." }, 400)
  }

  try {
    const result = await runProgram(payload, {
      maxRows: typeof body.maxRows === 'number' ? body.maxRows : undefined,
      mode: mode as 'dry' | 'generate' | 'off' | undefined,
      programId: programId as number | string,
    })
    return json({ ok: true, ...result })
  } catch (err) {
    payload.logger.error({ err, msg: 'generator run failed' })
    return json({ error: String((err as Error).message), ok: false }, 500)
  }
}

/** `GET /api/generator/run` → AI config + usage hint (no auth needed for info). */
export async function GET(): Promise<NextResponse> {
  return json({
    ai: aiInfo(),
    hint: 'POST { programId, mode: dry|generate|off, secret? } (admin login or GENERATOR_SECRET).',
    ok: true,
  })
}
