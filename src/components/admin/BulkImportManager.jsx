import { useState, useRef } from 'react'
import { IMPORT_TYPES, CUTOFF_WIDE_FIXED_COLS, parseSpreadsheetFile, validateRows, parseCutoffWideRows, downloadTemplate } from '../../lib/bulkImport'
import { bulkUpsertColleges, bulkUpsertQuotas, bulkUpsertCutoffRounds, useColleges } from '../../hooks/useData'
import { Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react'

const UPLOAD_FN = { colleges: bulkUpsertColleges, quotas: bulkUpsertQuotas, cutoffs: bulkUpsertCutoffRounds }
const TYPE_TABS = [
  { key: 'colleges', label: 'Colleges'      },
  { key: 'quotas',   label: 'Quotas'        },
  { key: 'cutoffs',  label: 'Cutoff Rounds' },
]
const DESCRIPTIONS = {
  colleges: 'Each row is one college. Rating fields (0–10) are optional and default to 5. final_rating is auto-computed. Uploading an existing college name updates it.',
  quotas:   '"college_name" must exactly match an existing college (case-insensitive). Duplicate quota+type combos are skipped.',
  cutoffs:  "Wide format: one row per college + quota + round number. Each year gets its own column (closing_rank_2023, closing_rank_2024, …). Leave a cell blank if data isn't available for that year. Uploading an existing round updates its closing rank.",
}

const CARD  = 'rounded-xl border border-line/20 bg-panel p-6 mb-5'
const BTN_P = 'inline-flex items-center gap-2 rounded-lg bg-violet px-4 py-2 text-sm font-semibold text-[#fff] transition hover:bg-violet-soft disabled:opacity-50 disabled:cursor-not-allowed'
const BTN_S = 'inline-flex items-center gap-2 rounded-lg border border-line/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-violet/40 hover:bg-white/10 disabled:opacity-50'
const BTN_G = 'inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white'
const TH    = 'text-left text-[11px] font-bold uppercase tracking-[1px] text-white/40 px-3 py-2.5 border-b border-line/20'
const TD    = 'px-3 py-3 border-b border-line/10 text-sm text-white/80'

export default function BulkImportManager() {
  const [type,         setType]         = useState('colleges')
  const [fileName,     setFileName]     = useState(null)
  const [parsing,      setParsing]      = useState(false)
  const [parseErrors,  setParseErrors]  = useState([])
  const [validRows,    setValidRows]    = useState([])
  const [detectedYears,setDetectedYears]= useState([])
  const [importing,    setImporting]    = useState(false)
  const [result,       setResult]       = useState(null)
  const fileInputRef  = useRef(null)
  const { refetch: refetchColleges } = useColleges()

  const reset = () => {
    setFileName(null); setParseErrors([]); setValidRows([])
    setResult(null);   setDetectedYears([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }
  const switchType = (t) => { setType(t); reset() }

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    reset(); setFileName(file.name); setParsing(true)
    try {
      const rawRows = await parseSpreadsheetFile(file)
      if (type === 'cutoffs') {
        const { validRows: valid, errors } = parseCutoffWideRows(rawRows)
        setDetectedYears([...new Set(valid.map(r => r.year))].sort((a,b) => a - b))
        setValidRows(valid); setParseErrors(errors)
      } else {
        const config = IMPORT_TYPES[type]
        const { validRows: valid, errors } = validateRows(rawRows, config.columns)
        setValidRows(valid); setParseErrors(errors)
      }
    } catch (err) {
      setParseErrors([{ row: 0, errors: [`Failed to parse file: ${err.message}`] }])
    } finally {
      setParsing(false)
    }
  }

  const handleImport = async () => {
    if (!validRows.length) return
    setImporting(true)
    try {
      const fn = UPLOAD_FN[type]
      const res = type === 'cutoffs'
        ? await fn(validRows)
        : await fn(validRows)
      setResult(res)
      await refetchColleges()
    } catch (err) {
      setResult({ error: err.message })
    } finally {
      setImporting(false)
    }
  }

  const previewCols = type === 'cutoffs'
    ? [...CUTOFF_WIDE_FIXED_COLS, ...detectedYears.map(y => `closing_rank_${y}`)]
    : IMPORT_TYPES[type]?.columns?.map(c => c.key) || []

  return (
    <div>
      {/* Type tabs */}
      <div className={CARD}>
        <p className="mb-3 text-xs font-bold uppercase tracking-[1px] text-white/40">Import Type</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {TYPE_TABS.map(t => (
            <button key={t.key} onClick={() => switchType(t.key)}
              className={`rounded-lg border px-4 py-1.5 text-sm font-medium transition ${type === t.key ? 'border-violet bg-violet/15 text-violet' : 'border-line/20 text-white/60 hover:border-violet/40 hover:text-white'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <p className="text-sm leading-relaxed text-white/60">{DESCRIPTIONS[type]}</p>
      </div>

      {/* Upload + download */}
      <div className={CARD}>
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <button className={BTN_S} onClick={() => downloadTemplate(type)}>
            <Download size={14} /> Download Template
          </button>
        </div>

        <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-line/30 p-8 text-center transition hover:border-violet/40">
          <FileSpreadsheet size={36} className="text-white/20" />
          <div>
            <p className="font-semibold text-white/70">{fileName || 'Click to upload .xlsx or .csv'}</p>
            <p className="mt-1 text-xs text-white/40">Supports Excel and CSV formats</p>
          </div>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="hidden" />
        </label>

        {parsing && (
          <div className="mt-4 flex items-center gap-2 text-sm text-white/60">
            <Loader2 size={14} className="animate-spin" /> Parsing file…
          </div>
        )}
      </div>

      {/* Parse errors */}
      {parseErrors.length > 0 && (
        <div className="mb-5 rounded-xl border border-danger/30 bg-danger/10 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-danger">
            <AlertCircle size={14} /> {parseErrors.length} row{parseErrors.length > 1 ? 's' : ''} had errors (skipped)
          </p>
          <div className="flex max-h-[160px] flex-col gap-1 overflow-y-auto">
            {parseErrors.map((e, i) => (
              <p key={i} className="text-xs text-danger/80">Row {e.row}: {e.errors.join(', ')}</p>
            ))}
          </div>
        </div>
      )}

      {/* Preview + import */}
      {validRows.length > 0 && !result && (
        <div className={CARD}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-white">{validRows.length} valid rows ready to import</p>
            <button className={BTN_G} onClick={reset}><X size={13} /> Clear</button>
          </div>

          <div className="mb-4 max-h-[280px] overflow-auto rounded-lg border border-line/20">
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 bg-panel">
                <tr>{previewCols.map(c => <th key={c} className={TH}>{c}</th>)}</tr>
              </thead>
              <tbody>
                {validRows.slice(0, 20).map((row, i) => (
                  <tr key={i} className="hover:bg-white/5">
                    {previewCols.map(c => <td key={c} className={TD}>{row[c] ?? '—'}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {validRows.length > 20 && (
            <p className="mb-4 text-xs text-white/40">Showing first 20 of {validRows.length} rows</p>
          )}

          <button className={BTN_P} onClick={handleImport} disabled={importing}>
            {importing ? <><Loader2 size={14} className="animate-spin" /> Importing…</> : <><Upload size={14} /> Import {validRows.length} rows</>}
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`${CARD} ${result.error ? 'border-danger/30 bg-danger/5' : 'border-green-500/30 bg-green-500/5'}`}>
          {result.error ? (
            <div className="flex items-start gap-2 text-danger">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Import failed</p>
                <p className="mt-1 text-sm">{result.error}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-green-500">
              <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Import successful</p>
                {result.upserted != null && <p className="mt-1 text-sm text-white/60">{result.upserted} records upserted.</p>}
              </div>
            </div>
          )}
          <button className={`${BTN_S} mt-4`} onClick={reset}>Import Another File</button>
        </div>
      )}
    </div>
  )
}
