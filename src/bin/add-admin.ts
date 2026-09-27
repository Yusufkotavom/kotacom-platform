import { getPayload } from 'payload'
import config from '../payload.config'

async function run() {
  const payload = await getPayload({ config })
  
  // Delete existing admin if any
  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: 'admin@kotacom.dev' } }
  })
  
  for (const u of existing.docs) {
    await payload.delete({ collection: 'users', id: u.id })
  }
  
  const user = await payload.create({
    collection: 'users',
    data: { 
      email: 'admin@kotacom.dev', 
      password: 'HerMes@Devk2026!', 
      roles: ['admin'] 
    }
  })
  
  console.log("Created admin:", user.email)
  process.exit(0)
}

run()
