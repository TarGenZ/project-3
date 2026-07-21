import { useState, useEffect, useMemo, useRef } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'
import { useQuotas, useCutoffs } from '../../hooks/useData.js'
import { useAuth } from '../../auth/useAuth.js'
import { BarChart3, UserPlus, ChevronDown, Globe, MapPin } from 'lucide-react'
import AuthModal from '../ui/AuthModal.jsx'

// ── Year colour palette ───────────────────────────────────────────────────────
const YEAR_PALETTE = [
  { color: '#0ABFBC', dash: 'none' }, { color: '#6366F1', dash: 'none' },
  { color: '#F59E0B', dash: 'none' }, { color: '#22C55E', dash: 'none' },
  { color: '#EF4444', dash: 'none' }, { color: '#EC4899', dash: 'none' },
  { color: '#8B5CF6', dash: 'none' }, { color: '#14B8A6', dash: 'none' },
  { color: '#F97316', dash: 'none' }, { color: '#06B6D4', dash: 'none' },
  { color: '#84CC16', dash: 'none' }, { color: '#F43F5E', dash: 'none' },
  { color: '#A78BFA', dash: '5 3' }, { color: '#34D399', dash: '5 3' },
  { color: '#FBBF24', dash: '5 3' },
]
const getYearStyle = (i) => YEAR_PALETTE[i % YEAR_PALETTE.length]

// ── Tooltip ───────────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const sorted = [...payload].sort((a, b) => Number(b.dataKey) - Number(a.dataKey))
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', minWidth: 170, boxShadow: 'var(--shadow)' }}>
      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--fg-muted)', marginBottom: 8 }}>Round: {label}</p>
      {sorted.map(p => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: 'var(--fg-muted)', minWidth: 36 }}>{p.dataKey}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: p.color, fontFamily: 'DM Mono, monospace' }}>{p.value?.toLocaleString('en-IN')}</span>
        </div>
      ))}
    </div>
  )
}

