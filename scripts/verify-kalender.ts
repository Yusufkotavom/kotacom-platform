import 'dotenv/config'
import { config as loadEnv } from 'dotenv'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
loadEnv({ path: '.env.local', override: true })
/* eslint-disable @typescript-eslint/no-explicit-any */
const main = async () => {
  const payload: any = await getPayload({ config: configPromise })
  // pages flagged as generated
  const gen = await payload.find({
    collection: 'pages', depth: 0, limit: 200, overrideAccess: true, pagination: false,
    where: { isGenerated: { equals: true } },
  })
  console.log('pages isGenerated=true:', gen.totalDocs)
  const kal = gen.docs.filter((d: any) => String(d.slug).startsWith('percetakan/cetak-kalender/'))
  console.log('  of which cetak-kalender:', kal.length)
  // sanity: one doc detail
  const jkt = gen.docs.find((d: any) => String(d.slug).endsWith('/jakarta'))
  console.log('  jakarta isGenerated:', jkt?.isGenerated, '| programId:', jkt?.generator?.programId)
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })
