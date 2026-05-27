import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  const results: Record<string, unknown> = {
    env: {
      DATABASE_URL: process.env.DATABASE_URL ? `set (${process.env.DATABASE_URL.split('@')[1] || 'hidden'})` : 'NOT SET',
      LIVEKIT_URL: process.env.LIVEKIT_URL || 'NOT SET',
      LIVEKIT_API_KEY: process.env.LIVEKIT_API_KEY ? 'set' : 'NOT SET',
      LIVEKIT_API_SECRET: process.env.LIVEKIT_API_SECRET ? 'set' : 'NOT SET',
    }
  }
  try {
    const { rows } = await pool.query('SELECT NOW() as time, current_database() as db')
    results.db = { status: 'connected', time: rows[0].time, database: rows[0].db }
  } catch (e) {
    results.db = { status: 'error', error: String(e) }
  }
  return NextResponse.json(results)
}
