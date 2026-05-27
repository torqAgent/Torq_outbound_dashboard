'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, X, Megaphone, Clock, Users } from 'lucide-react'
import type { Campaign } from '@/lib/types'

const empty = { client_id: '', name: '', status: 'active', follow_up_delay_hours: 48, max_follow_up_attempts: 3, calling_window_start: '09:00', calling_window_end: '18:00' }

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/campaigns')
    if (res.ok) setCampaigns(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

  const submit = async () => {
    setLoading(true)
    await fetch('/api/campaigns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setForm(empty); setShowForm(false); setLoading(false); load()
  }

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/campaigns/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    load()
  }

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 32, letterSpacing: 2, color: 'var(--gold)' }}>CAMPAIGNS</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>{campaigns.length} total campaigns</p>
        </div>
        <button className="btn-gold" onClick={() => setShowForm(true)}><Plus size={15} />New Campaign</button>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: 520, padding: 28, position: 'relative' }}>
            <button onClick={() => setShowForm(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
            <h2 className="font-display" style={{ fontSize: 22, letterSpacing: 1, marginBottom: 20, color: 'var(--gold)' }}>NEW CAMPAIGN</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[['Client ID', 'client_id', 'text'], ['Campaign Name', 'name', 'text']].map(([l, k, t]) => (
                <div key={k}>
                  <label>{l}</label>
                  <input type={t} value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} />
                </div>
              ))}
              <div>
                <label>Status</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label>Follow-up Delay (hrs)</label>
                <input type="number" value={form.follow_up_delay_hours} onChange={e => setForm(p => ({ ...p, follow_up_delay_hours: +e.target.value }))} />
              </div>
              <div>
                <label>Max Follow-up Attempts</label>
                <input type="number" value={form.max_follow_up_attempts} onChange={e => setForm(p => ({ ...p, max_follow_up_attempts: +e.target.value }))} />
              </div>
              <div>
                <label>Calling Window Start</label>
                <input type="time" value={form.calling_window_start} onChange={e => setForm(p => ({ ...p, calling_window_start: e.target.value }))} />
              </div>
              <div>
                <label>Calling Window End</label>
                <input type="time" value={form.calling_window_end} onChange={e => setForm(p => ({ ...p, calling_window_end: e.target.value }))} />
              </div>
            </div>
            <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
              <button className="btn-gold" onClick={submit} disabled={loading}>{loading ? 'Creating...' : 'Create Campaign'}</button>
              <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {campaigns.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1/-1' }}>
            <Megaphone size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <p>No campaigns yet. Create your first one.</p>
          </div>
        ) : campaigns.map(c => (
          <div key={c.id} className="card card-hover" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{c.client_id}</div>
              </div>
              <span className={`status-badge status-${c.status}`}>{c.status}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              {[
                [Users, `${c.contact_count || 0} contacts`],
                [Clock, `${c.calling_window_start?.slice(0,5)} – ${c.calling_window_end?.slice(0,5)}`],
              ].map(([Icon, text], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                  <span><Icon size={13} /></span>
                  <span>{text as string}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {c.status !== 'active' && <button className="btn-gold" style={{ fontSize: 11, padding: '5px 12px' }} onClick={() => updateStatus(c.id, 'active')}>Activate</button>}
              {c.status === 'active' && <button className="btn-ghost" style={{ fontSize: 11, padding: '5px 12px' }} onClick={() => updateStatus(c.id, 'paused')}>Pause</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
