import { useState, useMemo } from 'react'
import { useColleges } from '../hooks/useData'
import CollegeCard from '../components/explorer/CollegeCard'
import { Search } from 'lucide-react'

const STATES = [
  'Andaman And Nicobar Islands','Andhra Pradesh','Arunachal Pradesh','Assam',
  'Bihar','Chandigarh','Chhattisgarh','Dadra And Nagar Haveli','Delhi','Goa',
  'Gujarat','Haryana','Himachal Pradesh','Jammu And Kashmir','Jharkhand',
  'Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya',
  'Mizoram','Nagaland','Odisha','Puducherry','Punjab','Rajasthan','Sikkim',
  'Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
]
const TYPES        = ['government', 'private', 'deemed']
const SORT_OPTIONS = [
  { value: 'final_rating', label: 'Top Rated'    },
  { value: 'fees_asc',     label: 'Lowest Fees'  },
  { value: 'fees_desc',    label: 'Highest Fees' },
  { value: 'year_asc',     label: 'Oldest'       },
  { value: 'name',         label: 'A–Z'          },
]

const CHIP_BASE   = 'px-3 py-1 rounded-full text-sm font-medium border border-line/20 bg-transparent text-white/60 cursor-pointer transition hover:border-violet/40 hover:text-violet'
const CHIP_ACTIVE = 'bg-violet/15 border-violet text-violet'
const INPUT_CLS   = 'w-full bg-white/5 border border-line/20 rounded-lg text-white px-3.5 py-2 text-sm outline-none transition placeholder:text-white/30 focus:border-violet/60 focus:bg-violet/5'

export default function ExplorePage() {
  const { colleges, loading } = useColleges()
  const [search,       setSearch]       = useState('')
  const [filterTypes,  setFilterTypes]  = useState([])
  const [filterStates, setFilterStates] = useState([])
  const [sortBy,       setSortBy]       = useState('final_rating')
  const [minRating,    setMinRating]    = useState(0)
  const [stateSearch,  setStateSearch]  = useState('')

  const toggle = (list, setList, val) =>
    setList(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val])

  const filteredStates = useMemo(
    () => STATES.filter(s => s.toLowerCase().includes(stateSearch.toLowerCase())),
    [stateSearch],
  )

  const filtered = useMemo(() => {
    let list = [...colleges]
    if (search)              list = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.city?.toLowerCase().includes(search.toLowerCase()) || c.state?.toLowerCase().includes(search.toLowerCase()))
    if (filterTypes.length)  list = list.filter(c => filterTypes.includes(c.type))
    if (filterStates.length) list = list.filter(c => filterStates.includes(c.state))
    if (minRating > 0)       list = list.filter(c => (c.final_rating || 0) >= minRating)
    list.sort((a, b) => {
      if (sortBy === 'final_rating') return (b.final_rating || 0) - (a.final_rating || 0)
      if (sortBy === 'fees_asc')     return (a.annual_fees || 0)  - (b.annual_fees || 0)
      if (sortBy === 'fees_desc')    return (b.annual_fees || 0)  - (a.annual_fees || 0)
      if (sortBy === 'year_asc')     return (a.year_established || 0) - (b.year_established || 0)
      if (sortBy === 'name')         return a.name.localeCompare(b.name)
      return 0
    })
    return list
  }, [colleges, search, filterTypes, filterStates, sortBy, minRating])

  const hasFilters = filterTypes.length || filterStates.length || minRating > 0

  return (
    <div className="max-w-page mx-auto px-4 sm:px-6">
      {/* Page header */}
      <div className="mb-4 border-b border-line/20 py-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Explore MBBS Colleges</h1>
        <p className="mt-1 text-sm text-white/60">{filtered.length} colleges found</p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 py-5 md:grid-cols-[280px_1fr]">
        {/* ── Filter panel ─────────────────────────────────────────── */}
        <aside className="rounded-xl border border-line/20 bg-panel p-4 md:sticky md:top-[88px]">
          <p className="mb-4 text-sm font-bold text-white">Filters</p>

          {/* Type */}
          <div className="mb-4 border-b border-line/20 pb-4">
            <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[1px] text-white/40">College Type</p>
            <div className="flex flex-wrap gap-1.5">
              {TYPES.map(t => (
                <button key={t} onClick={() => toggle(filterTypes, setFilterTypes, t)}
                  className={`${CHIP_BASE} ${filterTypes.includes(t) ? CHIP_ACTIVE : ''}`}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* State */}
          <div className="mb-4 border-b border-line/20 pb-4">
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-[1px] text-white/40">State</p>
              {filterStates.length > 0 && (
                <span className="font-mono text-[11px] font-semibold text-violet">({filterStates.length} selected)</span>
              )}
            </div>
            <input type="text" placeholder="Search state..." value={stateSearch}
              onChange={e => setStateSearch(e.target.value)} className={`${INPUT_CLS} mb-1.5`} />
            <div className="flex max-h-[180px] flex-col gap-1 overflow-y-auto rounded-lg border border-line/20 bg-mid p-1.5">
              {filteredStates.length === 0
                ? <p className="py-3 text-center text-sm text-white/40">No states found</p>
                : filteredStates.map(s => {
                  const checked = filterStates.includes(s)
                  return (
                    <label key={s} className={`flex cursor-pointer select-none items-center gap-2.5 rounded-md px-2 py-1.5 text-[13.5px] transition hover:bg-white/5 ${checked ? 'bg-white/5' : ''}`}>
                      <input type="checkbox" checked={checked} onChange={() => toggle(filterStates, setFilterStates, s)}
                        className="cursor-pointer accent-violet" style={{ width: 14, height: 14 }} />
                      <span className={checked ? 'font-semibold text-white' : 'text-white/60'}>
                        {s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </span>
                    </label>
                  )
                })}
            </div>
          </div>

          {/* Min Rating */}
          <div className="mb-4 border-b border-line/20 pb-4">
            <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[1px] text-white/40">Min Rating</p>
            <div className="flex flex-wrap gap-1.5">
              {[0, 7, 8, 9].map(v => (
                <button key={v} onClick={() => setMinRating(v)}
                  className={`${CHIP_BASE} ${minRating === v ? CHIP_ACTIVE : ''}`}>
                  {v === 0 ? 'All' : `${v}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="mb-4">
            <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[1px] text-white/40">Sort By</p>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={INPUT_CLS}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {hasFilters && (
            <button onClick={() => { setFilterTypes([]); setFilterStates([]); setMinRating(0); setStateSearch('') }}
              className="w-full rounded-lg bg-white/5 px-4 py-2 text-sm text-white/60 transition hover:bg-white/10 hover:text-white">
              Clear All Filters
            </button>
          )}
        </aside>

        {/* ── College grid ─────────────────────────────────────────── */}
        <div>
          <div className="mb-6 flex items-center gap-2.5 rounded-lg border border-line/20 bg-white/5 px-3.5 py-2.5 transition focus-within:border-violet/60">
            <Search size={16} className="text-white/40" />
            <input placeholder="Search college name, city, or state…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30" />
          </div>

          {loading ? (
            <p className="py-20 text-center text-sm text-white/60">Loading colleges…</p>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <Search size={48} className="mx-auto mb-3 text-white/20" />
              <p className="mb-1 text-lg font-semibold text-white">No colleges match your filters</p>
              <p className="text-sm text-white/60">Try adjusting your search or clearing filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {filtered.map(c => <CollegeCard key={c.id} college={c} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