// ── Year legend ───────────────────────────────────────────────────────────────
function YearLegend({ years }) {
  return (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginTop: 10 }}>
      {years.map((yr, i) => {
        const { color, dash } = getYearStyle(i)
        return (
          <div key={yr} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width={24} height={12}>
              <line x1={0} y1={6} x2={24} y2={6} stroke={color} strokeWidth={2.5} strokeDasharray={dash === 'none' ? undefined : dash} />
              <circle cx={12} cy={6} r={4} fill={color} />
            </svg>
            <span style={{ fontSize: 12, color: 'var(--fg-muted)', fontFamily: 'DM Mono, monospace' }}>{yr}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Stat tile ─────────────────────────────────────────────────────────────────
function StatTile({ label, value, color }) {
  return (
    <div style={{ flex: 1, minWidth: 120, border: `1px solid ${color}40`, borderLeft: `3px solid ${color}`, borderRadius: 8, padding: '12px 14px', background: `${color}08` }}>
      <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--fg-muted)', marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 18, fontWeight: 700, fontFamily: 'DM Mono, monospace', color }}>{value}</p>
    </div>
  )
}

// ── Cutoff chart for one quota ────────────────────────────────────────────────
function CutoffGraph({ quotaId, quotaName }) {
  const { cutoffs, loading } = useCutoffs(quotaId)

  const years     = useMemo(() => [...new Set(cutoffs.map(c => c.year))].sort((a, b) => b - a), [cutoffs])
  const allRounds = useMemo(() => [...new Set(cutoffs.map(c => c.round_number))].sort((a, b) => a - b), [cutoffs])

  const chartData = useMemo(() => allRounds.map(rn => {
    const row = { round: `R${rn}` }
    for (const yr of years) {
      const match = cutoffs.find(c => c.year === yr && c.round_number === rn)
      if (match?.closing_rank != null) row[yr] = match.closing_rank
    }
    return row
  }), [cutoffs, years, allRounds])

  const statTiles = useMemo(() => {
    const allClosing = cutoffs.map(c => c.closing_rank).filter(Boolean)
    if (!allClosing.length) return null
    const avg = Math.round(allClosing.reduce((a, b) => a + b, 0) / allClosing.length)
    const mostCompetitive = Math.min(...allClosing)
    const leastCompetitive = Math.max(...allClosing)
    let yoyLabel = null, yoyColor = 'var(--slate-light)'
    if (years.length >= 2) {
      const getRound = yr => cutoffs.filter(c => c.year === yr).sort((a, b) => b.round_number - a.round_number)[0]?.closing_rank
      const latest = getRound(years[0]), prev = getRound(years[1])
      if (latest != null && prev != null) {
        if      (latest > prev) { yoyLabel = 'Easing';    yoyColor = 'var(--success)' }
        else if (latest < prev) { yoyLabel = 'Tightening'; yoyColor = 'var(--danger)' }
        else                    { yoyLabel = 'Stable';    yoyColor = 'var(--slate-light)' }
      }
    }
    return { avg, mostCompetitive, leastCompetitive, yoyLabel, yoyColor }
  }, [cutoffs, years])

  const yDomain = useMemo(() => {
    const vals = cutoffs.map(c => c.closing_rank).filter(Boolean)
    if (!vals.length) return ['auto', 'auto']
    const min = Math.min(...vals), max = Math.max(...vals)
    const pad = Math.max((max - min) * 0.1, 2)
    return [Math.max(1, min - pad), max + pad]
  }, [cutoffs])

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--fg-muted)', fontSize: 13 }}>Loading…</div>
  if (!cutoffs.length) return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--fg-muted)', fontSize: 13 }}>
      No cutoff data added yet for <strong style={{ color: 'var(--fg)' }}>{quotaName}</strong>.
    </div>
  )

  return (
    <div>
      <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--fg)' }}>
        Cutoff Trend — <span style={{ color: 'var(--teal)' }}>{quotaName}</span>
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="round" tick={{ fontSize: 12 }} />
          <YAxis reversed domain={yDomain}
            tickFormatter={v => v >= 100000 ? `${(v/100000).toFixed(1)}L` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}
            width={52} />
          <Tooltip content={<CustomTooltip />} />
          {years.map((yr, i) => {
            const { color, dash } = getYearStyle(i)
            return (
              <Line key={yr} type="monotone" dataKey={yr} name={String(yr)}
                stroke={color} strokeWidth={2.5} strokeDasharray={dash === 'none' ? undefined : dash}
                dot={{ r: 4, fill: color, strokeWidth: 0 }} activeDot={{ r: 6, fill: color }} connectNulls />
            )
          })}
        </LineChart>
      </ResponsiveContainer>
      <YearLegend years={years} />
      {statTiles && (
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          <StatTile label="Avg Closing AIR"    value={statTiles.avg.toLocaleString('en-IN')}               color="#0ABFBC" />
          <StatTile label="Most Competitive"   value={statTiles.mostCompetitive.toLocaleString('en-IN')}   color="#22C55E" />
          <StatTile label="Least Competitive"  value={statTiles.leastCompetitive.toLocaleString('en-IN')}  color="#F59E0B" />
          {statTiles.yoyLabel && <StatTile label="Year-over-Year" value={statTiles.yoyLabel} color={statTiles.yoyColor} />}
        </div>
      )}
    </div>
  )
}

