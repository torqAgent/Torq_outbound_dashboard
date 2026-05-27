import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { normalizeCampaignStatus } from '@/lib/validate'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()

    // IMPORTANT: sanitize status if present
    if (body.status) {
      body.status = normalizeCampaignStatus(body.status)
    }

    const keys = Object.keys(body)
    if (keys.length === 0) {
      return NextResponse.json({ error: 'No fields provided' }, { status: 400 })
    }

    const fields = keys.map((k, i) => `${k}=$${i + 2}`).join(', ')
    const values = Object.values(body)

    const { rows } = await pool.query(
      `UPDATE campaigns SET ${fields} WHERE id=$1 RETURNING *`,
      [params.id, ...values]
    )

    return NextResponse.json(rows[0])
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}