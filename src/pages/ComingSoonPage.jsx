import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, Target, TrendingUp, Scale, BookOpen, Construction } from 'lucide-react'

const TOOL_INFO = {
  '/shortlister': {
    icon: Target,
    title: 'College Shortlister',
    desc: 'Enter your NEET rank, category, and state preference — get a personalized shortlist of colleges you can realistically get into, ranked by your chances across rounds.',
  },
  '/rank-predictor': {
    icon: TrendingUp,
    title: 'Rank Predictor',
    desc: 'Estimate your All India Rank and category rank from your NEET score using historical percentile data and previous years\' results.',
  },
  '/college-compare': {
    icon: Scale,
    title: 'College Compare',
    desc: 'Pick two or more colleges and compare them side-by-side across all 10 rating parameters, fees, seats, and cutoff trends.',
  },
  '/counselling-guide': {
    icon: BookOpen,
    title: 'Counselling Guide',
    desc: 'Step-by-step walkthroughs for AIQ and state counselling rounds — choice filling, document verification, seat allotment, and reporting deadlines.',
  },
}

export default function ComingSoonPage() {
  const location = useLocation()
  const info = TOOL_INFO[location.pathname] || {
    icon: Construction, title: 'Coming Soon', desc: 'This tool is under development.',
  }
  const Icon = info.icon

  return (
    <div className="page-container">
      <div style={{ padding: '80px 0', textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 18, background: 'var(--teal-dim)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <Icon size={32} color="var(--white)" />
        </div>
        <span className="badge badge-aia" style={{ marginBottom: 16, display: 'inline-flex' }}>Coming Soon</span>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, marginBottom: 12 }}>{info.title}</h1>
        <p style={{ fontSize: 15, color: 'var(--slate-light)', lineHeight: 1.7, marginBottom: 32 }}>{info.desc}</p>
        <Link to="/" className="btn btn-secondary">
          <ArrowLeft size={14} /> Back to Home
        </Link>
      </div>
    </div>
  )
}
