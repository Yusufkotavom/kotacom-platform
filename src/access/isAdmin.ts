import type { Access, FieldAccess } from 'payload'

export const isAdmin: Access = ({ req: { user } }) => {
  // req.user bisa User | PayloadMcpApiKey | null — hanya User yang punya roles
  return Boolean(user && 'roles' in user && user.roles?.includes('admin'))
}

export const isAdminFieldLevel: FieldAccess = ({ req: { user } }) => {
  // Return true or false based on if the user has an admin role
  return Boolean(user && 'roles' in user && user.roles?.includes('admin'))
}
