import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const ThemeContext = createContext({})
export const useTheme = () => useContext(ThemeContext)

// Detect system preference
function getSystemTheme() {
  try {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  } catch { return 'dark' }
}

// Priority: localStorage override > system default
function getInitialTheme() {
  try {
    const saved = localStorage.getItem('medexplore-theme')
    return saved || getSystemTheme()
  } catch { return 'dark' }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)
  const [transitioning, setTransitioning] = useState(false)

  // Apply theme to <html> attribute immediately on mount and change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('medexplore-theme', theme) } catch {}
  }, [theme])

  // Listen for system theme changes (only if user hasn't manually overridden)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const handler = (e) => {
      const hasOverride = !!localStorage.getItem('medexplore-theme')
      if (!hasOverride) setTheme(e.matches ? 'light' : 'dark')
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const toggle = useCallback(() => {
    setTransitioning(true)
    // Short delay so the overlay renders before theme flips
    setTimeout(() => {
      setTheme(t => t === 'dark' ? 'light' : 'dark')
    }, 80)
    // Hide overlay after 2 seconds
    setTimeout(() => {
      setTransitioning(false)
    }, 2000)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggle, isDark: theme === 'dark', transitioning }}>
      {children}
      {transitioning && <ThemeTransitionOverlay />}
    </ThemeContext.Provider>
  )
}

function ThemeTransitionOverlay() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(18px) saturate(0.4)',
      WebkitBackdropFilter: 'blur(18px) saturate(0.4)',
      background: 'rgba(127,127,127,0.08)',
      animation: 'theme-overlay-in 0.15s ease forwards',
      pointerEvents: 'all',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        animation: 'theme-pulse 1.2s ease-in-out infinite',
      }}>
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
          stroke="var(--teal)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
          style={{ animation: 'theme-spin 1.2s linear infinite' }}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <span style={{
          fontSize: 15, fontWeight: 600, letterSpacing: 0.5,
          color: 'var(--teal)', fontFamily: 'Inter, sans-serif',
        }}>
          Refreshing…
        </span>
      </div>
    </div>
  )
}
