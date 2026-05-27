import { NextResponse } from 'next/server'
import { getLiveKitStats } from '@/lib/livekit'

export async function GET() {
  try {
    const stats = await getLiveKitStats()
    return NextResponse.json(stats)
  } catch (e) {
    return NextResponse.json({ error: String(e), activeRooms: 0, totalParticipants: 0, rooms: [] }, { status: 200 })
  }
}
