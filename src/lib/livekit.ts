import { RoomServiceClient } from 'livekit-server-sdk'

let _client: RoomServiceClient | null = null

export function getLiveKitClient(): RoomServiceClient {
  if (_client) return _client
  const url = process.env.LIVEKIT_URL
  const key = process.env.LIVEKIT_API_KEY
  const secret = process.env.LIVEKIT_API_SECRET
  if (!url || !key || !secret) throw new Error('LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET must be set')
  _client = new RoomServiceClient(url, key, secret)
  return _client
}

export interface LiveKitStats {
  activeRooms: number
  totalParticipants: number
  rooms: {
    name: string
    numParticipants: number
    creationTime: number
    metadata: string
  }[]
}

export async function getLiveKitStats(): Promise<LiveKitStats> {
  const client = getLiveKitClient()
  const rooms = await client.listRooms()
  return {
    activeRooms: rooms.length,
    totalParticipants: rooms.reduce((s, r) => s + r.numParticipants, 0),
    rooms: rooms.map(r => ({
      name: r.name,
      numParticipants: r.numParticipants,
      creationTime: Number(r.creationTime),
      metadata: r.metadata || '',
    })),
  }
}
