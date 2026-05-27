import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const b = await req.json()
    const fields = Object.keys(b).map((k, i) => `${k}=$${i + 2}`).join(', ')
    const { rows } = await pool.query(
      `UPDATE contacts SET ${fields}, updated_at=now() WHERE id=$1 RETURNING *`,
      [params.id, ...Object.values(b)])
    return NextResponse.json(rows[0])
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }) }
}
