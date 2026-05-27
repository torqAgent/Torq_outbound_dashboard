import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT 
        c.id,
        c.client_id,
        c.name,
        c.status,
        c.follow_up_delay_hours,
        c.max_follow_up_attempts,
        c.calling_window_start,
        c.calling_window_end,
        c.created_at,

        COUNT(co.id)::int as contact_count,
        COUNT(co.id) FILTER (WHERE co.status='pending')::int as pending_count,
        COUNT(co.id) FILTER (WHERE co.status='in_call')::int as in_call_count,
        COUNT(co.id) FILTER (WHERE co.status='follow_up')::int as follow_up_count,
        COUNT(co.id) FILTER (WHERE co.status='converted')::int as converted_count,
        COUNT(co.id) FILTER (WHERE co.status='discarded')::int as discarded_count

      FROM campaigns c
      LEFT JOIN contacts co ON co.campaign_id = c.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `)

    return NextResponse.json(rows)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      client_id,
      name,
      status,
      follow_up_delay_hours,
      max_follow_up_attempts,
      calling_window_start,
      calling_window_end
    } = body

    const result = await pool.query(
      `INSERT INTO campaigns 
      (client_id, name, status, follow_up_delay_hours, max_follow_up_attempts, calling_window_start, calling_window_end)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *`,
      [
        client_id,
        name,
        status,
        follow_up_delay_hours,
        max_follow_up_attempts,
        calling_window_start,
        calling_window_end
      ]
    )

    return NextResponse.json(result.rows[0])
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: String(e) },
      { status: 500 }
    )
  }
}