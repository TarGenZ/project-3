import { useState, useMemo } from 'react'
import { useColleges } from '../hooks/useData'
import CollegeCard from '../components/explorer/CollegeCard'
import { Search } from 'lucide-react'

const states = [
  'Andaman And Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 
  'Bihar', 'Chandigarh', 'Chhattisgarh', 'Dadra And Nagar Haveli', 'Delhi', 'Goa', 
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu And Kashmir', 'Jharkhand', 
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
]
const TYPES = ['government', 'private', 'deemed']
const SORT_OPTIONS = [
  { value: 'final_rating', label: 'Top Rated' },
  { value: 'fees_asc', label: 'Lowest Fees' },
  { value: 'fees_desc', label: 'Highest Fees' },
  { value: 'year_asc', label: 'Oldest' },
  { value: 'name', label: 'A–Z' },
]

export default function ExplorePage() {
  const { colleges, loading } = useColleges()
  const [search, setSearch] = useState('')
  const [filterTypes, setFilterTypes] = useState([])
  const [filterStates, setFilterStates] = useState([])
  const [sortBy, setSortBy] = useState('final_rating')
  const [minRating, setMinRating] = useState(0)
  const [stateSearch, setStateSearch] = useState('')

  const toggleFilter = (list, setList, val) =>
    setList(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val])

  const filteredStatesList = useMemo(() => {
    return states.filter(s => s.toLowerCase().includes(stateSearch.toLowerCase()))
  }, [stateSearch])

  const filtered = useMemo(() => {
    let list = [...colleges]
    if (search) list = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.city?.toLowerCase().includes(search.toLowerCase()) || c.state?.toLowerCase().includes(search.toLowerCase()))
    if (filterTypes.length) list = list.filter(c => filterTypes.includes(c.type))
    if (filterStates.length) list = list.filter(c => filterStates.includes(c.state))
    if (minRating > 0) list = list.filter(c => (c.final_rating || 0) >= minRating)
    list.sort((a, b) => {
      if (sortBy === 'final_rating') return (b.final_rating || 0) - (a.final_rating || 0)
      if (sortBy === 'fees_asc') return (a.annual_fees || 0) - (b.annual_fees || 0)
      if (sortBy === 'fees_desc') return (b.annual_fees || 0) - (a.annual_fees || 0)
      if (sortBy === 'year_asc') return (a.year_established || 0) - (b.year_established || 0)
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return 0
    })
    return list
  }, [colleges, search, filterTypes, filterStates, sortBy, minRating])

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Explore MBBS Colleges</h1>
        <p className="page-sub">{filtered.length} colleges found</p>
      </div>

      <div className="explorer-layout">
        {/* Filter Panel */}
        <aside className="filter-panel">
          <p style={{ fontWeight: 700, marginBottom: 16, fontSize: 14 }}>Filters</p>

          <div className="filter-section">
            <p className="filter-title">College Type</p>
            <div className="filter-chips">
              {TYPES.map(t => (
                <button key={t} className={`chip ${filterTypes.includes(t) ? 'active' : ''}`}
                  onClick={() => toggleFilter(filterTypes, setFilterTypes, t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Theme-Integrated Scrollable State Filter Section */}
          <div className="filter-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <p className="filter-title" style={{ margin: 0 }}>State</p>
              {filterStates.length > 0 && (
                <span className="mono" style={{ fontSize: 11, color: 'var(--teal)', fontWeight: 600 }}>
                  ({filterStates.length} selected)
                </span>
              )}
            </div>

            {/* Inline Search Bar for States */}
            <div style={{ position: 'relative', marginBottom: 6 }}>
              <input 
                type="text"
                placeholder="Search state..."
                value={stateSearch}
                onChange={e => setStateSearch(e.target.value)}
                className="field-input"
                style={{
                  padding: '6px 10px',
                  fontSize: '13px',
                  borderRadius: 'var(--radius-sm)'
                }}
              />
            </div>
            
            {/* Scrollable Container matching your theme */}
            <div 
              className="scrollable-filter-list" 
              style={{ 
                maxHeight: '180px', 
                overflowY: 'auto', 
                border: '1px solid var(--border)', 
                borderRadius: 'var(--radius-sm)',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                backgroundColor: 'var(--navy-light)'
              }}
            >
              {filteredStatesList.length === 0 ? (
                <div className="muted" style={{ fontSize: '13px', textAlign: 'center', padding: '12px 0' }}>
                  No states found
                </div>
              ) : (
                filteredStatesList.map(s => {
                  const formattedName = s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                  const isChecked = filterStates.includes(s);
                  
                  return (
                    <label 
                      key={s} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px', 
                        fontSize: '13.5px',
                        cursor: 'pointer',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        backgroundColor: isChecked ? 'var(--white-dim)' : 'transparent',
                        transition: 'background 0.15s ease',
                        userSelect: 'none'
                      }}
                    >
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={() => toggleFilter(filterStates, setFilterStates, s)}
                        style={{ 
                          cursor: 'pointer',
                          accentColor: 'var(--teal)',
                          width: '14px',
                          height: '14px'
                        }}
                      />
                      <span style={{ 
                        fontWeight: isChecked ? 600 : 400, 
                        color: isChecked ? 'var(--white)' : 'var(--slate-light)' 
                      }}>
                        {formattedName}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <div className="filter-section">
            <p className="filter-title">Min Rating</p>
            <div className="filter-chips">
              {[0, 7, 8, 9].map(v => (
                <button key={v} className={`chip ${minRating === v ? 'active' : ''}`} onClick={() => setMinRating(v)}>
                  {v === 0 ? 'All' : `${v}+`}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <p className="filter-title">Sort By</p>
            <select className="field-input" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {(filterTypes.length || filterStates.length || minRating > 0) && (
            <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => { setFilterTypes([]); setFilterStates([]); setMinRating(0); setStateSearch(''); }}>
              Clear All Filters
            </button>
          )}
        </aside>

        {/* Main Content */}
        <div>
          <div className="search-bar" style={{ marginBottom: '24px' }}>
            <Search size={16} color="var(--slate)" />
            <input placeholder="Search college name, city, or state…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 80, color: 'var(--slate-light)' }}>Loading colleges…</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Search size={48} color="var(--white)" /></div>
              <p className="empty-state-title">No colleges match your filters</p>
              <p>Try adjusting your search or clearing filters.</p>
            </div>
          ) : (
            <div className="college-grid">
              {filtered.map(c => <CollegeCard key={c.id} college={c} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
