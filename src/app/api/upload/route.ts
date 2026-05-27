import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(req: Request) {
  let client

  try {
    const body = await req.json()
    const { campaign_id, contacts } = body

    if (!campaign_id) {
      return NextResponse.json({ error: 'campaign_id is required' }, { status: 400 })
    }

    if (!Array.isArray(contacts)) {
      return NextResponse.json({ error: 'contacts must be array' }, { status: 400 })
    }

    client = await pool.connect()
    await client.query('BEGIN')

    let inserted = 0
    let skipped = 0

    for (const c of contacts) {
      const phone = c.phone?.toString().trim()

      if (!phone) {
        skipped++
        continue
      }

      const result = await client.query(
        `INSERT INTO contacts (campaign_id, phone, name, metadata)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (campaign_id, phone) DO NOTHING`,
        [
          Number(campaign_id),
          phone,
          c.name || 'Unknown',
          { notes: c.notes || null }
        ]
      )

      if (result.rowCount) inserted++
      else skipped++
    }

    await client.query('COMMIT')

    return NextResponse.json({ inserted, skipped, total: contacts.length })

  } catch (e) {
    if (client) await client.query('ROLLBACK')
    console.error(e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  } finally {
    if (client) client.release()
  }
}