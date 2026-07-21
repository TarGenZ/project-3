import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { MOCK_COLLEGES, MOCK_QUOTAS, MOCK_CUTOFFS, computeFinalRating } from '../lib/mockData.js'
import { getDefaultQuotas } from '../lib/defaultQuotas.js'

// Falls back to mock data when VITE_SUPABASE_URL is not set (local dev without .env)
const USE_MOCK =
  !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co'

// ── Tables ────────────────────────────────────────────────────────────────────
// All three are namespaced to avoid collision with the shared `colleges` /
// `cutoffs` directory tables that pre-existed in the shared Supabase project.
const T_COLLEGES = 'explorer_colleges'
const T_QUOTAS   = 'explorer_quotas'
const T_CUTOFFS  = 'explorer_cutoff_rounds'

// ── Read hooks ────────────────────────────────────────────────────────────────

export function useColleges() {
  const [colleges, setColleges] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    setLoading(true)
    if (USE_MOCK) { setColleges(MOCK_COLLEGES); setLoading(false); return }
    const { data } = await supabase.from(T_COLLEGES).select('*').order('final_rating', { ascending: false })
    setColleges(data || [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])
  return { colleges, loading, refetch: fetch }
}

export function useCollege(id) {
  const [college, setCollege] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    if (USE_MOCK) {
      setCollege(MOCK_COLLEGES.find(c => c.id === id) || null)
      setLoading(false)
      return
    }
    supabase.from(T_COLLEGES).select('*').eq('id', id).single()
      .then(({ data }) => { setCollege(data); setLoading(false) })
  }, [id])

  return { college, loading }
}

