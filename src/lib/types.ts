export type CampaignStatus = 'active' | 'paused' | 'completed'
export type ContactStatus = 'pending' | 'called' | 'completed' | 'failed' | 'do_not_call'
export type CallOutcome = 'answered' | 'voicemail' | 'no_answer' | 'busy' | 'failed'

export interface Campaign {
  id: number
  client_id: string
  name: string
  status: CampaignStatus
  follow_up_delay_hours: number
  max_follow_up_attempts: number
  calling_window_start: string
  calling_window_end: string
  created_at: string
  contact_count?: number
  pending_count?: number
  called_count?: number
}

export interface Contact {
  id: number
  campaign_id: number
  phone: string
  name: string
  metadata: Record<string, unknown>
  status: ContactStatus
  follow_up_at: string | null
  follow_up_attempts: number
  created_at: string
  updated_at: string
  campaign_name?: string
}

export interface Call {
  id: number
  contact_id: number
  started_at: string
  ended_at: string | null
  outcome: CallOutcome | null
  transcript: string | null
  livekit_room_name: string | null
  agent_notes: string | null
  contact_name?: string
  contact_phone?: string
  campaign_name?: string
}
