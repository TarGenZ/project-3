import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'

const TIMEOUT_MS = 10000

/**
 * Handles the OAuth / magic-link redirect from Supabase.
 * Does NOT call getSession() directly — AuthProvider's single listener
 * picks up the SIGNED_IN event automatically (detectSessionInUrl: true).
 * This page just waits for that to land in useAuth() then redirects.
 */
export default function AuthCallback() {
  const navigate = useNavigate()
  const { loading, isAuthenticated } = useAuth()
  const [timedOut, setTimedOut] = useState(false)
  const startRef = useRef(Date.now())

  const params = new URLSearchParams(window.location.search)
  const next = params.get('next') || '/'

  useEffect(() => {
    if (loading) return
    if (isAuthenticated) {
      navigate(next, { replace: true })
      return
    }
    const remaining = TIMEOUT_MS - (Date.now() - startRef.current)
    if (remaining <= 0) { setTimedOut(true); return }
    const timer = setTimeout(() => setTimedOut(true), remaining)
    return () => clearTimeout(timer)
  }, [loading, isAuthenticated, navigate, next])

  return (
    <div style={{
      minHeight: '60vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', textAlign: 'center', padding: '40px 24px',
    }}>
      {timedOut ? (
        <div>
          <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Sign-in didn't go through</p>
          <p style={{ fontSize: 14, color: 'var(--slate-light)', marginBottom: 20 }}>
            That took longer than expected — please try again.
          </p>
          <a href="/" className="inline-flex items-center gap-2 rounded-lg bg-violet px-4 py-2 text-sm font-semibold text-[#fff] transition hover:bg-violet-soft">Back to home</a>
        </div>
      ) : (
        <div>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            border: '2px solid var(--teal)', borderTopColor: 'transparent',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
          }} />
          <p style={{ color: 'var(--slate-light)', fontSize: 14 }}>Signing you in…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}
    </div>
  )
}
