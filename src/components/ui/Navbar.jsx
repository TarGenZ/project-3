import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth.js'
import { useTheme } from '../../contexts/ThemeContext.jsx'
import { useState, useRef, useEffect } from 'react'
import AuthModal from './AuthModal.jsx'
import { ChevronDown, Menu, X, Hospital, Target, TrendingUp, Scale, BookOpen, ShieldCheck, User, Sun, Moon } from 'lucide-react'

const TOOLS = [
  { to: '/explore',          icon: Hospital,    label: 'College Explorer',   desc: 'Browse, rate & compare colleges',   status: 'live' },
  { to: '/shortlister',      icon: Target,      label: 'College Shortlister',desc: 'Get a list tailored to your rank',  status: 'soon' },
  { to: '/rank-predictor',   icon: TrendingUp,  label: 'Rank Predictor',     desc: 'Estimate AIR from your score',      status: 'soon' },
  { to: '/college-compare',  icon: Scale,       label: 'College Compare',    desc: 'Side-by-side comparisons',          status: 'soon' },
  { to: '/counselling-guide',icon: BookOpen,    label: 'Counselling Guide',  desc: 'Round-by-round walkthroughs',       status: 'soon' },
]

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth()
  const { isDark, toggle } = useTheme()
  const location = useLocation()
  const [showAuth, setShowAuth] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const isActive = (path) =>
    (location.pathname === path || location.pathname.startsWith(path + '/'))
      ? 'nav-link active' : 'nav-link'
  const isToolsActive = TOOLS.some(t => location.pathname.startsWith(t.to))

  useEffect(() => {
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setToolsOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setToolsOpen(false)
  }, [location.pathname])

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <div className="logo-mark">Rx</div>
            <span>
              <span style={{ color: 'var(--slate-light)', fontWeight: 400 }}>arpansarkar</span>
              <span style={{ color: 'var(--teal)' }}>/cutoffs</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="navbar-nav">
            <Link to="/" className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}>Home</Link>

            <div className="nav-dropdown" ref={dropdownRef}>
              <button
                className={`nav-link nav-dropdown-trigger ${isToolsActive ? 'active' : ''}`}
                onClick={() => setToolsOpen(o => !o)}
              >
                Tools <ChevronDown size={14} style={{ transform: toolsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
              </button>
              {toolsOpen && (
                <div className="nav-dropdown-menu fade-in">
                  {TOOLS.map(t => {
                    const Icon = t.icon
                    return (
                      <Link key={t.to} to={t.to} className="nav-dropdown-item">
                        <span className="nav-dropdown-icon"><Icon size={18} color="var(--fg)" /></span>
                        <span style={{ flex: 1 }}>
                          <span className="nav-dropdown-label">
                            {t.label}
                            {t.status === 'soon' && (
                              <span className="badge badge-aia" style={{ marginLeft: 8, fontSize: 10, padding: '1px 7px' }}>Soon</span>
                            )}
                          </span>
                          <span className="nav-dropdown-desc">{t.desc}</span>
                        </span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Admin: link to ecosystem dashboard on main site */}
            {isAdmin && (
              <a
                href="https://arpansarkar.org/dashboard"
                className="nav-link"
                style={{ color: 'var(--teal)' }}
              >
                <ShieldCheck size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'text-bottom' }} />
                Admin
              </a>
            )}
          </div>

          {/* Actions */}
          <div className="navbar-actions">
            {user ? (
              <>
                <span className="navbar-user-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {isAdmin
                    ? <><ShieldCheck size={14} /> Admin</>
                    : <><User size={14} /> {user.email?.split('@')[0]}</>}
                </span>
                <button className="btn btn-ghost btn-sm" onClick={signOut}>Sign Out</button>
              </>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => setShowAuth(true)}>
                Sign In
              </button>
            )}

            {/* Theme toggle */}
            <button
              className="btn btn-ghost btn-sm theme-toggle"
              onClick={toggle}
              aria-label="Toggle theme"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{ padding: '6px 8px' }}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Mobile hamburger */}
            <button className="mobile-menu-btn" onClick={() => setMobileOpen(o => !o)} aria-label="Toggle menu">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="mobile-menu fade-in">
            <Link to="/" className={location.pathname === '/' ? 'mobile-nav-link active' : 'mobile-nav-link'}>Home</Link>

            <button className="mobile-nav-link mobile-nav-toggle" onClick={() => setMobileToolsOpen(o => !o)}>
              Tools
              <ChevronDown size={16} style={{ transform: mobileToolsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
            </button>
            {mobileToolsOpen && (
              <div className="mobile-submenu">
                {TOOLS.map(t => {
                  const Icon = t.icon
                  return (
                    <Link key={t.to} to={t.to} className="mobile-nav-sublink">
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon size={15} /> {t.label}</span>
                      {t.status === 'soon' && <span className="badge badge-aia" style={{ fontSize: 10, padding: '1px 7px' }}>Soon</span>}
                    </Link>
                  )
                })}
              </div>
            )}

            {isAdmin && (
              <a href="https://arpansarkar.org/dashboard" className="mobile-nav-link" style={{ color: 'var(--teal)' }}>
                Admin Dashboard ↗
              </a>
            )}

            <div className="mobile-menu-divider" />

            {user ? (
              <>
                <span className="mobile-nav-link" style={{ color: 'var(--slate-light)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {isAdmin ? <><ShieldCheck size={14} /> Admin</> : <><User size={14} /> {user.email}</>}
                </span>
                <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={signOut}>
                  Sign Out
                </button>
              </>
            ) : (
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { setMobileOpen(false); setShowAuth(true) }}>
                Sign In
              </button>
            )}
          </div>
        )}
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