// ── Category toggle + quota dropdown ─────────────────────────────────────────
function QuotaSelector({ aiq, stateQ, selectedQuota, onSelect }) {
  const selectedInAIQ = aiq.some(q => q.id === selectedQuota)
  const [activeCategory, setActiveCategory] = useState(selectedInAIQ ? 'aiq' : (stateQ.length > 0 ? 'state' : 'aiq'))
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const hasAIQ = aiq.length > 0
  const hasState = stateQ.length > 0
  const currentList = activeCategory === 'aiq' ? aiq : stateQ
  const selectedQuotaObj = currentList.find(q => q.id === selectedQuota)

  const switchCategory = (cat) => {
    setActiveCategory(cat)
    setDropdownOpen(false)
    const list = cat === 'aiq' ? aiq : stateQ
    if (list.length > 0) onSelect(list[0].id)
  }

  useEffect(() => {
    const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
      {hasAIQ && hasState && (
        <div className="cutoff-category-toggle">
          <button className={`cutoff-cat-btn ${activeCategory === 'aiq' ? 'active' : ''}`} onClick={() => switchCategory('aiq')}>
            <Globe size={13} /> All India Quota
          </button>
          <button className={`cutoff-cat-btn ${activeCategory === 'state' ? 'active' : ''}`} onClick={() => switchCategory('state')}>
            <MapPin size={13} /> State Quota
          </button>
        </div>
      )}
      {(!hasAIQ || !hasState) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--teal)' }}>
          {hasAIQ ? <><Globe size={13} /> All India Quota</> : <><MapPin size={13} /> State Quota</>}
        </div>
      )}
      {currentList.length > 1 && (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button className="cutoff-quota-dropdown-btn" onClick={() => setDropdownOpen(o => !o)}>
            <span>{selectedQuotaObj?.name || 'Select quota'}</span>
            <ChevronDown size={14} style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
          </button>
          {dropdownOpen && (
            <div className="cutoff-quota-dropdown-menu">
              {currentList.map(q => (
                <button key={q.id} className={`cutoff-quota-dropdown-item ${selectedQuota === q.id ? 'active' : ''}`}
                  onClick={() => { onSelect(q.id); setDropdownOpen(false) }}>
                  {q.name}
                  {selectedQuota === q.id && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--teal)', flexShrink: 0 }} />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {currentList.length === 1 && (
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal)', background: 'var(--teal-dim)', border: '1px solid var(--teal)', borderRadius: 6, padding: '5px 12px' }}>
          {currentList[0].name}
        </span>
      )}
    </div>
  )
}

// ── Main CutoffSection ────────────────────────────────────────────────────────
export default function CutoffSection({ collegeId }) {
  // Simplified gating: logged in = full access, guest = sign-in prompt.
  // No free-view counter — a free account unlocks everything.
  const { user, isAdmin } = useAuth()
  const { quotas, loading: quotasLoading } = useQuotas(collegeId)
  const [selectedQuota, setSelectedQuota] = useState(null)
  const [showAuth, setShowAuth] = useState(false)

  const aiq    = quotas.filter(q => q.quota_type === 'all_india')
  const stateQ = quotas.filter(q => q.quota_type === 'state')

  useEffect(() => {
    if (quotas.length && !selectedQuota) setSelectedQuota(quotas[0].id)
  }, [quotas.length])

  const selectedQuotaObj = quotas.find(q => q.id === selectedQuota)
  const showContent = isAdmin || !!user

  if (quotasLoading) return (
    <div className="cutoff-section">
      <p className="section-title" style={{ marginBottom: 16 }}>Cutoff Data</p>
      <div style={{ textAlign: 'center', padding: 32, color: 'var(--slate-light)', fontSize: 13 }}>Loading…</div>
    </div>
  )

  if (!quotas.length) return (
    <div className="cutoff-section">
      <p className="section-title" style={{ marginBottom: 16 }}>Cutoff Data</p>
      <div className="empty-state">
        <div className="empty-state-icon"><BarChart3 size={40} color="var(--fg-muted)" /></div>
        <p className="empty-state-title">No cutoff data yet</p>
        <p style={{ fontSize: 13 }}>Cutoff data for this college hasn't been added yet.</p>
      </div>
    </div>
  )

  return (
    <>
      <div className="cutoff-section" style={{ position: 'relative' }}>
        <p className="section-title" style={{ marginBottom: 16 }}>Cutoff Data</p>

        {/* Category toggle + quota dropdown — always visible */}
        <QuotaSelector aiq={aiq} stateQ={stateQ} selectedQuota={selectedQuota} onSelect={setSelectedQuota} />

        {/* Chart area */}
        <div style={{ position: 'relative' }}>
          {showContent ? (
            selectedQuota && (
              <CutoffGraph key={selectedQuota} quotaId={selectedQuota} quotaName={selectedQuotaObj?.name} />
            )
          ) : (
            /* Guest — blurred placeholder + sign-in card */
            <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden' }}>
              {/* Blurred placeholder bars */}
              <div style={{
                height: 220, background: 'var(--bg-mid)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                filter: 'blur(5px)', opacity: 0.25, pointerEvents: 'none', userSelect: 'none',
              }}>
                <svg width="100%" height="100%" viewBox="0 0 400 180" preserveAspectRatio="none">
                  {[70,120,90,140,100,150,115].map((h, i) => (
                    <rect key={i} x={28 + i * 52} y={180 - h} width={32} height={h} rx={4} fill="var(--teal)" opacity={0.5} />
                  ))}
                </svg>
              </div>

              {/* Sign-in card */}
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '12px',
                background: 'rgba(15,27,45,0.55)',
                backdropFilter: 'blur(3px)',
              }}>
                <div className="cutoff-blur-card">
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--teal-dim)', border: '1px solid var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <UserPlus size={22} color="var(--teal)" />
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: 'var(--fg)' }}>Sign in to view cutoffs</p>
                  <p style={{ fontSize: 12, color: 'var(--fg-muted)', marginBottom: 16, lineHeight: 1.5 }}>
                    Free account — full access to every college's cutoff data across all rounds and years.
                  </p>
                  <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowAuth(true)}>
                    <UserPlus size={14} /> Sign in — It's Free
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
