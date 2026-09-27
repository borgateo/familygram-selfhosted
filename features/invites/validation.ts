export type InviteState = 'valid' | 'expired' | 'used'

export function inviteState(expiresAt: Date, usedBy: string | null, now = new Date()): InviteState {
  if (usedBy) return 'used'
  if (expiresAt < now) return 'expired'
  return 'valid'
}
