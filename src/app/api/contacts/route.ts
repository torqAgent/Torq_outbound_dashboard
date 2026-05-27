import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const cid = searchParams.get('campaign_id')
    const status = searchParams.get('status')
    const conds: string[] = []
    const vals: (string | number)[] = []
    if (cid) { conds.push(`co.campaign_id=$${vals.length+1}`); vals.push(cid) }
    if (status) { conds.push(`co.status=$${vals.length+1}`); vals.push(status) }
    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : ''
    const { rows } = await pool.query(
      `SELECT co.*, ca.name as campaign_name FROM contacts co LEFT JOIN campaigns ca ON co.campaign_id=ca.id ${where} ORDER BY co.created_at DESC LIMIT 500`,
      vals)
    return NextResponse.json(rows)
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }) }
}
