import { useNavigate } from 'react-router-dom'
import RatingRing from '../ui/RatingRing'
import { MapPin, IndianRupee, Armchair } from 'lucide-react'

const TYPE_BADGE = { government: 'badge-govt', private: 'badge-private', deemed: 'badge-deemed' }
const TYPE_LABEL = { government: 'Govt', private: 'Private', deemed: 'Deemed' }

export default function CollegeCard({ college }) {
  const navigate = useNavigate()

  return (
    <div className="card college-card fade-in" onClick={() => navigate(`/college/${college.id}`)}>
      <div className="college-card-header" style={{ marginBottom: 12 }}>
        <div style={{ flex: 1, paddingRight: 12 }}>
          <span className={`badge ${TYPE_BADGE[college.type] || 'badge-govt'}`}>
            {TYPE_LABEL[college.type] || college.type}
          </span>
          <p className="college-card-title" style={{ marginTop: 8 }}>{college.name}</p>
          <p className="college-card-meta">
            <MapPin size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'text-bottom' }} />
            {college.city}, {college.state}
            <span style={{ marginLeft: 10, fontFamily: 'DM Mono', fontSize: 12, color: 'var(--teal)' }}>
              Est. {college.year_established}
            </span>
          </p>
        </div>
        <RatingRing value={college.final_rating} size={68} />
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {college.annual_fees && (
          <span style={{ fontSize: 13, color: 'var(--slate-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <IndianRupee size={14} /> {Number(college.annual_fees).toLocaleString('en-IN')}/yr
          </span>
        )}
        {college.total_seats && (
          <span style={{ fontSize: 13, color: 'var(--slate-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Armchair size={14} /> {college.total_seats} seats
          </span>
        )}
      </div>
    </div>
  )
}
