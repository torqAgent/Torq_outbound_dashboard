'use client'
import { useState, useEffect, useCallback } from 'react'
import { Search, Users } from 'lucide-react'
import type { Contact, Campaign } from '@/lib/types'

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [filterCampaign, setFilterCampaign] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const PER_PAGE = 25

  const load = useCallback(async () => {
    const params = new URLSearchParams()
    if (filterCampaign) params.set('campaign_id', filterCampaign)
    if (filterStatus) params.set('status', filterStatus)
    const res = await fetch(`/api/contacts?${params}`)
    if (res.ok) setContacts(await res.json())
  }, [filterCampaign, filterStatus])

  useEffect(() => { load() }, [load])
  useEffect(() => { fetch('/api/campaigns').then(r => r.ok ? r.json() : []).then(setCampaigns) }, [])

  const filtered = contacts.filter(c => !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search))
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const pages = Math.ceil(filtered.length / PER_PAGE)

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 28 }}>
        <h1 className="font-display" style={{ fontSize: 32, letterSpacing: 2, color: 'var(--gold)' }}>CONTACTS</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>{filtered.length} contacts found</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input style={{ paddingLeft: 34 }} placeholder="Search by name or phone..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <select style={{ width: 180 }} value={filterCampaign} onChange={e => { setFilterCampaign(e.target.value); setPage(1) }}>
          <option value="">All Campaigns</option>
          {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select style={{ width: 160 }} value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}>
          <option value="">All Statuses</option>
          {['pending','called','completed','failed','do_not_call'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr><th>Name</th><th>Phone</th><th>Campaign</th><th>Status</th><th>Follow-up At</th><th>Attempts</th><th>Created</th></tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                <Users size={28} style={{ margin: '0 auto 8px', opacity: 0.4 }} /><br/>No contacts found
              </td></tr>
            ) : paged.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 500 }}>{c.name}</td>
                <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{c.phone}</td>
                <td style={{ color: 'var(--text-muted)' }}>{c.campaign_name || c.campaign_id}</td>
                <td><span className={`status-badge status-${c.status}`}>{c.status}</span></td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{c.follow_up_at ? new Date(c.follow_up_at).toLocaleString() : '-'}</td>
                <td style={{ textAlign: 'center', color: c.follow_up_attempts > 0 ? 'var(--gold)' : 'var(--text-muted)' }}>{c.follow_up_attempts}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: 16, borderTop: '1px solid var(--border)' }}>
            <button className="btn-ghost" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
            <span style={{ padding: '5px 12px', color: 'var(--text-muted)', fontSize: 13 }}>{page} / {pages}</span>
            <button className="btn-ghost" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>Next</button>
          </div>
        )}
      </div>
    </div>
  )
}
