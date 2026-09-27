import postgres from 'postgres'
import { getConfig } from '@/lib/config'

const poolOptions = {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  onnotice: () => {},
}

export const sql = postgres(getConfig().databaseUrl, poolOptions)
