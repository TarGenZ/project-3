import { useState, useEffect, useMemo, useRef } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useQuotas, useCutoffs } from '../../hooks/useData.js'
import { useAuth } from '../../auth/useAuth.js'
import { BarChart3, UserPlus, ChevronDown, Globe, MapPin } from 'lucide-react'
import AuthModal from '../ui/AuthModal.jsx'

const YEAR_PALETTE = [
  { color: '#7C3AED', dash: 'none' }, { color: '#6366F1', dash: 'none' },
  { color: '#F59E0B', dash: 'none' }, { color: '#22C55E', dash: 'none' },
  { color: '#EF4444', dash: 'none' }, { color: '#EC4899', dash: 'none' },
  { color: '#8B5CF6', dash: 'none' }, { color: '#14B8A6', dash: 'none' },
  { color: '#F97316', dash: 'none' }, { color: '#06B6D4', dash: 'none' },
  { color: '#84CC16', dash: 'none' }, { color: '#F43F5E', dash: 'none' },
  { color: '#A78BFA', dash: '5 3'  }, { color: '#34D399', dash: '5 3'  },
  { color: '#FBBF24', dash: '5 3'  },
]
const getYearStyle = (i) => YEAR_PALETTE[i % YEAR_PALETTE.length]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const sorted = [...payload].sort((a, b) => Number(b.dataKey) - Number(a.dataKey))
  return (
    <div className="min-w-[170px] rounded-lg border border-line/20 bg-panel p-3 shadow-glow">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.5px] text-white/50">Round: {label}</p>
      {sorted.map(p => (
        <div key={p.dataKey} className="mb-1 flex items-center gap-2">
          <div className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: p.color }} />
          <span className="min-w-[36px] text-xs text-white/50">{p.dataKey}</span>
          <span className="font-mono text-sm font-bold" style={{ color: p.color }}>{p.value?.toLocaleString('en-IN')}</span>
        </div>
      ))}
    </div>
  )
}

function YearLegend({ years }) {
  return (
    <div className="mt-2.5 flex flex-wrap justify-center gap-3.5">
      {years.map((yr, i) => {
        const { color, dash } = getYearStyle(i)
        return (
          <div key={yr} className="flex items-center gap-1.5">
            <svg width={24} height={12}>
              <line x1={0} y1={6} x2={24} y2={6} stroke={color} strokeWidth={2.5} strokeDasharray={dash === 'none' ? undefined : dash} />
              <circle cx={12} cy={6} r={4} fill={color} />
            </svg>
            <span className="font-mono text-xs text-white/60">{yr}</span>
          </div>
        )
      })}
    </div>
  )
}

function StatTile({ label, value, color }) {
  return (
    <div className="min-w-[120px] flex-1 rounded-lg p-3.5" style={{ border: `1px solid ${color}40`, borderLeft: `3px solid ${color}`, background: `${color}08` }}>
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.8px] text-white/50">{label}</p>
      <p className="font-mono text-lg font-bold" style={{ color }}>{value}</p>
    </div>
  )
}

