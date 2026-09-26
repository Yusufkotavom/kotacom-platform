/**
 * One-off recon: what categories / media exist, so the generator seed can reuse
 * them. Not part of the app runtime.
 */
import 'dotenv/config'
import { config as loadEnv } from 'dotenv'
import { getPayload } from 'payload'

import configPromise from '../src/payload.config'

loadEnv({ path: '.env.local', override: true })

const main = async () => {
  const payload = await getPayload({ config: configPromise })

  const cats = await payload.find({ collection: 'categories', limit: 20, depth: 0, overrideAccess: true })
  console.log('CATEGORIES:', cats.docs.map((c: any) => ({ id: c.id, name: c.name, slug: c.slug })))

  const media = await payload.find({ collection: 'media', limit: 10, depth: 0, overrideAccess: true })
  console.log('MEDIA:', media.docs.map((m: any) => ({ id: m.id, alt: m.alt, filename: m.filename })))

  const users = await payload.find({ collection: 'users', limit: 10, depth: 0, overrideAccess: true })
  console.log('USERS:', users.docs.map((u: any) => ({ id: u.id, email: u.email, roles: u.roles })))

  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
