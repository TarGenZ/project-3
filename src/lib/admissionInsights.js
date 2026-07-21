// ── Admission insight helpers ───────────────────────────────────────────────
// These derive human-readable insights from raw cutoff_rounds data:
// trend narratives and "chance bands" (High/Moderate/Low) per quota.

// Returns { trend: 'increasing'|'decreasing'|'stable', latestClosing, previousClosing, latestYear, previousYear, delta }
// "increasing" = rank getting higher (harder to get in eased... actually higher closing rank = easier admission)
export function computeCutoffTrend(cutoffs) {
  const years = [...new Set(cutoffs.map(c => c.year))].sort((a, b) => b - a)
  if (years.length < 2) return null

  const latestYear = years[0]
  const previousYear = years[years.length - 1] // oldest available, for multi-year span

  const finalRound = (yr) => {
    const rounds = cutoffs.filter(c => c.year === yr).sort((a, b) => b.round_number - a.round_number)
    return rounds[0]
  }

  const latest = finalRound(latestYear)
  const earliest = finalRound(previousYear)
  if (!latest || !earliest) return null

  const delta = latest.closing_rank - earliest.closing_rank
  const trend = delta > 0 ? 'increasing' : delta < 0 ? 'decreasing' : 'stable'

  return {
    trend,
    latestClosing: latest.closing_rank,
    previousClosing: earliest.closing_rank,
    latestYear,
    previousYear,
    delta,
    yearSpan: years.length,
  }
}

// Builds a narrative sentence describing admission trend, similar to:
// "Admission pressure has eased over 3 years. OPEN now closes around AIR X, up from AIR Y in <year>."
export function buildTrendNarrative(collegeName, quotaName, cutoffs) {
  const t = computeCutoffTrend(cutoffs)
  if (!t) return null

  const easing = t.trend === 'increasing'
  const direction = easing ? 'eased' : t.trend === 'decreasing' ? 'tightened' : 'stayed stable'
  const movement = easing ? 'up from' : t.trend === 'decreasing' ? 'down from' : 'similar to'

  let sentence = `Admission pressure for ${quotaName} at ${collegeName} has ${direction} over ${t.yearSpan} year${t.yearSpan === 1 ? '' : 's'}. `
  if (t.trend !== 'stable') {
    sentence += `The final round now closes around AIR ${t.latestClosing.toLocaleString('en-IN')}, ${movement} AIR ${t.previousClosing.toLocaleString('en-IN')} in ${t.previousYear}.`
  } else {
    sentence += `The final round closing rank has remained close to AIR ${t.latestClosing.toLocaleString('en-IN')}.`
  }

  return sentence
}

// Computes "chance bands" for a quota based on its cutoff history across all
// tracked years. Returns null if there's not enough data.
// {
//   high: { max: number },           // rank <= this = qualified every year
//   moderate: { min, max },          // qualified in some years
//   low: { min },                    // did not qualify in any tracked year
//   yearsTracked: number
// }
export function computeChanceBands(cutoffs) {
  if (!cutoffs.length) return null

  // Use the best (lowest) and worst (highest) closing rank seen across all rounds/years
  // as anchors for the bands.
  const closingRanks = cutoffs.map(c => c.closing_rank).filter(r => r != null)
  if (!closingRanks.length) return null

  const years = [...new Set(cutoffs.map(c => c.year))]
  const bestClosing = Math.min(...closingRanks) // smallest rank = easiest cutoff seen
  const worstClosing = Math.max(...closingRanks) // largest rank = hardest cutoff seen

  return {
    high: { max: bestClosing },
    moderate: { min: bestClosing, max: worstClosing },
    low: { min: worstClosing },
    yearsTracked: years.length,
  }
}

// Given a user's rank, classify their chance for a given chance-band set.
export function classifyChance(rank, bands) {
  if (!bands || rank == null) return null
  if (rank <= bands.high.max) return 'high'
  if (rank <= bands.moderate.max) return 'moderate'
  return 'low'
}