function CutoffGraph({ quotaId, quotaName }) {
  const { cutoffs, loading } = useCutoffs(quotaId)
  const years     = useMemo(() => [...new Set(cutoffs.map(c => c.year))].sort((a,b) => b - a), [cutoffs])
  const allRounds = useMemo(() => [...new Set(cutoffs.map(c => c.round_number))].sort((a,b) => a - b), [cutoffs])
  const chartData = useMemo(() => allRounds.map(rn => {
    const row = { round: `R${rn}` }
    for (const yr of years) {
      const m = cutoffs.find(c => c.year === yr && c.round_number === rn)
      if (m?.closing_rank != null) row[yr] = m.closing_rank
    }
    return row
  }), [cutoffs, years, allRounds])

  const statTiles = useMemo(() => {
    const all = cutoffs.map(c => c.closing_rank).filter(Boolean)
    if (!all.length) return null
    const avg = Math.round(all.reduce((a,b) => a+b, 0) / all.length)
    let yoyLabel = null, yoyColor = 'var(--fg-muted)'
    if (years.length >= 2) {
      const get = yr => cutoffs.filter(c => c.year === yr).sort((a,b) => b.round_number - a.round_number)[0]?.closing_rank
      const [lat, prv] = [get(years[0]), get(years[1])]
      if (lat != null && prv != null) {
        if      (lat > prv) { yoyLabel = 'Easing';     yoyColor = 'var(--success)' }
        else if (lat < prv) { yoyLabel = 'Tightening'; yoyColor = 'var(--danger)'  }
        else                { yoyLabel = 'Stable';     yoyColor = 'var(--fg-muted)' }
      }
    }
    return { avg, most: Math.min(...all), least: Math.max(...all), yoyLabel, yoyColor }
  }, [cutoffs, years])

  const yDomain = useMemo(() => {
    const vals = cutoffs.map(c => c.closing_rank).filter(Boolean)
    if (!vals.length) return ['auto', 'auto']
    const [mn, mx] = [Math.min(...vals), Math.max(...vals)]
    const pad = Math.max((mx - mn) * 0.1, 2)
    return [Math.max(1, mn - pad), mx + pad]
  }, [cutoffs])

  if (loading) return <p className="py-10 text-center text-sm text-white/60">Loading…</p>
  if (!cutoffs.length) return <p className="py-10 text-center text-sm text-white/60">No cutoff data added yet for <strong className="text-white">{quotaName}</strong>.</p>

  return (
    <div>
      <p className="mb-4 text-sm font-semibold text-white">
        Cutoff Trend — <span className="text-violet">{quotaName}</span>
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
            return <Line key={yr} type="monotone" dataKey={yr} name={String(yr)}
              stroke={color} strokeWidth={2.5} strokeDasharray={dash === 'none' ? undefined : dash}
              dot={{ r: 4, fill: color, strokeWidth: 0 }} activeDot={{ r: 6, fill: color }} connectNulls />
          })}
        </LineChart>
      </ResponsiveContainer>
      <YearLegend years={years} />
      {statTiles && (
        <div className="mt-4 flex flex-wrap gap-2.5">
          <StatTile label="Avg Closing AIR"   value={statTiles.avg.toLocaleString('en-IN')}   color="#7C3AED" />
          <StatTile label="Most Competitive"  value={statTiles.most.toLocaleString('en-IN')}  color="#22C55E" />
          <StatTile label="Least Competitive" value={statTiles.least.toLocaleString('en-IN')} color="#F59E0B" />
          {statTiles.yoyLabel && <StatTile label="Year-over-Year" value={statTiles.yoyLabel} color={statTiles.yoyColor} />}
        </div>
      )}
    </div>
  )
}

