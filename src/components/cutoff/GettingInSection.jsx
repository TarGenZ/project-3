import { useState, useEffect } from 'react'
import { Target } from 'lucide-react'
import { useCutoffs } from '../../hooks/useData'
import { computeChanceBands, buildTrendNarrative } from '../../lib/admissionInsights'

export default function GettingInSection({ quotas, collegeName }) {
  const [selectedQuota, setSelectedQuota] = useState(quotas[0]?.id || null)
  const { cutoffs, loading } = useCutoffs(selectedQuota)

  useEffect(() => {
    if (quotas.length && !selectedQuota) setSelectedQuota(quotas[0].id)
  }, [quotas])

  if (!quotas.length) return null

  const selectedQuotaObj = quotas.find(q => q.id === selectedQuota)
  const bands     = computeChanceBands(cutoffs)
  const narrative = buildTrendNarrative(collegeName, selectedQuotaObj?.name || '', cutoffs)

  const CHANCE_BANDS = [
    { key: 'high',     label: 'High Chance',     sub: 'Qualified every year',      color: '#22C55E', bgCls: 'bg-green-500/8 border-green-500/25', textCls: 'text-green-500', range: bands ? `< ${bands.high.max.toLocaleString('en-IN')}` : null },
    { key: 'moderate', label: 'Moderate Chance',  sub: 'Qualified some years',      color: '#F59E0B', bgCls: 'bg-amber/8 border-amber/25',         textCls: 'text-amber',     range: bands ? `${bands.moderate.min.toLocaleString('en-IN')}–${bands.moderate.max.toLocaleString('en-IN')}` : null },
    { key: 'low',      label: 'Low Chance',       sub: 'Did not qualify any year',  color: '#EF4444', bgCls: 'bg-danger/8 border-danger/25',        textCls: 'text-danger',    range: bands ? `> ${bands.low.min.toLocaleString('en-IN')}` : null },
  ]

  return (
    <div className="mb-3 rounded-xl border border-line/20 bg-panel p-4">
      <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet">
        <Target size={15} /> Getting In
      </p>

      {/* Quota tabs */}
      <div className="mb-3.5 flex flex-wrap gap-1.5">
        {quotas.map(q => (
          <button key={q.id} onClick={() => setSelectedQuota(q.id)}
            className={`rounded-lg border px-3.5 py-1.5 text-sm font-medium transition ${
              selectedQuota === q.id
                ? 'border-violet bg-violet/15 text-violet'
                : 'border-line/20 text-white/60 hover:border-violet/40 hover:text-violet'
            }`}>
            {q.quota_type === 'state' && (
              <span className="mr-1.5 rounded-full bg-orange-400/15 px-1.5 py-0.5 text-[10px] font-semibold text-orange-400">State</span>
            )}
            {q.name}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-white/60">Loading…</p>
      ) : !bands ? (
        <p className="text-sm text-white/60">No cutoff data available for {selectedQuotaObj?.name} yet.</p>
      ) : (
        <>
          <p className="mb-3.5 text-sm text-white/60">
            {selectedQuotaObj?.name} chance bands based on {bands.yearsTracked} year{bands.yearsTracked === 1 ? '' : 's'} of closing rank data
          </p>
          <div className="mb-3.5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {CHANCE_BANDS.map(b => (
              <div key={b.key} className={`rounded-xl border p-4 text-center ${b.bgCls}`}>
                <p className={`mb-1.5 text-xs font-bold uppercase tracking-[0.5px] ${b.textCls}`}>{b.label}</p>
                <p className="font-mono text-lg font-bold text-white">{b.range}</p>
                <p className="mt-1 text-[11px] text-white/50">{b.sub}</p>
              </div>
            ))}
          </div>
          {narrative && <p className="text-sm leading-relaxed text-white/60">{narrative}</p>}
        </>
      )}
    </div>
  )
}
