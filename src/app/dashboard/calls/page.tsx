'use client'
import { useState, useEffect, useCallback } from 'react'
import { PhoneCall, Clock } from 'lucide-react'
import type { Call } from '@/lib/types'

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([])
  const [selected, setSelected] = useState<Call | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/calls')
    if (res.ok) setCalls(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

  const duration = (start: string, end: string | null) => {
    if (!end) return 'Live'
    const s = Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 1000)
    return s < 60 ? `${s}s` : `${Math.floor(s/60)}m ${s%60}s`
  }

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 28 }}>
        <h1 className="font-display" style={{ fontSize: 32, letterSpacing: 2, color: 'var(--gold)' }}>CALL LOGS</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>{calls.length} calls recorded</p>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden' }}>
          <table>
            <thead>
              <tr><th>Contact</th><th>Campaign</th><th>Started</th><th>Duration</th><th>Outcome</th><th>Room</th></tr>
            </thead>
            <tbody>
              {calls.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                  <PhoneCall size={28} style={{ margin: '0 auto 8px', opacity: 0.4 }} /><br/>No calls yet
                </td></tr>
              ) : calls.map(c => (
                <tr key={c.id} onClick={() => setSelected(c)} style={{ cursor: 'pointer' }}>
                  <td style={{ fontWeight: 500 }}>{c.contact_name || `Contact #${c.contact_id}`}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{c.campaign_name || '-'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(c.started_at).toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
                      <Clock size={13} color={!c.ended_at ? 'var(--gold)' : 'var(--text-muted)'} />
                      <span style={{ color: !c.ended_at ? 'var(--gold)' : undefined }}>{duration(c.started_at, c.ended_at)}</span>
                    </div>
                  </td>
                  <td><span className={`status-badge status-${c.outcome || 'pending'}`}>{c.outcome || 'in progress'}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{c.livekit_room_name || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="card" style={{ width: 340, padding: 20, height: 'fit-content', position: 'sticky', top: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontWeight: 600 }}>Call Detail</div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
            </div>
            {[
              ['Contact', selected.contact_name || `#${selected.contact_id}`],
              ['Campaign', selected.campaign_name || '-'],
              ['Started', new Date(selected.started_at).toLocaleString()],
              ['Ended', selected.ended_at ? new Date(selected.ended_at).toLocaleString() : 'In progress'],
              ['Duration', duration(selected.started_at, selected.ended_at)],
              ['Room', selected.livekit_room_name || '-'],
            ].map(([k, v]) => (
              <div key={k} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 3 }}>{k}</div>
                <div style={{ fontSize: 13 }}>{v}</div>
              </div>
            ))}
            {selected.transcript && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 6 }}>Transcript</div>
                <div style={{ background: 'var(--surface-2)', borderRadius: 8, padding: 12, fontSize: 12, lineHeight: 1.7, maxHeight: 240, overflow: 'auto', color: 'var(--text-muted)' }}>{selected.transcript}</div>
              </div>
            )}
            {selected.agent_notes && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 6 }}>Agent Notes</div>
                <div style={{ background: 'var(--surface-2)', borderRadius: 8, padding: 12, fontSize: 12, lineHeight: 1.7, color: 'var(--text-muted)' }}>{selected.agent_notes}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
