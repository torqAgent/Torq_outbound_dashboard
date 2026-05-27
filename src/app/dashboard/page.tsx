import pool from '@/lib/db'
import { getLiveKitStats } from '@/lib/livekit'
import { PhoneCall, Users, Clock, Megaphone, TrendingUp, CheckCircle, Radio, Wifi } from 'lucide-react'
import LiveKitPanel from '@/components/LiveKitPanel'

async function getDbStats() {
  try {
    const [contacts, campaigns, calls, recent] = await Promise.all([
      pool.query(`SELECT status, COUNT(*)::int as count FROM contacts GROUP BY status`),
      pool.query(`SELECT status, COUNT(*)::int as count FROM campaigns GROUP BY status`),
      pool.query(`SELECT outcome, COUNT(*)::int as count FROM calls GROUP BY outcome`),
      pool.query(`
        SELECT c.id, c.started_at, c.ended_at, c.outcome, c.livekit_room_name,
               co.name as contact_name, ca.name as campaign_name
        FROM calls c
        LEFT JOIN contacts co ON c.contact_id = co.id
        LEFT JOIN campaigns ca ON co.campaign_id = ca.id
        ORDER BY c.started_at DESC LIMIT 8`),
    ])
    return { contacts: contacts.rows, campaigns: campaigns.rows, calls: calls.rows, recent: recent.rows, error: null }
  } catch (e) {
    return { contacts: [], campaigns: [], calls: [], recent: [], error: String(e) }
  }
}

async function getLkStats() {
  try {
    return await getLiveKitStats()
  } catch {
    return { activeRooms: 0, totalParticipants: 0, rooms: [] }
  }
}

function byKey(rows: { status?: string; outcome?: string; count: number }[], key: string) {
  return rows.find(r => (r.status || r.outcome) === key)?.count || 0
}
function total(rows: { count: number }[]) {
  return rows.reduce((s, r) => s + r.count, 0)
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  const [db, lk] = await Promise.all([getDbStats(), getLkStats()])

  const totalCalls = total(db.calls)
  const answered = byKey(db.calls, 'answered')
  const answerRate = totalCalls > 0 ? Math.round((answered / totalCalls) * 100) : 0

  const metrics = [
    { label: 'Total Contacts', value: total(db.contacts), icon: Users, color: '#8888ff' },
    { label: 'Pending Calls', value: byKey(db.contacts, 'pending'), icon: Clock, color: 'var(--gold)' },
    { label: 'Total Calls Made', value: totalCalls, icon: PhoneCall, color: '#50cd50' },
    { label: 'Active Campaigns', value: byKey(db.campaigns, 'active'), icon: Megaphone, color: '#ff8888' },
    { label: 'Completed', value: byKey(db.contacts, 'completed'), icon: CheckCircle, color: '#50cd50' },
    { label: 'Answer Rate', value: `${answerRate}%`, icon: TrendingUp, color: 'var(--gold)' },
  ]

  const lkMetrics = [
    { label: 'Live Rooms', value: lk.activeRooms, icon: Radio, color: '#50cd50' },
    { label: 'Active Participants', value: lk.totalParticipants, icon: Wifi, color: 'var(--gold)' },
  ]

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 28 }}>
        <h1 className="font-display" style={{ fontSize: 32, letterSpacing: 2, background: 'linear-gradient(135deg, #FFD84D, #F5C518, #C9A000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>COMMAND CENTER</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Live campaign performance overview</p>
        {db.error && <div style={{ marginTop: 8, padding: '8px 14px', background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: 8, fontSize: 12, color: '#ff8080' }}>DB Error: {db.error}</div>}
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10 }}>Database Metrics</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {metrics.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="metric-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8 }}>{label}</div>
                  <div style={{ fontSize: 36, fontWeight: 700, color, fontFamily: 'var(--font-display)' }}>{value}</div>
                </div>
                <div style={{ background: `${color}18`, borderRadius: 10, padding: 10 }}><Icon size={20} color={color} /></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10 }}>LiveKit — Real-time</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {lkMetrics.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="metric-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8 }}>{label}</div>
                  <div style={{ fontSize: 36, fontWeight: 700, color, fontFamily: 'var(--font-display)' }}>{value}</div>
                </div>
                <div style={{ background: `${color}18`, borderRadius: 10, padding: 10 }}><Icon size={20} color={color} /></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {lk.rooms.length > 0 && <LiveKitPanel rooms={lk.rooms} />}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <PhoneCall size={16} color="var(--gold)" />
          <span style={{ fontWeight: 600, fontSize: 14 }}>Recent Calls</span>
        </div>
        <table>
          <thead>
            <tr><th>Contact</th><th>Campaign</th><th>Started</th><th>Outcome</th><th>Room</th></tr>
          </thead>
          <tbody>
            {db.recent.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No calls yet</td></tr>
            ) : db.recent.map((call: { id: number; contact_name: string; campaign_name: string; started_at: string; outcome: string; livekit_room_name: string }) => (
              <tr key={call.id}>
                <td style={{ fontWeight: 500 }}>{call.contact_name || 'Unknown'}</td>
                <td style={{ color: 'var(--text-muted)' }}>{call.campaign_name || '-'}</td>
                <td style={{ color: 'var(--text-muted)' }}>{new Date(call.started_at).toLocaleString()}</td>
                <td><span className={`status-badge status-${call.outcome || 'pending'}`}>{call.outcome || 'in progress'}</span></td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{call.livekit_room_name || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
