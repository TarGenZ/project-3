import { useState } from 'react'
import { X, ArrowLeft } from 'lucide-react'
import { signInWithEmailOtp, verifyEmailOtp, signInWithGoogle } from '../../auth/AuthService.js'

const GOOGLE_SVG = (
  <svg width="16" height="16" viewBox="0 0 24 24" className="block flex-shrink-0">
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61c-.28 1.43-1.1 2.63-2.36 3.43l3.76 2.92c2.2-2.03 3.46-5.02 3.46-8.2z"/>
    <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.96-2.91l-3.76-2.92c-1.04.7-2.38 1.12-4.2 1.12-3.23 0-5.97-2.18-6.95-5.11H1.19v3.01C3.18 21.12 7.27 24 12 24z"/>
    <path fill="#FBBC05" d="M5.05 14.18a7.16 7.16 0 0 1 0-4.36V6.81H1.19a11.99 11.99 0 0 0 0 10.38l3.86-3.01z"/>
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.96 1.19 15.24 0 12 0 7.27 0 3.18 2.88 1.19 6.81l3.86 3.01c.98-2.93 3.72-5.07 6.95-5.07z"/>
  </svg>
)

const INPUT = 'w-full bg-white/5 border border-line/20 rounded-lg text-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-white/30 focus:border-violet/60 focus:bg-violet/5'
const BTN_PRIMARY = 'w-full inline-flex items-center justify-center gap-2 rounded-lg bg-violet px-5 py-2.5 text-sm font-semibold text-[#fff] transition hover:bg-violet-soft disabled:opacity-50 disabled:cursor-not-allowed'
const BTN_SECONDARY = 'w-full inline-flex items-center justify-center gap-2.5 rounded-lg border border-line/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:border-violet/40 hover:bg-white/10 disabled:opacity-50'

export default function AuthModal({ onClose }) {
  const [step,    setStep]    = useState('email')
  const [email,   setEmail]   = useState('')
  const [code,    setCode]    = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const sendOtp = async () => {
    const trimmed = email.trim()
    if (!trimmed) { setError('Enter your email address.'); return }
    setError(''); setLoading(true)
    try { await signInWithEmailOtp(trimmed, { shouldCreateUser: true }); setStep('code') }
    catch (err) { setError(err.message || 'Failed to send code. Please try again.') }
    finally     { setLoading(false) }
  }

  const verifyOtp = async () => {
    if (!code.trim()) { setError('Enter the code from your email.'); return }
    setError(''); setLoading(true)
    try { await verifyEmailOtp(email.trim(), code.trim()); onClose() }
    catch (err) { setError(err.message || 'Invalid or expired code. Please try again.') }
    finally     { setLoading(false) }
  }

  const handleGoogle = async () => {
    setError(''); setLoading(true)
    try { await signInWithGoogle(window.location.pathname) }
    catch (err) { setError(err.message || 'Google sign-in failed.'); setLoading(false) }
  }

  return (
    <div
      className="modal-overlay-bg fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="animate-fade-in relative w-full max-w-[420px] rounded-2xl border border-line/20 bg-panel p-6">
        <button onClick={onClose} aria-label="Close"
          className="absolute right-4 top-4 rounded-lg bg-white/5 p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white">
          <X size={16} />
        </button>

        {step === 'email' ? (
          <>
            <p className="mb-1.5 text-2xl font-extrabold text-white">Sign in to Cutoffs</p>
            <p className="mb-5 text-sm text-white/60">
              Free account — unlock full cutoff data for every college, every round.
            </p>

            {error && <div className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">{error}</div>}

            <button className={BTN_SECONDARY} onClick={handleGoogle} disabled={loading}>
              {GOOGLE_SVG} Continue with Google
            </button>

            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-line/20" />
              <span className="text-[11px] uppercase tracking-[0.5px] text-white/40">or email</span>
              <div className="h-px flex-1 bg-line/20" />
            </div>

            <div className="mb-5 flex flex-col gap-1.5">
              <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-white/60">Email address</label>
              <input className={INPUT} type="email" placeholder="you@example.com" value={email}
                onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendOtp()} autoFocus />
            </div>

            <button className={BTN_PRIMARY} onClick={sendOtp} disabled={loading}>
              {loading ? 'Sending…' : 'Send sign-in code'}
            </button>

            <p className="mt-4 text-center text-xs leading-relaxed text-white/40">
              We'll email you a 6-digit code — no password needed. New users are registered automatically.
            </p>
          </>
        ) : (
          <>
            <button onClick={() => { setStep('email'); setCode(''); setError('') }}
              className="mb-4 flex items-center gap-1.5 text-sm text-white/50 transition hover:text-white">
              <ArrowLeft size={14} /> Back
            </button>
            <p className="mb-1.5 text-2xl font-extrabold text-white">Check your email</p>
            <p className="mb-5 text-sm text-white/60">
              We sent a 6-digit code to <strong className="text-white">{email}</strong>. Enter it below.
            </p>

            {error && <div className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">{error}</div>}

            <div className="mb-5 flex flex-col gap-1.5">
              <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-white/60">6-digit code</label>
              <input className={`${INPUT} font-mono tracking-[0.15em] text-lg`}
                type="text" inputMode="numeric" placeholder="123456" maxLength={6}
                value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                onKeyDown={e => e.key === 'Enter' && verifyOtp()} autoFocus />
            </div>

            <button className={BTN_PRIMARY} onClick={verifyOtp} disabled={loading}>
              {loading ? 'Verifying…' : 'Sign in'}
            </button>

            <p className="mt-4 text-center text-xs text-white/40">
              Didn't get it?{' '}
              <span className="cursor-pointer text-violet hover:text-violet-soft"
                onClick={() => { setStep('email'); setCode(''); setError('') }}>
                Resend code
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
