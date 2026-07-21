import { RATING_PARAMS } from './mockData'

// ── Column schemas ────────────────────────────────────────────────────────────

export const COLLEGE_COLUMNS = [
  { key: 'name', label: 'name', required: true, type: 'text' },
  { key: 'city', label: 'city', required: false, type: 'text' },
  { key: 'state', label: 'state', required: false, type: 'text' },
  { key: 'year_established', label: 'year_established', required: false, type: 'int' },
  { key: 'type', label: 'type', required: false, type: 'text', enum: ['government', 'private', 'deemed'], default: 'government' },
  { key: 'govt_subcategory', label: 'govt_subcategory', required: false, type: 'text', enum: ['central', 'state'], default: null },
  { key: 'total_seats', label: 'total_seats', required: false, type: 'int' },
  { key: 'annual_fees', label: 'annual_fees', required: false, type: 'number' },
  { key: 'about', label: 'about', required: false, type: 'text' },
  { key: 'worthness', label: 'worthness', required: false, type: 'text' },
  ...RATING_PARAMS.map(p => ({ key: p.key, label: p.key, required: false, type: 'number', min: 0, max: 10, default: 5 })),
]

export const QUOTA_COLUMNS = [
  { key: 'college_name', label: 'college_name', required: true, type: 'text' },
  { key: 'name', label: 'quota_name', required: true, type: 'text' },
  { key: 'quota_type', label: 'quota_type', required: true, type: 'text', enum: ['all_india', 'state'] },
]

// Wide format columns (static part only — year columns are dynamic)
export const CUTOFF_WIDE_FIXED_COLS = [
  'college_name', 'quota_name', 'quota_type', 'round_number',
]

export const IMPORT_TYPES = {
  colleges: { label: 'Colleges', columns: COLLEGE_COLUMNS, sheetName: 'colleges' },
  quotas: { label: 'Quotas', columns: QUOTA_COLUMNS, sheetName: 'quotas' },
  cutoffs: { label: 'Cutoff Rounds', columns: null, sheetName: 'cutoff_rounds' }, // uses wide-format parser
}

// ── File parsing ──────────────────────────────────────────────────────────────

