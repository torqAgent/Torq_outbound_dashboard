'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Papa from 'papaparse'
import { Upload, FileText, CheckCircle, AlertCircle, X, Info } from 'lucide-react'

interface Campaign { id: number; name: string }
interface Row { name: string; phone: string; [k: string]: string }

export default function UploadPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [campaignId, setCampaignId] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [fileName, setFileName] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ inserted: number; skipped: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const loadCampaigns = useCallback(async () => {
    try {
      const res = await fetch('/api/campaigns')
      if (res.ok) {
        const d = await res.json()
        setCampaigns(d)
        if (d.length) setCampaignId(String(d[0].id))
      }
    } catch {}
  }, [])

  useEffect(() => { loadCampaigns() }, [loadCampaigns])

  const parseFile = (file: File) => {
    setFileName(file.name); setErrors([]); setResult(null); setRows([])
    Papa.parse<Row>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.trim().toLowerCase(),
      complete: ({ data, meta }) => {
        const cols = (meta.fields || []).map(f => f.toLowerCase())
        const errs: string[] = []
        if (!cols.includes('name')) errs.push('Missing required column: name')
        if (!cols.includes('phone')) errs.push('Missing required column: phone')
        if (errs.length > 0) { setErrors(errs); return }
        const invalid = data.filter(r => !r.phone?.toString().trim()).length
        if (invalid > 0) errs.push(`${invalid} rows missing phone number (they will be skipped)`)
        if (errs.length) setErrors(errs)
        setRows(data.filter(r => r.phone?.toString().trim()))
      },
      error: (err: { message: string }) => setErrors([`CSV parse error: ${err.message}`])
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) parseFile(file)
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) parseFile(file)
  }

  const pushToDB = async () => {
    if (!campaignId || rows.length === 0) return
    setUploading(true)
    setErrors([])
    try {
      const contacts = rows.map(r => {
        const { name, phone, ...rest } = r
        return { name: name?.trim() || 'Unknown', phone: phone?.toString().trim(), metadata: rest }
      })
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign_id: parseInt(campaignId), contacts }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrors([data.error || `Server error ${res.status}`])
      } else {
        setResult({ inserted: data.inserted, skipped: data.skipped })
        setRows([]); setFileName('')
        if (inputRef.current) inputRef.current.value = ''
      }
    } catch (e) {
      setErrors([`Network error: ${String(e)}`])
    }
    setUploading(false)
  }

  const clear = () => { setRows([]); setFileName(''); setErrors([]); setResult(null); if (inputRef.current) inputRef.current.value = '' }

  return (
    <div className="animate-in" style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 className="font-display" style={{ fontSize: 32, letterSpacing: 2, color: 'var(--gold)' }}>UPLOAD CONTACTS</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Import a CSV and push contacts to your campaign</p>
      </div>

      <div style={{ background: 'rgba(245,197,24,0.06)', border: '1px solid rgba(245,197,24,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 20, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <Info size={14} color="var(--gold)" style={{ marginTop: 2, flexShrink: 0 }} />
        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          If upload fails with a server error, visit <code style={{ background: 'var(--surface-3)', padding: '1px 6px', borderRadius: 4 }}>/api/debug</code> to check your DB and LiveKit environment variables are set correctly in <code style={{ background: 'var(--surface-3)', padding: '1px 6px', borderRadius: 4 }}>.env.local</code>.
        </div>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <label>Target Campaign</label>
        {campaigns.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '8px 0' }}>No campaigns found — create one first</div>
        ) : (
          <select value={campaignId} onChange={e => setCampaignId(e.target.value)}>
            {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
      </div>

      {result && (
        <div style={{ background: 'rgba(50,205,50,0.1)', border: '1px solid rgba(50,205,50,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle size={16} color="#50cd50" />
          <span style={{ color: '#50cd50', fontSize: 13 }}>
            Successfully inserted <strong>{result.inserted}</strong> contacts
            {result.skipped > 0 ? `, ${result.skipped} skipped (duplicates)` : ''}
          </span>
        </div>
      )}

      {errors.length > 0 && (
        <div style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
          {errors.map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, color: '#ff8080', fontSize: 13, marginBottom: i < errors.length - 1 ? 6 : 0 }}>
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 2 }} />{e}
            </div>
          ))}
        </div>
      )}

      {!fileName ? (
        <div
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onClick={() => inputRef.current?.click()}
          style={{ border: `2px dashed ${dragging ? 'var(--gold)' : 'var(--border)'}`, borderRadius: 12, padding: '52px 24px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', background: dragging ? 'rgba(245,197,24,0.04)' : 'transparent' }}
        >
          <Upload size={32} style={{ margin: '0 auto 12px', color: dragging ? 'var(--gold)' : 'var(--text-muted)' }} />
          <p style={{ fontWeight: 500, marginBottom: 6 }}>Drop your CSV here or click to browse</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Required columns: <strong style={{ color: 'var(--gold)' }}>name</strong>, <strong style={{ color: 'var(--gold)' }}>phone</strong></p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Extra columns are stored as metadata</p>
          <input ref={inputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFile} />
        </div>
      ) : (
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FileText size={20} color="var(--gold)" />
              <div>
                <div style={{ fontWeight: 500 }}>{fileName}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{rows.length} rows ready to upload</div>
              </div>
            </div>
            <button onClick={clear} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={16} /></button>
          </div>

          {rows.length > 0 && (
            <>
              <div style={{ overflow: 'auto', maxHeight: 280, marginBottom: 16, borderRadius: 8, border: '1px solid var(--border)' }}>
                <table>
                  <thead><tr>{Object.keys(rows[0]).slice(0, 6).map(k => <th key={k}>{k}</th>)}</tr></thead>
                  <tbody>
                    {rows.slice(0, 6).map((r, i) => (
                      <tr key={i}>{Object.values(r).slice(0, 6).map((v, j) => <td key={j} style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{String(v)}</td>)}</tr>
                    ))}
                    {rows.length > 6 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>+{rows.length - 6} more rows</td></tr>}
                  </tbody>
                </table>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-gold" onClick={pushToDB} disabled={uploading || !campaignId}>
                  {uploading ? 'Pushing to DB...' : `Push ${rows.length} Contacts`}
                </button>
                <button className="btn-ghost" onClick={clear}>Clear</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
