import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth.js'
import { useTheme } from '../../contexts/ThemeContext.jsx'
import { useState, useRef, useEffect } from 'react'
import AuthModal from './AuthModal.jsx'
import { ChevronDown, Hospital, Target, TrendingUp, Scale, BookOpen, ShieldCheck, Sun, Moon } from 'lucide-react'

const TOOLS = [
  { to: '/explore',           icon: Hospital,   label: 'College Explorer',    desc: 'Browse, rate & compare colleges',  status: 'live'  },
  { to: '/shortlister',       icon: Target,     label: 'College Shortlister', desc: 'Get a list tailored to your rank', status: 'soon'  },
  { to: '/rank-predictor',    icon: TrendingUp, label: 'Rank Predictor',      desc: 'Estimate AIR from your score',     status: 'soon'  },
  { to: '/college-compare',   icon: Scale,      label: 'College Compare',     desc: 'Side-by-side comparisons',         status: 'soon'  },
  { to: '/counselling-guide', icon: BookOpen,   label: 'Counselling Guide',   desc: 'Round-by-round walkthroughs',      status: 'soon'  },
]

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth()
  const { isDark, toggle }         = useTheme()
  const location                   = useLocation()
  const [showAuth,      setShowAuth]      = useState(false)
  const [mobileOpen,    setMobileOpen]    = useState(false)
  const [toolsExpanded, setToolsExpanded] = useState(false)
  const [toolsHover,    setToolsHover]    = useState(false)
  const hoverTimer  = useRef(null)

  const menuEnter = () => { clearTimeout(hoverTimer.current); setToolsHover(true)  }
  const menuLeave = () => { hoverTimer.current = setTimeout(() => setToolsHover(false), 90) }

  const isToolsActive = TOOLS.some(t => location.pathname.startsWith(t.to))

  useEffect(() => { setMobileOpen(false); setToolsExpanded(false) }, [location.pathname])
  useEffect(() => {
    const r = () => { if (window.innerWidth >= 860) setMobileOpen(false) }
    window.addEventListener('resize', r)
    return () => window.removeEventListener('resize', r)
  }, [])
  useEffect(() => () => clearTimeout(hoverTimer.current), [])

  return (
    <>
      <nav className="sticky top-0 z-[100] border-b border-line/20 bg-base/[0.95] backdrop-blur-[20px]">
        <div className="mx-auto flex h-16 max-w-page items-center justify-between gap-4 px-4 sm:px-6">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 text-[18px] font-bold tracking-[-0.5px]">
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-gradient-to-br from-violet to-[#6D28D9] text-sm font-extrabold text-[#fff]">
              Rx
            </div>
            <span>
              <span className="font-normal text-white/60">arpansarkar</span>
              <span className="text-violet">/cutoffs</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 md:flex">
            <Link to="/"
              className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${location.pathname === '/' ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
              Home
            </Link>

            {/* Hover-triggered Tools dropdown */}
            <div className="relative" onMouseEnter={menuEnter} onMouseLeave={menuLeave}>
              <button className={`flex items-center gap-1 rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${isToolsActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
                Tools
                <ChevronDown size={13} className={`transition-transform duration-200 ${toolsHover ? 'rotate-180' : ''}`} />
              </button>
              {toolsHover && (
                <div className="animate-fade-in absolute left-0 top-full z-[200] mt-2 w-[280px] overflow-hidden rounded-xl border border-line/20 bg-panel p-1.5 shadow-glow">
                  {TOOLS.map(t => {
                    const Icon = t.icon
                    return (
                      <Link key={t.to} to={t.to}
                        className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition hover:bg-white/5">
                        <span className="mt-0.5 text-white/60"><Icon size={17} /></span>
                        <span className="flex-1">
                          <span className="flex items-center gap-2 text-sm font-semibold text-white">
                            {t.label}
                            {t.status === 'soon' && (
                              <span className="rounded-full bg-violet/15 px-1.5 py-0.5 text-[10px] font-semibold text-violet">Soon</span>
                            )}
                          </span>
                          <span className="text-xs text-white/50">{t.desc}</span>
                        </span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {isAdmin && (
              <a href="https://arpansarkar.org/dashboard"
                className="flex items-center gap-1 rounded-lg px-3.5 py-1.5 text-sm font-medium text-violet transition hover:bg-violet/10">
                <ShieldCheck size={13} /> Admin
              </a>
            )}
          </div>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2.5 md:flex">
            {user ? (
              <>
                {isAdmin && (
                  <span className="flex items-center gap-1.5 text-sm text-violet"><ShieldCheck size={14} /> Admin</span>
                )}
                <button onClick={signOut}
                  className="rounded-lg border border-line/20 px-3.5 py-1.5 text-sm text-white/60 transition hover:border-violet/40 hover:text-white">
                  Sign out
                </button>
              </>
            ) : (
              <button onClick={() => setShowAuth(true)}
                className="rounded-lg bg-violet px-4 py-1.5 text-sm font-semibold text-[#fff] transition hover:bg-violet-soft">
                Sign in
              </button>
            )}
            <button onClick={toggle} aria-label="Toggle theme"
              className="rounded-lg border border-line/20 p-2 text-white/50 transition hover:border-violet/40 hover:text-white">
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>

          {/* Mobile right: theme + hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <button onClick={toggle} aria-label="Toggle theme"
              className="rounded-lg border border-line/20 p-1.5 text-white/50 transition hover:text-white">
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button
              onClick={() => setMobileOpen(v => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-line/20 text-white"
            >
              <div className="relative h-3.5 w-4">
                <span className={`absolute left-0 top-0 h-[1.5px] w-full bg-current transition-all duration-200 ${mobileOpen ? 'translate-y-[6px] rotate-45' : ''}`} />
                <span className={`absolute left-0 top-1/2 h-[1.5px] w-full -translate-y-1/2 bg-current transition-all duration-200 ${mobileOpen ? 'scale-x-0 opacity-0' : ''}`} />
                <span className={`absolute bottom-0 left-0 h-[1.5px] w-full bg-current transition-all duration-200 ${mobileOpen ? '-translate-y-[6px] -rotate-45' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="animate-fade-in border-t border-line/20 bg-base px-4 pb-6 pt-3 md:hidden">
            {/* Tools accordion */}
            <button onClick={() => setToolsExpanded(v => !v)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white">
              Tools
              <ChevronDown size={15} className={`transition-transform duration-200 ${toolsExpanded ? 'rotate-180' : ''}`} />
            </button>
            {toolsExpanded && (
              <div className="mb-1 ml-3 mt-1 flex flex-col gap-0.5 border-l border-line/20 pl-3">
                {TOOLS.map(t => {
                  const Icon = t.icon
                  return (
                    <Link key={t.to} to={t.to}
                      className="flex items-center justify-between rounded-lg px-2.5 py-2 text-sm text-white/60 transition hover:bg-white/5 hover:text-white">
                      <span className="flex items-center gap-2"><Icon size={14} />{t.label}</span>
                      {t.status === 'soon' && (
                        <span className="rounded-full bg-violet/15 px-1.5 py-0.5 text-[10px] font-semibold text-violet">Soon</span>
                      )}
                    </Link>
                  )
                })}
              </div>
            )}

            <Link to="/"
              className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition ${location.pathname === '/' ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
              Home
            </Link>

            {isAdmin && (
              <a href="https://arpansarkar.org/dashboard"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm text-violet transition hover:bg-violet/10">
                <ShieldCheck size={14} /> Admin Dashboard ↗
              </a>
            )}

            <div className="my-2 h-px bg-line/20" />

            {user ? (
              <button onClick={signOut}
                className="w-full rounded-lg border border-line/20 py-2.5 text-center text-sm text-white/60 transition hover:border-violet/40 hover:text-white">
                Sign out
              </button>
            ) : (
              <button onClick={() => { setMobileOpen(false); setShowAuth(true) }}
                className="w-full rounded-lg bg-violet py-2.5 text-center text-sm font-semibold text-[#fff] transition hover:bg-violet-soft">
                Sign in
              </button>
            )}
          </div>
        )}
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
