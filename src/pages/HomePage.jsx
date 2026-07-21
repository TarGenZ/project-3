import { Link } from 'react-router-dom'
import { useColleges } from '../hooks/useData'
import { Search, TrendingUp, Shield, BarChart2, ArrowRight, Hospital, Target, Scale, BookOpen } from 'lucide-react'

const FEATURES = [
  { icon: <Search size={22} />, title: 'Explore Colleges', desc: 'Filter 600+ MBBS colleges by state, type, rating, and fees.' },
  { icon: <BarChart2 size={22} />, title: 'Cutoff Trends', desc: 'Interactive charts showing rank trends across rounds and years.' },
  { icon: <TrendingUp size={22} />, title: '10-Parameter Rating', desc: 'Transparent ratings for location, ROI, faculty, hostel & more.' },
  { icon: <Shield size={22} />, title: 'All Quota Coverage', desc: 'General, OBC, SC, ST, EWS — both All India and State quota data.' },
]

const TOOLS = [
  { to: '/explore', icon: Hospital, title: 'College Explorer', desc: 'Browse, filter and rate every MBBS college with real cutoff data.', status: 'live' },
  { to: '/shortlister', icon: Target, title: 'College Shortlister', desc: 'Enter your rank & category to get a personalized college shortlist.', status: 'soon' },
  { to: '/rank-predictor', icon: TrendingUp, title: 'Rank Predictor', desc: 'Estimate your All India Rank from your NEET score.', status: 'soon' },
  { to: '/college-compare', icon: Scale, title: 'College Compare', desc: 'Compare colleges side-by-side across ratings, fees & cutoffs.', status: 'soon' },
  { to: '/counselling-guide', icon: BookOpen, title: 'Counselling Guide', desc: 'Round-by-round walkthroughs for AIQ & state counselling.', status: 'soon' },
]

export default function HomePage() {
  const { colleges } = useColleges()

  return (
    <div>
      <div className="hero">
        <div className="page-container">
          <p className="hero-eyebrow">India's Most Complete MBBS Database</p>
          <h1 className="hero-title">
            Find Your <span>Right Medical</span><br />College
          </h1>
          <p className="hero-sub">
            Real cutoff data across all quotas. Transparent ratings. No noise — just the data you need to make the best decision.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/explore" className="btn btn-primary btn-lg">
              <Search size={16} /> Explore Colleges
            </Link>
            <Link to="/explore" className="btn btn-secondary btn-lg">View Cutoffs</Link>
          </div>

          <div className="hero-stats">
            <div>
              <p className="hero-stat-num">{colleges.length}+</p>
              <p className="hero-stat-label">Colleges Indexed</p>
            </div>
            <div>
              <p className="hero-stat-num">10</p>
              <p className="hero-stat-label">Rating Parameters</p>
            </div>
            <div>
              <p className="hero-stat-num">All</p>
              <p className="hero-stat-label">Quotas Covered</p>
            </div>
            <div>
              <p className="hero-stat-num">3+</p>
              <p className="hero-stat-label">Years of Data</p>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container" style={{ padding: '60px 24px 0' }}>
        <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--teal)', marginBottom: 12 }}>
          Your NEET UG Toolkit
        </p>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, letterSpacing: -1, marginBottom: 40 }}>
          Tools to help you choose right
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 60 }}>
          {TOOLS.map(t => {
            const Icon = t.icon
            return (
              <Link key={t.to} to={t.to} className="card" style={{ padding: 24, display: 'block', position: 'relative' }}>
                {t.status === 'soon' && (
                  <span className="badge badge-aia" style={{ position: 'absolute', top: 20, right: 20 }}>Soon</span>
                )}
                <div style={{ width: 44, height: 44, background: 'var(--teal-dim)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal)', marginBottom: 14 }}>
                  <Icon size={22} />
                </div>
                <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{t.title}</p>
                <p style={{ fontSize: 14, color: 'var(--slate-light)', lineHeight: 1.6, marginBottom: 14 }}>{t.desc}</p>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {t.status === 'live' ? 'Open tool' : 'Learn more'} <ArrowRight size={14} />
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="page-container" style={{ padding: '0 24px 60px' }}>
        <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--teal)', marginBottom: 12 }}>
          Why MedExplore
        </p>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, letterSpacing: -1, marginBottom: 40 }}>
          Everything you need to choose wisely
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {FEATURES.map(f => (
            <div key={f.title} className="card" style={{ padding: 24 }}>
              <div style={{ width: 44, height: 44, background: 'var(--teal-dim)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal)', marginBottom: 16 }}>
                {f.icon}
              </div>
              <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{f.title}</p>
              <p style={{ fontSize: 14, color: 'var(--slate-light)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--navy-light)', border: '1px solid var(--border)', borderRadius: 16, padding: '40px 32px', textAlign: 'center', marginTop: 60 }}>
          <p style={{ color: 'var(--teal)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>Free Access</p>
          <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Start exploring for free</h3>
          <p style={{ color: 'var(--slate-light)', fontSize: 15, marginBottom: 24 }}>
            Browse all college info free. Get 1 free cutoff data access on sign up.
          </p>
          <Link to="/explore" className="btn btn-primary btn-lg">Browse All Colleges <ArrowRight size={16} /></Link>
        </div>
      </div>
    </div>
  )
}
