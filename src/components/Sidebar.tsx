'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Megaphone, Upload, Users, PhoneCall, Settings } from 'lucide-react'

const links = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/campaigns', label: 'Campaigns', icon: Megaphone },
  { href: '/dashboard/upload', label: 'Upload CSV', icon: Upload },
  { href: '/dashboard/contacts', label: 'Contacts', icon: Users },
  { href: '/dashboard/calls', label: 'Call Logs', icon: PhoneCall },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const path = usePathname()
  return (
    <aside style={{ width: 220, minWidth: 220, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }}>
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
        <Image src="/logo.jpeg" alt="Torq Agents" width={160} height={60} style={{ objectFit: 'contain', width: '100%', height: 'auto' }} priority />
      </div>
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={`sidebar-link ${path === href ? 'active' : ''}`}>
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Observe &gt; Think &gt; Create</div>
      </div>
    </aside>
  )
}
