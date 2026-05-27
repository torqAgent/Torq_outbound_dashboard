interface Room {
  name: string
  numParticipants: number
  creationTime: number
  metadata: string
}

export default function LiveKitPanel({ rooms }: { rooms: Room[] }) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#50cd50', display: 'inline-block', boxShadow: '0 0 6px #50cd50' }} className="pulse-gold" />
        <span style={{ fontWeight: 600, fontSize: 14 }}>Live Rooms</span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>{rooms.length} active</span>
      </div>
      <table>
        <thead>
          <tr><th>Room Name</th><th>Participants</th><th>Started</th><th>Metadata</th></tr>
        </thead>
        <tbody>
          {rooms.map(r => (
            <tr key={r.name}>
              <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.name}</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: r.numParticipants > 0 ? '#50cd50' : 'var(--text-muted)', display: 'inline-block' }} />
                  {r.numParticipants}
                </div>
              </td>
              <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{r.creationTime ? new Date(r.creationTime * 1000).toLocaleTimeString() : '-'}</td>
              <td style={{ color: 'var(--text-muted)', fontSize: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.metadata || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
