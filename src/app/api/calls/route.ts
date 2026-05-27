import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT c.*, co.name as contact_name, co.phone as contact_phone, ca.name as campaign_name
      FROM calls c
      LEFT JOIN contacts co ON c.contact_id=co.id
      LEFT JOIN campaigns ca ON co.campaign_id=ca.id
      ORDER BY c.started_at DESC LIMIT 200`)
    return NextResponse.json(rows)
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }) }
}

export async function POST(req: Request) {
  try {
    const b = await req.json()
    const { rows } = await pool.query(
      `INSERT INTO calls (contact_id, livekit_room_name, outcome, transcript, agent_notes, ended_at)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [b.contact_id, b.livekit_room_name, b.outcome, b.transcript, b.agent_notes, b.ended_at]
    )
    return NextResponse.json(rows[0], { status: 201 })
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }) }
}