export function useQuotas(collegeId) {
  const [quotas, setQuotas] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    if (!collegeId) { setQuotas([]); setLoading(false); return }
    setLoading(true)
    if (USE_MOCK) {
      setQuotas(MOCK_QUOTAS.filter(q => q.college_id === collegeId))
      setLoading(false)
      return
    }
    const { data } = await supabase.from(T_QUOTAS).select('*').eq('college_id', collegeId)
    setQuotas(data || [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [collegeId])
  return { quotas, loading, refetch: fetch }
}

export function useCutoffs(quotaId) {
  const [cutoffs, setCutoffs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    if (!quotaId) { setCutoffs([]); setLoading(false); return }
    setLoading(true)
    if (USE_MOCK) {
      setCutoffs(MOCK_CUTOFFS.filter(c => c.quota_id === quotaId))
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from(T_CUTOFFS).select('*')
      .eq('quota_id', quotaId)
      .order('year')
      .order('round_number')
    setCutoffs(data || [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [quotaId])
  return { cutoffs, loading, refetch: fetch }
}

// ── Admin mutations ───────────────────────────────────────────────────────────
// These are called from the project-0 admin dashboard components, which
// import supabase directly. These exports remain for any in-subdomain use
// (e.g. if an admin is using the app directly) but the primary admin UI
// lives at arpansarkar.org/dashboard.

export async function saveCollege(college) {
  if (USE_MOCK) return { data: { ...college, id: college.id || String(Date.now()) }, error: null }
  if (college.id) {
    return supabase.from(T_COLLEGES).update(college).eq('id', college.id).select().single()
  }
  const result = await supabase.from(T_COLLEGES).insert(college).select().single()
  if (!result.error && result.data) {
    const defaults = getDefaultQuotas(college.type, college.govt_subcategory)
    if (defaults.length) {
      const rows = defaults.map(q => ({ ...q, college_id: result.data.id }))
      const { error: qErr } = await supabase.from(T_QUOTAS).insert(rows)
      if (qErr) console.error('Failed to auto-create default quotas:', qErr)
    }
  }
  return result
}

export async function deleteCollege(id) {
  if (USE_MOCK) return { error: null }
  return supabase.from(T_COLLEGES).delete().eq('id', id)
}

export async function saveQuota(quota) {
  if (USE_MOCK) return { data: { ...quota, id: quota.id || String(Date.now()) }, error: null }
  if (quota.id) return supabase.from(T_QUOTAS).update(quota).eq('id', quota.id).select().single()
  return supabase.from(T_QUOTAS).insert(quota).select().single()
}

export async function deleteQuota(id) {
  if (USE_MOCK) return { error: null }
  return supabase.from(T_QUOTAS).delete().eq('id', id)
}

export async function saveCutoffRound(round) {
  if (USE_MOCK) return { data: { ...round, id: round.id || String(Date.now()) }, error: null }
  if (round.id) return supabase.from(T_CUTOFFS).update(round).eq('id', round.id).select().single()
  return supabase.from(T_CUTOFFS).insert(round).select().single()
}

export async function deleteCutoffRound(id) {
  if (USE_MOCK) return { error: null }
  return supabase.from(T_CUTOFFS).delete().eq('id', id)
}

// ── Bulk upserts (used by admin import panel in project-0) ───────────────────

export async function bulkUpsertColleges(rows) {
  if (USE_MOCK) return { inserted: rows.length, updated: 0, errors: [] }

  const { data: existing } = await supabase.from(T_COLLEGES).select('id, name')
  const existingMap = new Map((existing || []).map(c => [c.name.trim().toLowerCase(), c.id]))

  const toInsert = [], toUpdate = []
  for (const row of rows) {
    const withRating = { ...row, final_rating: computeFinalRating(row) }
    const key = row.name.trim().toLowerCase()
    existingMap.has(key)
      ? toUpdate.push({ ...withRating, id: existingMap.get(key) })
      : toInsert.push(withRating)
  }

  const errors = []
  let inserted = 0, updated = 0

  if (toInsert.length) {
    const { data, error } = await supabase.from(T_COLLEGES).insert(toInsert).select()
    if (error) { errors.push(error.message) }
    else {
      inserted = data?.length || 0
      const quotaRows = []
      for (const c of data || []) {
        const defaults = getDefaultQuotas(c.type, c.govt_subcategory)
        defaults.forEach(q => quotaRows.push({ ...q, college_id: c.id }))
      }
      if (quotaRows.length) {
        const { error: qErr } = await supabase.from(T_QUOTAS).insert(quotaRows)
        if (qErr) errors.push(`Default quota creation: ${qErr.message}`)
      }
    }
  }

  for (const row of toUpdate) {
    const { id, ...fields } = row
    const { error } = await supabase.from(T_COLLEGES).update(fields).eq('id', id)
    error ? errors.push(`${row.name}: ${error.message}`) : updated++
  }

  return { inserted, updated, errors }
}

export async function bulkUpsertQuotas(rows) {
  if (USE_MOCK) return { inserted: rows.length, skipped: 0, errors: [] }

  const { data: colleges } = await supabase.from(T_COLLEGES).select('id, name')
  const collegeMap = new Map((colleges || []).map(c => [c.name.trim().toLowerCase(), c.id]))

  const { data: existing } = await supabase.from(T_QUOTAS).select('id, name, quota_type, college_id')
  const existingSet = new Set((existing || []).map(q => `${q.college_id}|${q.name.trim().toLowerCase()}|${q.quota_type}`))

  const toInsert = [], errors = []
  let skipped = 0

  for (const row of rows) {
    const collegeId = collegeMap.get(row.college_name.trim().toLowerCase())
    if (!collegeId) { errors.push(`College not found: "${row.college_name}"`); continue }
    const key = `${collegeId}|${row.name.trim().toLowerCase()}|${row.quota_type}`
    if (existingSet.has(key)) { skipped++; continue }
    existingSet.add(key)
    toInsert.push({ name: row.name, quota_type: row.quota_type, college_id: collegeId })
  }

  let inserted = 0
  if (toInsert.length) {
    const { data, error } = await supabase.from(T_QUOTAS).insert(toInsert).select()
    if (error) errors.push(error.message)
    else inserted = data?.length || 0
  }

  return { inserted, skipped, errors }
}

export async function bulkUpsertCutoffRounds(rows) {
  if (USE_MOCK) return { inserted: rows.length, updated: 0, errors: [] }

  const { data: colleges } = await supabase.from(T_COLLEGES).select('id, name')
  const collegeMap = new Map((colleges || []).map(c => [c.name.trim().toLowerCase(), c.id]))

  const { data: quotas } = await supabase.from(T_QUOTAS).select('id, name, quota_type, college_id')
  const quotaMap = new Map((quotas || []).map(q => [`${q.college_id}|${q.name.trim().toLowerCase()}|${q.quota_type}`, q.id]))

  const { data: existingRounds } = await supabase.from(T_CUTOFFS).select('id, quota_id, year, round_number')
  const roundMap = new Map((existingRounds || []).map(r => [`${r.quota_id}|${r.year}|${r.round_number}`, r.id]))

  const toInsert = [], toUpdate = [], errors = []

  for (const row of rows) {
    const collegeId = collegeMap.get(row.college_name.trim().toLowerCase())
    if (!collegeId) { errors.push(`College not found: "${row.college_name}"`); continue }
    const quotaId = quotaMap.get(`${collegeId}|${row.quota_name.trim().toLowerCase()}|${row.quota_type}`)
    if (!quotaId) { errors.push(`Quota not found: "${row.quota_name}" (${row.quota_type}) at "${row.college_name}"`); continue }

    const roundKey = `${quotaId}|${row.year}|${row.round_number}`
    roundMap.has(roundKey)
      ? toUpdate.push({ id: roundMap.get(roundKey), closing_rank: row.closing_rank })
      : toInsert.push({ quota_id: quotaId, year: row.year, round_number: row.round_number, closing_rank: row.closing_rank })
  }

  let inserted = 0, updated = 0
  if (toInsert.length) {
    const { data, error } = await supabase.from(T_CUTOFFS).insert(toInsert).select()
    if (error) errors.push(error.message)
    else inserted = data?.length || 0
  }
  for (const row of toUpdate) {
    const { id, ...fields } = row
    const { error } = await supabase.from(T_CUTOFFS).update(fields).eq('id', id)
    error ? errors.push(error.message) : updated++
  }

  return { inserted, updated, errors }
}
