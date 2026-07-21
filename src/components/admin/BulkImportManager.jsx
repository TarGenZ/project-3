import { useState, useRef } from 'react'
import { IMPORT_TYPES, CUTOFF_WIDE_FIXED_COLS, parseSpreadsheetFile, validateRows, parseCutoffWideRows, downloadTemplate } from '../../lib/bulkImport'
import { bulkUpsertColleges, bulkUpsertQuotas, bulkUpsertCutoffRounds, useColleges } from '../../hooks/useData'
import { Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react'

const UPLOAD_FN = {
  colleges: bulkUpsertColleges,
  quotas: bulkUpsertQuotas,
  cutoffs: bulkUpsertCutoffRounds,
}

const TYPE_TABS = [
  { key: 'colleges', label: 'Colleges' },
  { key: 'quotas', label: 'Quotas' },
  { key: 'cutoffs', label: 'Cutoff Rounds' },
]

const DESCRIPTIONS = {
  colleges: 'Each row is one college. Rating fields (0–10) are optional and default to 5. final_rating is auto-computed. Uploading an existing college name updates it.',
  quotas: '"college_name" must exactly match an existing college (case-insensitive). Duplicate quota+type combos are skipped.',
  cutoffs: 'Wide format: one row per college + quota + round number. Each year gets its own column (closing_rank_2023, closing_rank_2024, …). Leave a cell blank if data isn\'t available for that year. Uploading an existing round updates its closing rank.',
}

export default function BulkImportManager() {
  const [type, setType] = useState('colleges')
  const [fileName, setFileName] = useState(null)
  const [parsing, setParsing] = useState(false)
  const [parseErrors, setParseErrors] = useState([])
  const [validRows, setValidRows] = useState([])
  const [detectedYears, setDetectedYears] = useState([]) // only for cutoffs wide format
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState(null)
  const fileInputRef = useRef(null)
  const { refetch: refetchColleges } = useColleges()

  const reset = () => {
    setFileName(null); setParseErrors([]); setValidRows([])
    setResult(null); setDetectedYears([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const switchType = (newType) => { setType(newType); reset() }

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    reset(); setFileName(file.name); setParsing(true)
    try {
      const rawRows = await parseSpreadsheetFile(file)
      if (type === 'cutoffs') {
        const { validRows: valid, errors } = parseCutoffWideRows(rawRows)
        // Detect which years were found for the preview header
        const years = [...new Set(valid.map(r => r.year))].sort((a, b) => a - b)
        setDetectedYears(years)
        setValidRows(valid)
        setParseErrors(errors)
      } else {
        const config = IMPORT_TYPES[type]
        const { validRows: valid, errors } = validateRows(rawRows, config.columns)
        setValidRows(valid)
        setParseErrors(errors)
      }
    } catch (err) {
      setParseErrors([{ row: '-', message: `Could not read file: ${err.message}` }])
    }
    setParsing(false)
  }

  const handleImport = async () => {
    setImporting(true)
    const { error, ...stats } = await UPLOAD_FN[type](validRows)
    setImporting(false)
    setResult({ ...stats, error })
    if (type === 'colleges') refetchColleges()
  }

  const config = IMPORT_TYPES[type]

  // Build preview table columns
  const previewCols = type === 'cutoffs'
    ? ['college_name', 'quota_name', 'quota_type', 'round_number', 'year', 'closing_rank']
    : config.columns?.map(c => c.key) || []

  return (
    <div>
      <h2 className="page-title" style={{ fontSize: 22, marginBottom: 8 }}>Bulk Import</h2>
      <p className="page-sub" style={{ marginBottom: 20 }}>Upload a CSV or Excel file to add or update many records at once.</p>

      <div className="quota-tabs" style={{ marginBottom: 20 }}>
        {TYPE_TABS.map(t => (
          <button key={t.key} className={`quota-tab ${type === t.key ? 'active' : ''}`} onClick={() => switchType(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Step 1 */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <p className="section-title">Step 1 — Get the template</p>
        <p style={{ fontSize: 14, color: 'var(--slate-light)', marginBottom: 14, lineHeight: 1.6 }}>
          {DESCRIPTIONS[type]}
        </p>
        {type === 'cutoffs' && (
          <div style={{ background: 'var(--white-dim)', borderRadius: 8, padding: 12, marginBottom: 14, fontSize: 12, color: 'var(--slate-light)', fontFamily: 'DM Mono, monospace', lineHeight: 1.8, overflowX: 'auto' }}>
            college_name &nbsp;| quota_name | quota_type &nbsp;| round_number | closing_rank_2023 | closing_rank_2024 | closing_rank_2025<br />
            AIIMS Delhi &nbsp; | UR &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | all_india &nbsp; | 1 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | 32 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | 35 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | 33<br />
            AIIMS Delhi &nbsp; | UR &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | all_india &nbsp; | 2 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | 38 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | 42 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | 40
          </div>
        )}
        <button className="btn btn-secondary" onClick={() => downloadTemplate(type)}>
          <Download size={14} /> Download {type === 'cutoffs' ? 'Cutoff Rounds' : config.label} Template
        </button>
      </div>

      {/* Step 2 */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <p className="section-title">Step 2 — Upload your file</p>
        <div style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: 32, textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.15s' }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const file = e.dataTransfer.files?.[0]; if (file) handleFile({ target: { files: [file] } }) }}
        >
          <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={handleFile} />
          <Upload size={28} color="var(--slate-light)" style={{ marginBottom: 10 }} />
          <p style={{ fontWeight: 600, marginBottom: 4 }}>{fileName || 'Click to upload or drag a file here'}</p>
          <p style={{ fontSize: 13, color: 'var(--slate-light)' }}>.csv, .xlsx, or .xls</p>
        </div>

        {parsing && (
          <p style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--slate-light)', fontSize: 14 }}>
            <Loader2 size={14} className="spinner" /> Parsing file…
          </p>
        )}

        {!parsing && fileName && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <FileSpreadsheet size={18} color="var(--teal)" />
              <span style={{ fontSize: 14, fontWeight: 600 }}>{fileName}</span>
              {type === 'cutoffs' && detectedYears.length > 0 && (
                <span style={{ fontSize: 12, color: 'var(--teal)', background: 'var(--teal-dim)', borderRadius: 4, padding: '2px 8px' }}>
                  Years: {detectedYears.join(', ')}
                </span>
              )}
              <button className="btn btn-ghost btn-sm" onClick={reset} style={{ marginLeft: 'auto' }}><X size={13} /></button>
            </div>

            <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--success)' }}>
                <CheckCircle2 size={14} /> {validRows.length} valid {type === 'cutoffs' ? 'round entries' : `row${validRows.length === 1 ? '' : 's'}`}
              </span>
              {parseErrors.length > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--danger)' }}>
                  <AlertCircle size={14} /> {parseErrors.length} error{parseErrors.length === 1 ? '' : 's'} (skipped)
                </span>
              )}
            </div>

            {parseErrors.length > 0 && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: 12, marginBottom: 12, maxHeight: 160, overflowY: 'auto' }}>
                {parseErrors.slice(0, 50).map((e, i) => (
                  <p key={i} style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 4 }}>Row {e.row}: {e.message}</p>
                ))}
                {parseErrors.length > 50 && <p style={{ fontSize: 12, color: 'var(--danger)' }}>…and {parseErrors.length - 50} more</p>}
              </div>
            )}

            {validRows.length > 0 && (
              <div className="admin-table-wrap" style={{ marginBottom: 16, maxHeight: 280, overflowY: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>{previewCols.map(k => <th key={k}>{k}</th>)}</tr>
                  </thead>
                  <tbody>
                    {validRows.slice(0, 20).map((row, i) => (
                      <tr key={i}>
                        {previewCols.map(k => (
                          <td key={k} className={typeof row[k] === 'number' ? 'mono' : ''}>
                            {row[k] === null || row[k] === '' ? <span style={{ color: 'var(--slate)' }}>—</span> : String(row[k])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {validRows.length > 20 && (
                  <p style={{ fontSize: 12, color: 'var(--slate-light)', padding: 10, textAlign: 'center' }}>
                    …and {validRows.length - 20} more entries
                  </p>
                )}
              </div>
            )}

            {validRows.length > 0 && !result && (
              <button className="btn btn-primary" onClick={handleImport} disabled={importing}>
                {importing ? <><Loader2 size={14} className="spinner" /> Importing…</> : `Import ${validRows.length} ${type === 'cutoffs' ? 'Entries' : `Row${validRows.length === 1 ? '' : 's'}`}`}
              </button>
            )}
          </div>
        )}
      </div>

      {result && (
        <div className="card" style={{ padding: 24 }}>
          <p className="section-title">Result</p>
          {result.error ? (
            <div className="form-error">{result.error}</div>
          ) : (
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: result.errors?.length ? 12 : 0 }}>
              {result.inserted !== undefined && (
                <div>
                  <p className="mono teal" style={{ fontSize: 24, fontWeight: 700 }}>{result.inserted}</p>
                  <p style={{ fontSize: 12, color: 'var(--slate-light)' }}>Inserted</p>
                </div>
              )}
              {result.updated !== undefined && (
                <div>
                  <p className="mono amber" style={{ fontSize: 24, fontWeight: 700 }}>{result.updated}</p>
                  <p style={{ fontSize: 12, color: 'var(--slate-light)' }}>Updated</p>
                </div>
              )}
              {result.skipped !== undefined && (
                <div>
                  <p className="mono" style={{ fontSize: 24, fontWeight: 700, color: 'var(--slate-light)' }}>{result.skipped}</p>
                  <p style={{ fontSize: 12, color: 'var(--slate-light)' }}>Skipped (duplicate)</p>
                </div>
              )}
            </div>
          )}
          {result.errors?.length > 0 && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: 12, maxHeight: 160, overflowY: 'auto' }}>
              {result.errors.slice(0, 50).map((e, i) => (
                <p key={i} style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 4 }}>{e}</p>
              ))}
            </div>
          )}
          <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={reset}>Import Another File</button>
        </div>
      )}
    </div>
  )
}
