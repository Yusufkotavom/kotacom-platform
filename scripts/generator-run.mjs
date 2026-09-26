#!/usr/bin/env node
/**
 * Generator CLI — thin wrapper over `POST /api/generator/run`.
 *
 * 100% AI-operable: the same endpoint the admin/agent calls, so a shell or an
 * agent can drive generation without the admin UI.
 *
 * Usage:
 *   node scripts/generator-run.mjs --program <id> [--mode dry|generate|off]
 *        [--max-rows N] [--url http://localhost:3001]
 *        [--email admin@x --password '...']   # or GENERATOR_SECRET / PAYLOAD_TOKEN env
 *
 * Env:
 *   GENERATOR_BASE_URL   (default http://localhost:3001)
 *   GENERATOR_SECRET     (bypass: matches process.env.GENERATOR_SECRET on server)
 *   PAYLOAD_EMAIL / PAYLOAD_PASSWORD  (login to mint a token)
 */

const args = process.argv.slice(2)
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback
}

const base = (opt('url', process.env.GENERATOR_BASE_URL || 'http://localhost:3001')).replace(/\/$/, '')
const programId = opt('program')
const mode = opt('mode')
const maxRows = opt('max-rows')

if (!programId) {
  console.error('Error: --program <id> wajib.')
  process.exit(1)
}

const login = async () => {
  const email = opt('email', process.env.PAYLOAD_EMAIL)
  const password = opt('password', process.env.PAYLOAD_PASSWORD)
  if (!email || !password) return null
  const res = await fetch(`${base}/api/users/login`, {
    body: JSON.stringify({ email, password }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  if (!res.ok) {
    console.error(`Login gagal: HTTP ${res.status}`)
    return null
  }
  const data = await res.json()
  return data?.token ?? null
}

const run = async () => {
  const token = process.env.PAYLOAD_TOKEN || (await login())
  const secret = process.env.GENERATOR_SECRET || ''

  const body = { programId }
  if (mode) body.mode = mode
  if (maxRows) body.maxRows = Number(maxRows)
  if (secret && !token) body.secret = secret

  const res = await fetch(`${base}/api/generator/run`, {
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    method: 'POST',
  })

  const text = await res.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    console.error(`Respons non-JSON (HTTP ${res.status}):\n${text}`)
    process.exit(1)
  }

  if (!res.ok || json?.ok === false) {
    console.error(`Gagal (HTTP ${res.status}):`, json?.error ?? json)
    process.exit(1)
  }

  const { ai, mode: runMode, programId: pid, report, runId, totals, writeMode } = json
  console.log(`\nRun ${runId} — program ${pid} — mode=${runMode} write=${writeMode}`)
  console.log(`AI: ${ai?.model} (configured=${ai?.configured})`)
  console.log(`Totals: rows=${totals.rows} ready=${totals.ready} warning=${totals.warning} blocked=${totals.blocked}`)
  console.log(`Actions: created=${totals.created} updated=${totals.updated} skipped=${totals.skipped}\n`)
  for (const row of report ?? []) {
    console.log(`  [${row.severity}] ${row.action}  ${row.slug}${row.enriched ? `  (ai x${row.enriched})` : ''}`)
    for (const issue of row.issues ?? []) {
      if (issue.severity !== 'ready') console.log(`      - ${issue.severity}: ${issue.code} — ${issue.message}`)
    }
  }
  console.log('')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
