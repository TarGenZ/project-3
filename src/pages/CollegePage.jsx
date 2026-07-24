import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCollege, useColleges, useQuotas } from '../hooks/useData.js'
import RatingRing, { getRatingColor } from '../components/ui/RatingRing.jsx'
import CutoffSection from '../components/cutoff/CutoffSection.jsx'
import GettingInSection from '../components/cutoff/GettingInSection.jsx'
import { RATING_PARAMS } from '../lib/mockData.js'
import { ParamIcon } from '../lib/icons.jsx'
import { ArrowLeft, MapPin, Calendar, Users, IndianRupee, ChevronRight, ChevronDown, GraduationCap, Star, Compass } from 'lucide-react'

const TYPE_BADGE  = { government: 'bg-green-500/15 text-green-500', private: 'bg-amber/15 text-amber', deemed: 'bg-[#8B5CF6]/15 text-lavender' }
const EXPLORE_LINKS = [
  { to: '/explore',        icon: Compass,       title: 'All Colleges',        sub: 'Browse and filter by type, state, rating & fees' },
  { to: '/shortlister',    icon: GraduationCap, title: 'College Shortlister', sub: 'Get a list tailored to your rank' },
  { to: '/rank-predictor', icon: Star,          title: 'Rank Predictor',      sub: 'Estimate AIR from your NEET score' },
]

const SECTION = 'rounded-xl border border-line/20 bg-panel mb-3'

