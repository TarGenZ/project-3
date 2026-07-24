import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, Target, TrendingUp, Scale, BookOpen, Construction } from 'lucide-react'

const TOOL_INFO = {
  '/shortlister':      { icon: Target,       title: 'College Shortlister', desc: 'Enter your NEET rank, category, and state preference — get a personalized shortlist of colleges you can realistically get into, ranked by your chances across rounds.' },
  '/rank-predictor':   { icon: TrendingUp,   title: 'Rank Predictor',      desc: "Estimate your All India Rank and category rank from your NEET score using historical percentile data and previous years' results." },
  '/college-compare':  { icon: Scale,        title: 'College Compare',     desc: 'Pick two or more colleges and compare them side-by-side across all 10 rating parameters, fees, seats, and cutoff trends.' },
  '/counselling-guide':{ icon: BookOpen,     title: 'Counselling Guide',   desc: 'Step-by-step walkthroughs for AIQ and state counselling rounds — choice filling, document verification, seat allotment, and reporting deadlines.' },
}

export default function ComingSoonPage() {
  const location = useLocation()
  const info = TOOL_INFO[location.pathname] || { icon: Construction, title: 'Coming Soon', desc: 'This tool is under development.' }
  const Icon = info.icon
  return (
    <div className="max-w-page mx-auto px-4 sm:px-6">
      <div className="mx-auto max-w-[560px] px-0 py-20 text-center">
        <div className="mx-auto mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-[18px] bg-violet/15 text-violet">
          <Icon size={32} />
        </div>
        <span className="mb-4 inline-flex rounded-full bg-violet/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet">
          Coming Soon
        </span>
        <h1 className="mb-3 mt-2 text-[28px] font-extrabold tracking-tight text-white">{info.title}</h1>
        <p className="mb-8 text-[15px] leading-[1.7] text-white/60">{info.desc}</p>
        <Link to="/" className="inline-flex items-center gap-2 rounded-lg border border-line/20 bg-panel px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:border-violet/40">
          <ArrowLeft size={14} /> Back to Home
        </Link>
      </div>
    </div>
  )
}
