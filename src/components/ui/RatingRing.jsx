export function getRatingColor(v) {
  if (v >= 7.5) return '#22C55E'   // green
  if (v >= 5.0) return '#F59E0B'   // orange
  return '#EF4444'                  // red
}

export default function RatingRing({ value, size = 64, strokeWidth = 5 }) {
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(10, value)) / 10
  const dash = pct * circ
  const color = getRatingColor(value ?? 0)

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(100,116,139,0.2)" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: size * 0.22, fontWeight: 700, fontFamily: 'DM Mono', color }}>
          {value?.toFixed(1)}
        </span>
        <span style={{ fontSize: size * 0.13, color: 'var(--fg-muted)', marginTop: -2 }}>/10</span>
      </div>
    </div>
  )
}
