import type { Metadata } from 'next'
import './globals.css'
import ThemeToggle from './ThemeToggle'

export const metadata: Metadata = {
  title: 'Torq Agents Dashboard',
  description: 'Outbound Call Campaign Management'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="transition-colors duration-200">
        <ThemeToggle />
        {children}
      </body>
    </html>
  )
}