function QuotaSelector({ aiq, stateQ, selectedQuota, onSelect }) {
  const selectedInAIQ = aiq.some(q => q.id === selectedQuota)
  const [activeCategory, setActiveCategory] = useState(selectedInAIQ ? 'aiq' : (stateQ.length > 0 ? 'state' : 'aiq'))
  const [dropdownOpen, setDropdownOpen]     = useState(false)
  const dropdownRef = useRef(null)
  const hasAIQ = aiq.length > 0, hasState = stateQ.length > 0
  const currentList       = activeCategory === 'aiq' ? aiq : stateQ
  const selectedQuotaObj  = currentList.find(q => q.id === selectedQuota)

  const switchCategory = (cat) => {
    setActiveCategory(cat); setDropdownOpen(false)
    const list = cat === 'aiq' ? aiq : stateQ
    if (list.length > 0) onSelect(list[0].id)
  }

  useEffect(() => {
    const h = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div className="mb-5 flex flex-wrap items-center gap-3">
      {hasAIQ && hasState && (
        <div className="flex gap-0.5 rounded-lg border border-line/20 bg-mid p-0.5">
          {[{ key: 'aiq', icon: <Globe size={13}/>, label: 'All India Quota' }, { key: 'state', icon: <MapPin size={13}/>, label: 'State Quota' }].map(btn => (
            <button key={btn.key} onClick={() => switchCategory(btn.key)}
              className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition ${activeCategory === btn.key ? 'border border-violet bg-violet/15 text-violet' : 'text-white/60 hover:text-white'}`}>
              {btn.icon} {btn.label}
            </button>
          ))}
        </div>
      )}
      {(!hasAIQ || !hasState) && (
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[1px] text-violet">
          {hasAIQ ? <><Globe size={13}/> All India Quota</> : <><MapPin size={13}/> State Quota</>}
        </div>
      )}
      {currentList.length > 1 && (
        <div ref={dropdownRef} className="relative">
          <button onClick={() => setDropdownOpen(o => !o)}
            className="flex min-w-[160px] items-center justify-between gap-2 rounded-lg border border-line/20 bg-white/5 px-3.5 py-1.5 text-sm font-semibold text-white transition hover:border-violet/40">
            <span>{selectedQuotaObj?.name || 'Select quota'}</span>
            <ChevronDown size={14} style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          {dropdownOpen && (
            <div className="absolute left-0 top-[calc(100%+6px)] z-50 min-w-full rounded-xl border border-line/20 bg-panel p-1.5 shadow-glow">
              {currentList.map(q => (
                <button key={q.id} onClick={() => { onSelect(q.id); setDropdownOpen(false) }}
                  className={`flex w-full items-center justify-between gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition hover:bg-mid ${selectedQuota === q.id ? 'text-violet bg-violet/10' : 'text-white/60'}`}>
                  {q.name}
                  {selectedQuota === q.id && <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {currentList.length === 1 && (
        <span className="rounded-lg border border-violet bg-violet/15 px-3 py-1.5 text-sm font-semibold text-violet">
          {currentList[0].name}
        </span>
      )}
    </div>
  )
}

export default function CutoffSection({ collegeId }) {
  const { user, isAdmin }   = useAuth()
  const { quotas, loading: quotasLoading } = useQuotas(collegeId)
  const [selectedQuota, setSelectedQuota]  = useState(null)
  const [showAuth, setShowAuth]            = useState(false)
  const aiq    = quotas.filter(q => q.quota_type === 'all_india')
  const stateQ = quotas.filter(q => q.quota_type === 'state')

  useEffect(() => { if (quotas.length && !selectedQuota) setSelectedQuota(quotas[0].id) }, [quotas.length])

  const selectedQuotaObj = quotas.find(q => q.id === selectedQuota)
  const showContent      = isAdmin || !!user

  const SECTION_CLS = 'rounded-xl border border-line/20 bg-panel p-4'

  if (quotasLoading) return (
    <div className={SECTION_CLS}>
      <p className="mb-4 text-xs font-bold uppercase tracking-wider text-violet">Cutoff Data</p>
      <p className="py-8 text-center text-sm text-white/60">Loading…</p>
    </div>
  )

  if (!quotas.length) return (
    <div className={SECTION_CLS}>
      <p className="mb-4 text-xs font-bold uppercase tracking-wider text-violet">Cutoff Data</p>
      <div className="py-20 text-center">
        <BarChart3 size={40} className="mx-auto mb-3 text-white/20" />
        <p className="mb-1 text-[18px] font-semibold text-white">No cutoff data yet</p>
        <p className="text-sm text-white/60">Cutoff data for this college hasn't been added yet.</p>
      </div>
    </div>
  )

  return (
    <>
      <div className={`${SECTION_CLS} relative`}>
        <p className="mb-4 text-xs font-bold uppercase tracking-wider text-violet">Cutoff Data</p>
        <QuotaSelector aiq={aiq} stateQ={stateQ} selectedQuota={selectedQuota} onSelect={setSelectedQuota} />

        <div className="relative">
          {showContent ? (
            selectedQuota && <CutoffGraph key={selectedQuota} quotaId={selectedQuota} quotaName={selectedQuotaObj?.name} />
          ) : (
            <div className="relative overflow-hidden rounded-lg">
              {/* Blurred placeholder */}
              <div className="pointer-events-none h-[220px] select-none bg-mid opacity-25" style={{ filter: 'blur(5px)' }}>
                <svg width="100%" height="100%" viewBox="0 0 400 180" preserveAspectRatio="none">
                  {[70,120,90,140,100,150,115].map((h,i) => (
                    <rect key={i} x={28+i*52} y={180-h} width={32} height={h} rx={4} fill="#7C3AED" opacity={0.5} />
                  ))}
                </svg>
              </div>
              {/* Sign-in card */}
              <div className="absolute inset-0 flex items-center justify-center p-3 backdrop-blur-sm" style={{ background: 'rgba(15,27,45,0.55)' }}>
                <div className="w-full max-w-[420px] rounded-xl border border-line/20 bg-panel p-6 text-center shadow-glow">
                  <div className="mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-full border border-violet bg-violet/15 text-violet">
                    <UserPlus size={22} />
                  </div>
                  <p className="mb-1.5 text-base font-bold text-white">Sign in to view cutoffs</p>
                  <p className="mb-4 text-xs leading-relaxed text-white/60">
                    Free account — full access to every college's cutoff data across all rounds and years.
                  </p>
                  <button onClick={() => setShowAuth(true)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-violet px-5 py-2.5 text-sm font-semibold text-[#fff] transition hover:bg-violet-soft">
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
