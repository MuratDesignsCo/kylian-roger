'use client'

import { useCallback, useState } from 'react'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    document.body.classList.add('theme-transitioning')
    document.body.classList.toggle('dark')
    setIsDark((prev) => !prev)
    setTimeout(() => {
      document.body.classList.remove('theme-transitioning')
    }, 550)
  }, [])

  return (
    <div className="nav-home_toggle" onClick={handleToggle} role="button" tabIndex={0}>
      <div className="toggle">
        <div className="toggle-dot"></div>
      </div>
      <span className="toggle-label text-color-alternate">
        {isDark ? 'Dark' : 'Light'}
      </span>
    </div>
  )
}