export async function parseSpreadsheetFile(file) {
  const XLSX = await import('xlsx')
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target.result
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
        resolve(rows)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

// ── Standard row validation (for colleges + quotas) ───────────────────────────

export function validateRows(rawRows, columns) {
  const validRows = []
  const errors = []

  rawRows.forEach((raw, idx) => {
    const rowNum = idx + 2
    const row = {}
    let rowHasError = false

    for (const col of columns) {
      let value = raw[col.label]
      if (value === undefined || value === '') {
        if (col.required) {
          errors.push({ row: rowNum, message: `Missing required value for "${col.label}"` })
          rowHasError = true
          continue
        }
        value = col.default !== undefined ? col.default : null
      }
      if (col.type === 'int' && value !== null) {
        const n = parseInt(value, 10)
        if (isNaN(n)) { errors.push({ row: rowNum, message: `"${col.label}" must be a whole number, got "${value}"` }); rowHasError = true; continue }
        value = n
      }
      if (col.type === 'number' && value !== null) {
        const n = parseFloat(value)
        if (isNaN(n)) { errors.push({ row: rowNum, message: `"${col.label}" must be a number, got "${value}"` }); rowHasError = true; continue }
        if (col.min !== undefined && n < col.min) { errors.push({ row: rowNum, message: `"${col.label}" must be >= ${col.min}` }); rowHasError = true; continue }
        if (col.max !== undefined && n > col.max) { errors.push({ row: rowNum, message: `"${col.label}" must be <= ${col.max}` }); rowHasError = true; continue }
        value = n
      }
      if (col.type === 'text' && value !== null) value = String(value).trim()
      if (col.enum && value !== null && !col.enum.includes(value)) {
        errors.push({ row: rowNum, message: `"${col.label}" must be one of: ${col.enum.join(', ')} (got "${value}")` })
        rowHasError = true; continue
      }
      row[col.key] = value
    }

    if (!rowHasError) validRows.push(row)
  })

  return { validRows, errors }
}

// ── Wide-format cutoff parser ─────────────────────────────────────────────────
// Input format (one row per college+quota+round, years as columns):
//   college_name | quota_name | quota_type | round_number | closing_rank_2023 | closing_rank_2024 | closing_rank_2025
//   AIIMS Delhi  | UR         | all_india  | 1            | 32                | 35                | 33
//
// Output: flat array of { college_name, quota_name, quota_type, year, round_number, closing_rank }
// Blank cells are skipped (year data not yet available for that round).

export function parseCutoffWideRows(rawRows) {
  const validRows = []
  const errors = []

  if (!rawRows.length) return { validRows, errors }

  // Detect year columns: any header matching closing_rank_YYYY
  const sampleHeaders = Object.keys(rawRows[0])
  const yearCols = sampleHeaders
    .map(h => ({ header: h, match: h.trim().match(/^closing_rank[_\s](\d{4})$/i) }))
    .filter(x => x.match)
    .map(x => ({ header: x.header, year: parseInt(x.match[1]) }))
    .sort((a, b) => a.year - b.year)

  if (!yearCols.length) {
    errors.push({ row: 1, message: 'No year columns found. Expected headers like: closing_rank_2023, closing_rank_2024, etc.' })
    return { validRows, errors }
  }

  rawRows.forEach((raw, idx) => {
    const rowNum = idx + 2
    const collegeName = String(raw['college_name'] || '').trim()
    const quotaName = String(raw['quota_name'] || '').trim()
    const quotaType = String(raw['quota_type'] || '').trim()
    const roundNumber = parseInt(raw['round_number'], 10)

    if (!collegeName) { errors.push({ row: rowNum, message: 'Missing college_name' }); return }
    if (!quotaName) { errors.push({ row: rowNum, message: 'Missing quota_name' }); return }
    if (!['all_india', 'state'].includes(quotaType)) {
      errors.push({ row: rowNum, message: `quota_type must be "all_india" or "state", got "${quotaType}"` }); return
    }
    if (isNaN(roundNumber) || roundNumber < 1) {
      errors.push({ row: rowNum, message: `round_number must be a positive integer, got "${raw['round_number']}"` }); return
    }

    // Unpivot: one output row per non-blank year column
    let yielded = 0
    for (const { header, year } of yearCols) {
      const raw_val = raw[header]
      if (raw_val === '' || raw_val === null || raw_val === undefined) continue // blank = no data
      const closingRank = parseInt(raw_val, 10)
      if (isNaN(closingRank)) {
        errors.push({ row: rowNum, message: `closing_rank_${year} must be a number, got "${raw_val}"` })
        continue
      }
      validRows.push({ college_name: collegeName, quota_name: quotaName, quota_type: quotaType, year, round_number: roundNumber, closing_rank: closingRank })
      yielded++
    }
    if (!yielded) {
      errors.push({ row: rowNum, message: `Row has no valid year data (all closing_rank columns are blank)` })
    }
  })

  return { validRows, errors }
}

// ── Template generation ───────────────────────────────────────────────────────

// Default year range shown in the cutoffs template
const TEMPLATE_YEARS = [2020, 2021, 2022, 2023, 2024, 2025]

export async function downloadTemplate(type) {
  const XLSX = await import('xlsx')

  if (type === 'cutoffs') {
    // Wide format template
    const yearHeaders = TEMPLATE_YEARS.map(y => `closing_rank_${y}`)
    const headers = ['college_name', 'quota_name', 'quota_type', 'round_number', ...yearHeaders]

    const sampleData = [
      // AIIMS UR — 3 rounds across 6 years
      { college_name: 'AIIMS New Delhi', quota_name: 'UR', quota_type: 'all_india', round_number: 1, 2020: 25, 2021: 28, 2022: 28, 2023: 32, 2024: 35, 2025: 33 },
      { college_name: 'AIIMS New Delhi', quota_name: 'UR', quota_type: 'all_india', round_number: 2, 2020: 30, 2021: 33, 2022: 36, 2023: 38, 2024: 42, 2025: 40 },
      { college_name: 'AIIMS New Delhi', quota_name: 'UR', quota_type: 'all_india', round_number: 3, 2020: '', 2021: '', 2022: '', 2023: 45, 2024: 50, 2025: '' },
      // AIIMS SC — 2 rounds, recent years only (blanks for years without data)
      { college_name: 'AIIMS New Delhi', quota_name: 'SC', quota_type: 'all_india', round_number: 1, 2020: '', 2021: '', 2022: '', 2023: 780, 2024: 850, 2025: 800 },
      { college_name: 'AIIMS New Delhi', quota_name: 'SC', quota_type: 'all_india', round_number: 2, 2020: '', 2021: '', 2022: '', 2023: '', 2024: 980, 2025: '' },
      // Grant Medical — state quota
      { college_name: 'Grant Medical College', quota_name: 'GEN', quota_type: 'state', round_number: 1, 2020: '', 2021: '', 2022: 2100, 2023: 2300, 2024: 2500, 2025: '' },
      { college_name: 'Grant Medical College', quota_name: 'GEN', quota_type: 'state', round_number: 2, 2020: '', 2021: '', 2022: 2400, 2023: 2700, 2024: 3000, 2025: '' },
    ]

    const rows = sampleData.map(r => [
      r.college_name, r.quota_name, r.quota_type, r.round_number,
      ...TEMPLATE_YEARS.map(y => r[y] ?? ''),
    ])

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
    // Auto-size columns
    ws['!cols'] = headers.map((h, ci) => ({
      wch: Math.max(h.length, ...rows.map(r => String(r[ci] ?? '').length)) + 2
    }))

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'cutoff_rounds')
    XLSX.writeFile(wb, 'cutoffs_template.xlsx')
    return
  }

  // Standard format for colleges and quotas
  const config = IMPORT_TYPES[type]
  const headers = config.columns.map(c => c.label)

  const sampleRows = {
    colleges: [
      {
        name: 'AIIMS New Delhi', city: 'New Delhi', state: 'Delhi', year_established: 1956,
        type: 'government', govt_subcategory: 'central', total_seats: 100, annual_fees: 1628,
        about: 'AIIMS New Delhi is a premier medical institution established in 1956. It is an autonomous public medical university and one of the most reputed institutions in India, known for cutting-edge research, world-class faculty, and exceptional clinical training.',
        worthness: 'Top-tier institution — excellent research and clinical exposure.',
        ...RATING_PARAMS.reduce((a, p) => ({ ...a, [p.key]: 8.5 }), {}),
      },
      {
        name: 'Grant Medical College', city: 'Mumbai', state: 'Maharashtra', year_established: 1845,
        type: 'government', govt_subcategory: 'state', total_seats: 200, annual_fees: 25000,
        worthness: 'Attached to JJ Hospital — high patient load, strong clinical exposure.',
        ...RATING_PARAMS.reduce((a, p) => ({ ...a, [p.key]: 7.5 }), {}),
      },
    ],
    quotas: [
      { college_name: 'AIIMS New Delhi', quota_name: 'UR', quota_type: 'all_india' },
      { college_name: 'AIIMS New Delhi', quota_name: 'EWS', quota_type: 'all_india' },
      { college_name: 'AIIMS New Delhi', quota_name: 'OBC', quota_type: 'all_india' },
      { college_name: 'AIIMS New Delhi', quota_name: 'SC', quota_type: 'all_india' },
      { college_name: 'AIIMS New Delhi', quota_name: 'ST', quota_type: 'all_india' },
      { college_name: 'Grant Medical College', quota_name: 'UR', quota_type: 'all_india' },
      { college_name: 'Grant Medical College', quota_name: 'GEN', quota_type: 'state' },
    ],
  }

  const dataRows = sampleRows[type].map(r => config.columns.map(c => r[c.key] ?? ''))
  const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows])
  ws['!cols'] = headers.map((h, ci) => ({
    wch: Math.max(h.length, ...dataRows.map(r => String(r[ci] ?? '').length)) + 2
  }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, config.sheetName)
  XLSX.writeFile(wb, `${type}_template.xlsx`)
}
