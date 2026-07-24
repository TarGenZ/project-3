import { Link } from 'react-router-dom'
import { useColleges } from '../hooks/useData'
import { Search, TrendingUp, Shield, BarChart2, ArrowRight, Hospital, Target, Scale, BookOpen } from 'lucide-react'

const FEATURES = [
  { icon: <Search size={22} />,    title: 'Explore Colleges',     desc: 'Filter 600+ MBBS colleges by state, type, rating, and fees.' },
  { icon: <BarChart2 size={22} />, title: 'Cutoff Trends',        desc: 'Interactive charts showing rank trends across rounds and years.' },
  { icon: <TrendingUp size={22}/>, title: '10-Parameter Rating',  desc: 'Transparent ratings for location, ROI, faculty, hostel & more.' },
  { icon: <Shield size={22} />,    title: 'All Quota Coverage',   desc: 'General, OBC, SC, ST, EWS — both All India and State quota data.' },
]
const TOOLS = [
  { to: '/explore',           icon: Hospital,   title: 'College Explorer',    desc: 'Browse, filter and rate every MBBS college with real cutoff data.',                   status: 'live'  },
  { to: '/shortlister',       icon: Target,     title: 'College Shortlister', desc: 'Enter your rank & category to get a personalized college shortlist.',                 status: 'soon'  },
  { to: '/rank-predictor',    icon: TrendingUp, title: 'Rank Predictor',      desc: 'Estimate your All India Rank from your NEET score.',                                   status: 'soon'  },
  { to: '/college-compare',   icon: Scale,      title: 'College Compare',     desc: 'Compare colleges side-by-side across ratings, fees & cutoffs.',                       status: 'soon'  },
  { to: '/counselling-guide', icon: BookOpen,   title: 'Counselling Guide',   desc: 'Round-by-round walkthroughs for AIQ & state counselling.',                            status: 'soon'  },
]

// Shared Tailwind patterns
const CARD = 'bg-panel border border-line/20 rounded-xl transition-all hover:border-violet/40 hover:shadow-violet'
const ICON_BOX = 'w-11 h-11 bg-violet/15 rounded-[10px] flex items-center justify-center text-violet mb-4 flex-shrink-0'

export default function HomePage() {
  const { colleges } = useColleges()

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="hero-glow relative overflow-hidden py-14 text-center md:py-20">
        <div className="max-w-page mx-auto px-4 sm:px-6">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[2px] text-violet">
            India's Most Complete MBBS Database
          </p>
          <h1 className="mb-5 text-[clamp(36px,6vw,64px)] font-extrabold leading-[1.1] tracking-tight text-white">
            Find Your <span className="text-violet">Right Medical</span>
            <br />College
          </h1>
          <p className="mx-auto mb-9 max-w-[560px] text-lg text-white/60">
            Real cutoff data across all quotas. Transparent ratings. No noise — just the data you need to make the best decision.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/explore" className="inline-flex items-center gap-2 rounded-lg bg-violet px-7 py-3 text-[15px] font-semibold text-[#fff] transition hover:bg-violet-soft">
              <Search size={16} /> Explore Colleges
            </Link>
            <Link to="/explore" className="inline-flex items-center gap-2 rounded-lg border border-line/30 bg-panel px-7 py-3 text-[15px] font-semibold text-white/80 transition hover:border-violet/40">
              View Cutoffs
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-10 md:gap-12">
            {[
              { num: `${colleges.length}+`, label: 'Colleges Indexed' },
              { num: '10',                  label: 'Rating Parameters' },
              { num: 'All',                 label: 'Quotas Covered' },
              { num: '3+',                  label: 'Years of Data' },
            ].map(s => (
              <div key={s.label}>
                <p className="font-mono text-[32px] font-extrabold text-violet">{s.num}</p>
                <p className="mt-1 text-sm text-white/60">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tools grid ───────────────────────────────────────────────── */}
      <div className="max-w-page mx-auto px-4 pb-0 pt-16 sm:px-6">
        <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-[2px] text-violet">
          Your NEET UG Toolkit
        </p>
        <h2 className="mb-10 text-center text-[28px] font-extrabold tracking-tight text-white">
          Tools to help you choose right
        </h2>
        <div className="mb-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map(t => {
            const Icon = t.icon
            return (
              <Link key={t.to} to={t.to} className={`${CARD} relative block p-6`}>
                {t.status === 'soon' && (
                  <span className="absolute right-5 top-5 rounded-full bg-violet/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet">
                    Soon
                  </span>
                )}
                <div className={ICON_BOX}><Icon size={22} /></div>
                <p className="mb-2 text-base font-bold text-white">{t.title}</p>
                <p className="mb-4 text-sm leading-relaxed text-white/60">{t.desc}</p>
                <span className="flex items-center gap-1 text-sm font-semibold text-violet">
                  {t.status === 'live' ? 'Open tool' : 'Learn more'} <ArrowRight size={14} />
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* ── Features grid ────────────────────────────────────────────── */}
      <div className="max-w-page mx-auto px-4 pb-16 sm:px-6">
        <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-[2px] text-violet">
          Why MedExplore
        </p>
        <h2 className="mb-10 text-center text-[28px] font-extrabold tracking-tight text-white">
          Everything you need to choose wisely
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(f => (
            <div key={f.title} className={`${CARD} p-6`}>
              <div className={ICON_BOX}>{f.icon}</div>
              <p className="mb-2 text-base font-bold text-white">{f.title}</p>
              <p className="text-sm leading-relaxed text-white/60">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA banner */}
        <div className="mt-16 rounded-2xl border border-line/20 bg-panel px-8 py-10 text-center">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[2px] text-violet">Free Access</p>
          <h3 className="mb-2 text-2xl font-extrabold text-white">Start exploring for free</h3>
          <p className="mb-6 text-[15px] text-white/60">
            Browse all college info free. Get 1 free cutoff data access on sign up.
          </p>
          <Link to="/explore" className="inline-flex items-center gap-2 rounded-lg bg-violet px-7 py-3 text-[15px] font-semibold text-[#fff] transition hover:bg-violet-soft">
            Browse All Colleges <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}