export default function CollegePage() {
  const { id }   = useParams()
  const { college, loading } = useCollege(id)
  const { colleges }         = useColleges()
  const { quotas, loading: quotasLoading } = useQuotas(id)
  const [aboutOpen, setAboutOpen] = useState(true)

  if (loading)   return <p className="py-20 text-center text-sm text-white/60">Loading…</p>
  if (!college)  return <p className="py-20 text-center text-sm text-white/60">College not found.</p>

  const typeLabel = college.type ? college.type.charAt(0).toUpperCase() + college.type.slice(1) : ''
  const similar   = colleges.filter(c => c.id !== college.id && c.state === college.state).sort((a,b) => (b.final_rating||0)-(a.final_rating||0)).slice(0,4)

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="border-b border-line/20 bg-panel py-6">
        <div className="max-w-page mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <div className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-white/60">
            <Link to="/" className="transition hover:text-violet">Home</Link>
            <ChevronRight size={12} />
            <Link to="/explore" className="transition hover:text-violet">Colleges</Link>
            <ChevronRight size={12} />
            <span className="font-medium text-white">{college.name}</span>
          </div>

          <Link to="/explore" className="mb-5 inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white">
            <ArrowLeft size={14} /> Back to Explorer
          </Link>

          <div className="flex flex-wrap items-start gap-6">
            <div className="flex-1">
              <span className={`mb-3 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${TYPE_BADGE[college.type] || TYPE_BADGE.government}`}>
                {typeLabel}
              </span>
              <h1 className="text-[26px] font-extrabold tracking-tight text-white md:text-[32px]">{college.name}</h1>
              <div className="mt-3 flex flex-wrap gap-5">
                <span className="flex items-center gap-1.5 text-sm text-white/60"><MapPin size={14}/>{college.city}, {college.state}</span>
                <span className="flex items-center gap-1.5 text-sm text-white/60"><Calendar size={14}/>Est. {college.year_established}</span>
              </div>
            </div>
            <div className="text-center">
              <RatingRing value={college.final_rating} size={96} strokeWidth={7} />
              <p className="mt-1.5 text-xs text-white/50">Overall Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-column body ───────────────────────────────────────────── */}
      <div className="mx-auto grid max-w-page grid-cols-1 lg:grid-cols-[1fr_340px]">

        {/* LEFT */}
        <div className="min-w-0 border-b border-line/20 px-4 py-4 pb-10 sm:px-6 lg:border-b-0 lg:border-r">

          {/* About collapsible */}
          {college.about && (
            <div className={`${SECTION} overflow-hidden`}>
              <button onClick={() => setAboutOpen(o => !o)}
                className="flex w-full items-center justify-between px-5 py-[18px] text-left"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
                <p className="text-xs font-bold uppercase tracking-wider text-violet">About the College</p>
                <ChevronDown size={16} style={{ color: 'var(--teal)', flexShrink: 0, transform: aboutOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }} />
              </button>
              <div style={{ maxHeight: aboutOpen ? '1000px' : '0px', overflow: 'hidden', transition: 'max-height 0.35s ease' }}>
                <p className="px-5 pb-5 text-sm leading-[1.8] text-white/60" style={{ whiteSpace: 'pre-line' }}>{college.about}</p>
              </div>
            </div>
          )}

          {!quotasLoading && quotas.length > 0 && <GettingInSection quotas={quotas} collegeName={college.name} />}
          <CutoffSection collegeId={id} />
        </div>

        {/* RIGHT sidebar */}
        <div className="px-4 py-4 pb-10 sm:px-6 lg:sticky lg:top-16 lg:max-h-[calc(100vh-64px)] lg:overflow-y-auto" style={{ scrollbarWidth: 'none' }}>

          {/* Quick stats */}
          <div className={`${SECTION} p-[18px]`}>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-violet">Quick Stats</p>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { icon: <Users size={15}/>,        label: 'MBBS Seats',  value: college.total_seats || '—' },
                { icon: <IndianRupee size={15}/>,   label: 'Annual Fees', value: college.annual_fees ? `₹${Number(college.annual_fees).toLocaleString('en-IN')}` : '—' },
                { icon: <Star size={15}/>,          label: 'Rating',      value: Number(college.final_rating).toFixed(1), color: getRatingColor(college.final_rating) },
                { icon: <GraduationCap size={15}/>, label: 'Type',        value: typeLabel },
              ].map(s => (
                <div key={s.label} className="flex flex-col items-start rounded-lg border border-line/20 bg-mid p-3">
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-violet/15 text-violet">{s.icon}</div>
                  <p className="text-[10px] uppercase tracking-wide text-white/50">{s.label}</p>
                  <p className="font-mono text-[17px] font-bold" style={s.color ? { color: s.color } : {}}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ratings breakdown */}
          <div className={`${SECTION} p-4`}>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-violet">Rating Breakdown</p>
            <div className="flex flex-col gap-2.5">
              {RATING_PARAMS.map(p => {
                const val = college[p.key] || 0
                const color = getRatingColor(val)
                return (
                  <div key={p.key} className="flex items-center gap-3">
                    <span className="flex w-[100px] flex-shrink-0 items-center gap-1 text-xs text-white/60">
                      <ParamIcon name={p.icon} size={13} /> {p.label}
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${val * 10}%`, background: color }} />
                    </div>
                    <span className="w-[30px] text-right font-mono text-xs font-medium" style={{ color }}>{val.toFixed(1)}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Worthness */}
          {college.worthness && (
            <div className={`${SECTION} p-4`}>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-violet">Is It Worth It?</p>
              <p className="text-sm leading-[1.7] text-white/60">{college.worthness}</p>
            </div>
          )}

          {/* College info */}
          <div className={`${SECTION} p-4`}>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-violet">College Info</p>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Type',        value: typeLabel },
                { label: 'Established', value: college.year_established || '—' },
                { label: 'MBBS Seats',  value: college.total_seats || '—' },
                { label: 'Annual Fees', value: college.annual_fees ? `₹${Number(college.annual_fees).toLocaleString('en-IN')}` : '—', teal: true },
                { label: 'City',        value: college.city  || '—' },
                { label: 'State',       value: college.state || '—' },
              ].map(({ label, value, teal }) => (
                <div key={label} className="flex items-baseline justify-between gap-2">
                  <p className="flex-shrink-0 text-[11px] uppercase tracking-[0.5px] text-white/50">{label}</p>
                  <p className={`text-right text-sm font-semibold ${teal ? 'text-violet' : 'text-white'}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Similar colleges */}
          {similar.length > 0 && (
            <div className={`${SECTION} p-4`}>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-violet">Similar in {college.state}</p>
              <div className="flex flex-col gap-2">
                {similar.map(c => (
                  <Link key={c.id} to={`/college/${c.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-line/20 bg-mid px-3 py-2.5 transition hover:border-violet/40">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{c.name}</p>
                      <p className="text-xs text-white/50">{c.city} · {c.total_seats || '—'} seats</p>
                    </div>
                    <RatingRing value={c.final_rating} size={36} strokeWidth={3} />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Explore more */}
          <div className={`${SECTION} p-4`} style={{ marginBottom: 0 }}>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-violet">Explore More</p>
            <div className="flex flex-col gap-2">
              {EXPLORE_LINKS.map(l => {
                const Icon = l.icon
                return (
                  <Link key={l.to} to={l.to}
                    className="flex items-center justify-between gap-3 rounded-lg border border-line/20 bg-mid px-3 py-2.5 transition hover:border-violet/40">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-lg bg-violet/15 text-violet"><Icon size={14}/></div>
                      <div>
                        <p className="text-sm font-semibold text-white">{l.title}</p>
                        <p className="text-[11px] text-white/50">{l.sub}</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-white/40" />
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
