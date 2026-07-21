import { useState } from 'react'
import { X, ArrowLeft } from 'lucide-react'
import { signInWithEmailOtp, verifyEmailOtp, signInWithGoogle } from '../../auth/AuthService.js'

const GOOGLE_SVG = (
  <svg width="16" height="16" viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0 }}>
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61c-.28 1.43-1.1 2.63-2.36 3.43l3.76 2.92c2.2-2.03 3.46-5.02 3.46-8.2z"/>
    <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.96-2.91l-3.76-2.92c-1.04.7-2.38 1.12-4.2 1.12-3.23 0-5.97-2.18-6.95-5.11H1.19v3.01C3.18 21.12 7.27 24 12 24z"/>
    <path fill="#FBBC05" d="M5.05 14.18a7.16 7.16 0 0 1 0-4.36V6.81H1.19a11.99 11.99 0 0 0 0 10.38l3.86-3.01z"/>
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.96 1.19 15.24 0 12 0 7.27 0 3.18 2.88 1.19 6.81l3.86 3.01c.98-2.93 3.72-5.07 6.95-5.07z"/>
  </svg>
)

export default function AuthModal({ onClose }) {
  const [step, setStep] = useState('email') // 'email' | 'code'
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const sendOtp = async () => {
    const trimmed = email.trim()
    if (!trimmed) { setError('Enter your email address.'); return }
    setError(''); setLoading(true)
    try {
      await signInWithEmailOtp(trimmed, { shouldCreateUser: true })
      setStep('code')
    } catch (err) {
      setError(err.message || 'Failed to send code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    if (!code.trim()) { setError('Enter the code from your email.'); return }
    setError(''); setLoading(true)
    try {
      await verifyEmailOtp(email.trim(), code.trim())
      onClose()
    } catch (err) {
      setError(err.message || 'Invalid or expired code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError(''); setLoading(true)
    try {
      await signInWithGoogle(window.location.pathname)
      // Google redirects away — no finally cleanup needed
    } catch (err) {
      setError(err.message || 'Google sign-in failed.')
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal fade-in">
        <button
          className="btn btn-ghost btn-sm"
          style={{ position: 'absolute', top: 16, right: 16 }}
          onClick={onClose}
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {step === 'email' ? (
          <>
            <p className="modal-title">Sign in to Cutoffs</p>
            <p className="modal-sub">
              Free account — unlock full cutoff data for every college, every round.
            </p>

            {error && <div className="form-error">{error}</div>}

            {/* Google */}
            <button
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center', gap: 10, marginBottom: 16 }}
              onClick={handleGoogle}
              disabled={loading}
            >
              {GOOGLE_SVG} Continue with Google
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 11, color: 'var(--slate-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>or email</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            {/* Email OTP */}
            <div className="form-fields">
              <div className="field-group">
                <label className="field-label">Email address</label>
                <input
                  className="field-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendOtp()}
                  autoFocus
                />
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={sendOtp}
              disabled={loading}
            >
              {loading ? 'Sending…' : 'Send sign-in code'}
            </button>

            <p style={{ fontSize: 12, color: 'var(--slate-light)', textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
              We'll email you a 6-digit code — no password needed.
              New users are registered automatically.
            </p>
          </>
        ) : (
          <>
            <button
              className="btn btn-ghost btn-sm"
              style={{ marginBottom: 16, padding: '4px 0', gap: 6 }}
              onClick={() => { setStep('email'); setCode(''); setError('') }}
            >
              <ArrowLeft size={14} /> Back
            </button>

            <p className="modal-title">Check your email</p>
            <p className="modal-sub">
              We sent a 6-digit code to <strong style={{ color: 'var(--fg)' }}>{email}</strong>.
              Enter it below.
            </p>

            {error && <div className="form-error">{error}</div>}

            <div className="form-fields">
              <div className="field-group">
                <label className="field-label">6-digit code</label>
                <input
                  className="field-input"
                  type="text"
                  inputMode="numeric"
                  placeholder="123456"
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={e => e.key === 'Enter' && verifyOtp()}
                  autoFocus
                  style={{ fontFamily: 'DM Mono, monospace', letterSpacing: '0.15em', fontSize: 18 }}
                />
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={verifyOtp}
              disabled={loading}
            >
              {loading ? 'Verifying…' : 'Sign in'}
            </button>

            <p style={{ fontSize: 12, color: 'var(--slate-light)', textAlign: 'center', marginTop: 16 }}>
              Didn't get it?{' '}
              <span
                style={{ color: 'var(--teal)', cursor: 'pointer' }}
                onClick={() => { setStep('email'); setCode(''); setError('') }}
              >
                Resend code
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
