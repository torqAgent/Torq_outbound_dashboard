'use client'

import { useState, useEffect } from 'react'

export default function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    const root = window.document.documentElement
    if (isDarkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [isDarkMode])

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg border shadow-sm transition-all flex items-center gap-2"
        style={{
          backgroundColor: 'var(--surface-2)',
          color: 'var(--text)',
          borderColor: 'var(--border)'
        }}
      >
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </button>
    </div>
  )
}