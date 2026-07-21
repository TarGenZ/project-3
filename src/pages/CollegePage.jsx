import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCollege, useColleges, useQuotas } from '../hooks/useData.js'
import RatingRing, { getRatingColor } from '../components/ui/RatingRing.jsx'
import CutoffSection from '../components/cutoff/CutoffSection.jsx'
import GettingInSection from '../components/cutoff/GettingInSection.jsx'
import { RATING_PARAMS } from '../lib/mockData.js'
import { ParamIcon } from '../lib/icons.jsx'
import {
  ArrowLeft, MapPin, Calendar, Users, IndianRupee, ChevronRight,
  ChevronDown, GraduationCap, Star, Compass,
} from 'lucide-react'

const TYPE_BADGE = { government: 'badge-govt', private: 'badge-private', deemed: 'badge-deemed' }

const EXPLORE_LINKS = [
  { to: '/explore',       icon: Compass,       title: 'All Colleges',       sub: 'Browse and filter by type, state, rating & fees' },
  { to: '/shortlister',   icon: GraduationCap, title: 'College Shortlister',sub: 'Get a list tailored to your rank' },
  { to: '/rank-predictor',icon: Star,          title: 'Rank Predictor',     sub: 'Estimate AIR from your NEET score' },
]

export default function CollegePage() {
  const { id } = useParams()
  const { college, loading } = useCollege(id)
  const { colleges } = useColleges()
  const { quotas, loading: quotasLoading } = useQuotas(id)
  const [aboutOpen, setAboutOpen] = useState(true)

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--slate-light)' }}>Loading…</div>
  if (!college) return <div style={{ textAlign: 'center', padding: 80 }}>College not found.</div>

  const typeLabel = college.type ? college.type.charAt(0).toUpperCase() + college.type.slice(1) : ''

  // Colleges from the same state, ordered by rating, excluding the current one
  const similar = colleges
    .filter(c => c.id !== college.id && c.state === college.state)
    .sort((a, b) => (b.final_rating || 0) - (a.final_rating || 0))
    .slice(0, 4)

  return (
    <div>
      {/* ── Hero header ── */}
      <div className="detail-hero">
        <div className="page-container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={12} />
            <Link to="/explore">Colleges</Link>
            <ChevronRight size={12} />
            <span className="breadcrumb-current">{college.name}</span>
          </div>

          <Link to="/explore" className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>
            <ArrowLeft size={14} /> Back to Explorer
          </Link>

          <div className="detail-header">
            <div style={{ flex: 1 }}>
              <span className={`badge ${TYPE_BADGE[college.type] || 'badge-govt'}`} style={{ marginBottom: 12, display: 'inline-flex' }}>
                {typeLabel}
              </span>
              <h1 className="detail-title">{college.name}</h1>
              <div style={{ display: 'flex', gap: 20, marginTop: 12, flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--slate-light)' }}>
                  <MapPin size={14} /> {college.city}, {college.state}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--slate-light)' }}>
                  <Calendar size={14} /> Est. {college.year_established}
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <RatingRing value={college.final_rating} size={96} strokeWidth={7} />
              <p style={{ fontSize: 12, color: 'var(--slate-light)', marginTop: 6 }}>Overall Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div className="college-two-col-wrap">

        {/* LEFT — Cutoff data */}
        <div className="college-col-left">

          {/* About — collapsible */}
          {college.about && (
            <div className="info-section" style={{ padding: 0, overflow: 'hidden' }}>
              <button onClick={() => setAboutOpen(o => !o)} style={{
                width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', padding: '18px 20px',
                background: 'none', border: 'none', cursor: 'pointer', color: 'inherit',
              }}>
                <p className="section-title" style={{ margin: 0 }}>About the College</p>
                <ChevronDown size={16} color="var(--teal)"
                  style={{ flexShrink: 0, transform: aboutOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }} />
              </button>
              <div style={{ maxHeight: aboutOpen ? '1000px' : '0px', overflow: 'hidden', transition: 'max-height 0.35s ease' }}>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--fg-muted)', whiteSpace: 'pre-line', padding: '0 20px 20px' }}>
                  {college.about}
                </p>
              </div>
            </div>
          )}

          {/* Getting In */}
          {!quotasLoading && quotas.length > 0 && (
            <GettingInSection quotas={quotas} collegeName={college.name} />
          )}

          {/* Cutoff Charts */}
          <CutoffSection collegeId={id} />
        </div>

        {/* RIGHT — Info sidebar */}
        <div className="college-col-right">

          {/* Quick stats */}
          <div className="info-section" style={{ padding: '18px 18px 14px' }}>
            <p className="section-title">Quick Stats</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="sidebar-stat">
                <div className="stat-tile-icon" style={{ width: 32, height: 32, marginBottom: 8 }}><Users size={15} /></div>
                <p className="stat-tile-label">MBBS Seats</p>
                <p className="stat-tile-value" style={{ fontSize: 17 }}>{college.total_seats || '—'}</p>
              </div>
              <div className="sidebar-stat">
                <div className="stat-tile-icon" style={{ width: 32, height: 32, marginBottom: 8 }}><IndianRupee size={15} /></div>
                <p className="stat-tile-label">Annual Fees</p>
                <p className="stat-tile-value" style={{ fontSize: 14 }}>
                  {college.annual_fees ? `₹${Number(college.annual_fees).toLocaleString('en-IN')}` : '—'}
                </p>
              </div>
              <div className="sidebar-stat">
                <div className="stat-tile-icon" style={{ width: 32, height: 32, marginBottom: 8 }}><Star size={15} /></div>
                <p className="stat-tile-label">Rating</p>
                <p className="stat-tile-value" style={{ fontSize: 17, color: getRatingColor(college.final_rating) }}>
                  {Number(college.final_rating).toFixed(1)}<span style={{ fontSize: 11, color: 'var(--slate-light)' }}>/10</span>
                </p>
              </div>
              <div className="sidebar-stat">
                <div className="stat-tile-icon" style={{ width: 32, height: 32, marginBottom: 8 }}><GraduationCap size={15} /></div>
                <p className="stat-tile-label">Type</p>
                <p className="stat-tile-value" style={{ fontSize: 14 }}>{typeLabel}</p>
              </div>
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="info-section">
            <p className="section-title">Rating Breakdown</p>
            <div className="ratings-breakdown">
              {RATING_PARAMS.map(p => {
                const val = college[p.key] || 0
                return (
                  <div key={p.key} className="rating-row">
                    <span className="rating-row-label" style={{ display: 'flex', alignItems: 'center', gap: 5, width: 100, fontSize: 12 }}>
                      <ParamIcon name={p.icon} size={13} /> {p.label}
                    </span>
                    <div className="rating-bar-track">
                      <div className="rating-bar-fill" style={{ width: `${val * 10}%`, background: getRatingColor(val) }} />
                    </div>
                    <span className="rating-row-val" style={{ color: getRatingColor(val) }}>{val.toFixed(1)}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Is It Worth It */}
          {college.worthness && (
            <div className="info-section">
              <p className="section-title">Is It Worth It?</p>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--slate-light)' }}>{college.worthness}</p>
            </div>
          )}

          {/* College Info */}
          <div className="info-section">
            <p className="section-title">College Info</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Type',        value: typeLabel },
                { label: 'Established', value: college.year_established || '—' },
                { label: 'MBBS Seats',  value: college.total_seats || '—' },
                { label: 'Annual Fees', value: college.annual_fees ? `₹${Number(college.annual_fees).toLocaleString('en-IN')}` : '—', teal: true },
                { label: 'City',        value: college.city || '—' },
                { label: 'State',       value: college.state || '—' },
              ].map(({ label, value, teal }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                  <p style={{ fontSize: 12, color: 'var(--slate-light)', textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}>{label}</p>
                  <p style={{ fontSize: 14, fontWeight: 600, textAlign: 'right', color: teal ? 'var(--teal)' : 'var(--fg)', fontFamily: typeof value === 'number' ? 'DM Mono, monospace' : 'inherit' }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Similar Colleges */}
          {similar.length > 0 && (
            <div className="info-section">
              <p className="section-title">Similar in {college.state}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {similar.map(c => (
                  <Link key={c.id} to={`/college/${c.id}`} className="link-card" style={{ padding: '10px 12px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="link-card-title" style={{ fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</p>
                      <p className="link-card-sub">{c.city} · {c.total_seats || '—'} seats</p>
                    </div>
                    <RatingRing value={c.final_rating} size={36} strokeWidth={3} />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Explore More */}
          <div className="info-section" style={{ marginBottom: 0 }}>
            <p className="section-title">Explore More</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {EXPLORE_LINKS.map(l => {
                const Icon = l.icon
                return (
                  <Link key={l.to} to={l.to} className="link-card" style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="stat-tile-icon" style={{ width: 30, height: 30, flexShrink: 0 }}><Icon size={14} /></div>
                      <div>
                        <p className="link-card-title" style={{ fontSize: 13 }}>{l.title}</p>
                        <p className="link-card-sub" style={{ fontSize: 11 }}>{l.sub}</p>
                      </div>
                    </div>
                    <ChevronRight size={14} color="var(--slate-light)" />
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
