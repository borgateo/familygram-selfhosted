import { createInterface } from 'node:readline/promises'
import { Writable } from 'node:stream'
import { stdin as input, stdout as output } from 'node:process'
import bcrypt from 'bcryptjs'
import postgres from 'postgres'

const command = process.argv[2]
if (!['create', 'reset-password'].includes(command)) {
  console.error('Usage: node scripts/admin.mjs <create|reset-password>')
  process.exit(1)
}

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL is required')

let muted = false
const quietOutput = new Writable({
  write(chunk, _encoding, callback) {
    if (!muted) output.write(chunk)
    callback()
  },
})
const rl = createInterface({ input, output: quietOutput, terminal: Boolean(input.isTTY) })
const sql = postgres(databaseUrl, { max: 1 })

async function ask(label, fallback = '') {
  const suffix = fallback ? ` [${fallback}]` : ''
  return (await rl.question(`${label}${suffix}: `)).trim() || fallback
}

async function password() {
  const fromEnv = process.env.FAMILYGRAM_ADMIN_PASSWORD
  if (fromEnv) return fromEnv
  output.write('Password: ')
  muted = Boolean(input.isTTY)
  const value = await rl.question('')
  muted = false
  output.write('\n')
  return value
}

try {
  if (command === 'create') {
    const email = (await ask('Email')).toLowerCase()
    const username = await ask('Username')
    const displayName = await ask('Display name', username)
    const locale = await ask('Locale', 'en')
    const rawPassword = await password()
    if (!email || !username || !displayName || rawPassword.length < 12) {
      throw new Error('Email, username and display name are required; password must be at least 12 characters')
    }
    if (!['en', 'it', 'pt-BR'].includes(locale)) throw new Error('Locale must be en, it or pt-BR')
    const hash = await bcrypt.hash(rawPassword, 12)
    await sql`
      insert into users (email, username, display_name, password_hash, role, locale)
      values (${email}, ${username}, ${displayName}, ${hash}, 'admin', ${locale})
    `
    console.log(`Created admin ${username}`)
  } else {
    const identifier = (await ask('Username or email')).toLowerCase()
    const rawPassword = await password()
    if (rawPassword.length < 12) throw new Error('Password must be at least 12 characters')
    const hash = await bcrypt.hash(rawPassword, 12)
    const rows = await sql`
      update users set password_hash = ${hash}
      where lower(username) = ${identifier} or lower(email) = ${identifier}
      returning id
    `
    if (!rows[0]) throw new Error('User not found')
    await sql`delete from sessions where user_id = ${rows[0].id}`
    console.log('Password reset and existing sessions revoked')
  }
} finally {
  rl.close()
  await sql.end()
}
