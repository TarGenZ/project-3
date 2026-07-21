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
  const bands = computeChanceBands(cutoffs)
  const narrative = buildTrendNarrative(collegeName, selectedQuotaObj?.name || '', cutoffs)

  return (
    <div className="info-section">
      <p className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Target size={15} /> Getting In
      </p>

      <div className="quota-tabs" style={{ marginBottom: 14 }}>
        {quotas.map(q => (
          <button key={q.id} className={`quota-tab ${selectedQuota === q.id ? 'active' : ''}`} onClick={() => setSelectedQuota(q.id)}>
            {q.quota_type === 'state' && <span className="badge badge-state" style={{ padding: '1px 6px', fontSize: 10, marginRight: 6 }}>State</span>}
            {q.name}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ fontSize: 13, color: 'var(--slate-light)' }}>Loading…</p>
      ) : !bands ? (
        <p style={{ fontSize: 13, color: 'var(--slate-light)' }}>No cutoff data available for {selectedQuotaObj?.name} yet.</p>
      ) : (
        <>
          <p style={{ fontSize: 13, color: 'var(--slate-light)', marginBottom: 14 }}>
            {selectedQuotaObj?.name} chance bands based on {bands.yearsTracked} year{bands.yearsTracked === 1 ? '' : 's'} of closing rank data
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 14 }}>
            <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 10, padding: 16, textAlign: 'center' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--success)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>High Chance</p>
              <p className="mono" style={{ fontSize: 18, fontWeight: 700 }}>&lt; {bands.high.max.toLocaleString('en-IN')}</p>
              <p style={{ fontSize: 11, color: 'var(--slate-light)', marginTop: 4 }}>Qualified every year</p>
            </div>
            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 10, padding: 16, textAlign: 'center' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Moderate Chance</p>
              <p className="mono" style={{ fontSize: 18, fontWeight: 700 }}>
                {bands.moderate.min.toLocaleString('en-IN')}–{bands.moderate.max.toLocaleString('en-IN')}
              </p>
              <p style={{ fontSize: 11, color: 'var(--slate-light)', marginTop: 4 }}>Qualified some years</p>
            </div>
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: 16, textAlign: 'center' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--danger)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Low Chance</p>
              <p className="mono" style={{ fontSize: 18, fontWeight: 700 }}>
                &gt; {bands.low.min.toLocaleString('en-IN')}
              </p>
              <p style={{ fontSize: 11, color: 'var(--slate-light)', marginTop: 4 }}>Did not qualify in any year</p>
            </div>
          </div>

          {narrative && (
            <p style={{ fontSize: 13, color: 'var(--slate-light)', lineHeight: 1.6 }}>{narrative}</p>
          )}
        </>
      )}
    </div>
  )
}
