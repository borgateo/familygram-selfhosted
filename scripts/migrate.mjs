import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import postgres from 'postgres'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL is required')

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const migrationsDir = join(root, 'db', 'migrations')
const sql = postgres(databaseUrl, { max: 1, onnotice: () => {} })

try {
  await sql`
    create table if not exists schema_migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )
  `
  await sql`select pg_advisory_lock(hashtext('familygram_schema_migrations'))`

  const appliedRows = await sql`select name from schema_migrations`
  const applied = new Set(appliedRows.map(row => String(row.name)))
  const files = (await readdir(migrationsDir)).filter(name => name.endsWith('.sql')).sort()

  for (const name of files) {
    if (applied.has(name)) continue
    const source = await readFile(join(migrationsDir, name), 'utf8')
    await sql.begin(async transaction => {
      await transaction.unsafe(source)
      await transaction`insert into schema_migrations (name) values (${name})`
    })
    console.log(`Applied ${name}`)
  }
} finally {
  try { await sql`select pg_advisory_unlock(hashtext('familygram_schema_migrations'))` } catch {}
  await sql.end()
}
