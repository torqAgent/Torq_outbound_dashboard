'use client'
import { useState } from 'react'
import { CheckCircle, AlertCircle, Settings, Zap, Database, ExternalLink } from 'lucide-react'

interface DebugResult {
  env?: Record<string, string>
  db?: { status: string; time?: string; database?: string; error?: string }
}

export default function SettingsPage() {
  const [debug, setDebug] = useState<DebugResult | null>(null)
  const [debugLoading, setDebugLoading] = useState(false)
  const [lkStatus, setLkStatus] = useState<{ activeRooms?: number; totalParticipants?: number; error?: string } | null>(null)
  const [lkLoading, setLkLoading] = useState(false)

  const runDebug = async () => {
    setDebugLoading(true)
    const res = await fetch('/api/debug')
    setDebug(await res.json())
    setDebugLoading(false)
  }

  const testLiveKit = async () => {
    setLkLoading(true)
    const res = await fetch('/api/livekit')
    setLkStatus(await res.json())
    setLkLoading(false)
  }

  return (
    <div className="animate-in" style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 className="font-display" style={{ fontSize: 32, letterSpacing: 2, color: 'var(--gold)' }}>SETTINGS</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Configure integrations and diagnose connections</p>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ background: 'rgba(245,197,24,0.15)', borderRadius: 8, padding: 8 }}><Settings size={18} color="var(--gold)" /></div>
          <div><div style={{ fontWeight: 600 }}>Environment Setup</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Required in your .env.local file</div></div>
        </div>
        <div style={{ background: 'var(--surface-2)', borderRadius: 8, padding: 16, fontFamily: 'monospace', fontSize: 12, lineHeight: 2.2, color: 'var(--text-muted)', marginBottom: 14 }}>
          <div><span style={{ color: '#8888ff' }}>DATABASE_URL</span>=<span style={{ color: '#88cc88' }}>postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require</span></div>
          <div><span style={{ color: '#8888ff' }}>LIVEKIT_URL</span>=<span style={{ color: '#88cc88' }}>wss://your-instance.livekit.cloud</span></div>
          <div><span style={{ color: '#8888ff' }}>LIVEKIT_API_KEY</span>=<span style={{ color: '#88cc88' }}>APIxxxxxxxxxxxxxxx</span></div>
          <div><span style={{ color: '#8888ff' }}>LIVEKIT_API_SECRET</span>=<span style={{ color: '#88cc88' }}>your_secret_here</span></div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>After editing .env.local, restart the dev server with <code style={{ background: 'var(--surface-3)', padding: '1px 6px', borderRadius: 4 }}>npm run dev</code></p>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ background: 'rgba(136,136,255,0.15)', borderRadius: 8, padding: 8 }}><Database size={18} color="#8888ff" /></div>
          <div><div style={{ fontWeight: 600 }}>Database Diagnostics</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Test your Neon DB connection</div></div>
        </div>
        <button className="btn-ghost" onClick={runDebug} disabled={debugLoading}>
          {debugLoading ? 'Running...' : 'Run Diagnostics'}
        </button>
        {debug && (
          <div style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>Environment Variables</div>
              {Object.entries(debug.env || {}).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontFamily: 'monospace', color: '#8888ff' }}>{k}</span>
                  <span style={{ color: v.includes('NOT SET') ? '#ff8080' : '#50cd50' }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, background: debug.db?.status === 'connected' ? 'rgba(50,205,50,0.1)' : 'rgba(255,80,80,0.1)', border: `1px solid ${debug.db?.status === 'connected' ? 'rgba(50,205,50,0.3)' : 'rgba(255,80,80,0.3)'}` }}>
              {debug.db?.status === 'connected' ? <CheckCircle size={15} color="#50cd50" /> : <AlertCircle size={15} color="#ff8080" />}
              <div style={{ fontSize: 13, color: debug.db?.status === 'connected' ? '#50cd50' : '#ff8080' }}>
                {debug.db?.status === 'connected' ? `Connected to "${debug.db.database}"` : debug.db?.error}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ background: 'rgba(245,197,24,0.15)', borderRadius: 8, padding: 8 }}><Zap size={18} color="var(--gold)" /></div>
          <div><div style={{ fontWeight: 600 }}>LiveKit Connection</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Test real-time voice infrastructure</div></div>
        </div>
        <button className="btn-ghost" onClick={testLiveKit} disabled={lkLoading}>{lkLoading ? 'Testing...' : 'Test LiveKit'}</button>
        {lkStatus && (
          <div style={{ marginTop: 14 }}>
            {lkStatus.error ? (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 14px', borderRadius: 8, background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)' }}>
                <AlertCircle size={15} color="#ff8080" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 13, color: '#ff8080' }}>{lkStatus.error}</span>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 12 }}>
                {[['Active Rooms', lkStatus.activeRooms], ['Participants', lkStatus.totalParticipants]].map(([k, v]) => (
                  <div key={String(k)} style={{ flex: 1, background: 'rgba(50,205,50,0.1)', border: '1px solid rgba(50,205,50,0.3)', borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#50cd50', fontFamily: 'var(--font-display)' }}>{String(v)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{String(k)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>Quick Links</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            ['View diagnostics JSON', '/api/debug'],
            ['Check DB health', '/api/health'],
            ['LiveKit status', '/api/livekit'],
          ].map(([label, href]) => (
            <a key={href} href={href} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--gold)', textDecoration: 'none' }}>
              <ExternalLink size={13} />{label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
