/**
 * Build-safety helpers.
 *
 * `next build` prerenders static pages, which makes it query Payload/Mongo. On this
 * VPS the build runs somewhere that cannot reach the database (the Dokploy builder
 * does not join `dokploy-network`, where `payload-mongo` lives), so a hard dependency
 * on the DB turns every redeploy into a failed build.
 *
 * These helpers degrade *only during the build phase*: if the DB is unreachable while
 * Next is prerendering, the page falls back to an empty shell and gets rendered
 * on-demand at request time instead. At runtime the error is re-thrown, so a database
 * outage is still loud and never silently serves an empty page.
 */

export const isBuildPhase = () => process.env.NEXT_PHASE === 'phase-production-build'

/** Run a DB-backed loader, falling back to `fallback` if it throws during build. */
export async function buildSafe<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    if (!isBuildPhase()) throw err

    console.warn(
      `[build] ${label} unavailable at build time (no DB) — falling back. ` +
        `Reason: ${(err as Error)?.message ?? err}`,
    )

    return fallback
  }
}
