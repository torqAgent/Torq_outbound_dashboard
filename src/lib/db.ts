import { Pool } from 'pg'

const globalForPg = globalThis as unknown as { pool: Pool }

function createPool() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL missing')

  return new Pool({
    connectionString: url,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  })
}

export const pool = globalForPg.pool ?? createPool()

if (process.env.NODE_ENV !== 'production') {
  globalForPg.pool = pool
}

export default pool