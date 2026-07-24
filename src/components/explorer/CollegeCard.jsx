import { useNavigate } from 'react-router-dom'
import RatingRing from '../ui/RatingRing'
import { MapPin, IndianRupee, Armchair } from 'lucide-react'

const TYPE_BADGE  = { government: 'bg-green-500/15 text-green-500', private: 'bg-amber/15 text-amber', deemed: 'bg-[#8B5CF6]/15 text-lavender' }
const TYPE_LABEL  = { government: 'Govt', private: 'Private', deemed: 'Deemed' }

export default function CollegeCard({ college }) {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => navigate(`/college/${college.id}`)}
      className="animate-fade-in cursor-pointer rounded-xl border border-line/20 bg-panel p-4 transition-all hover:border-violet/40 hover:shadow-violet"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 pr-3">
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${TYPE_BADGE[college.type] || TYPE_BADGE.government}`}>
            {TYPE_LABEL[college.type] || college.type}
          </span>
          <p className="mt-2 text-base font-bold leading-snug text-white">{college.name}</p>
          <p className="mt-1 text-sm text-white/60">
            <MapPin size={12} className="mr-1 inline align-text-bottom" />
            {college.city}, {college.state}
            <span className="ml-2.5 font-mono text-xs text-violet">Est. {college.year_established}</span>
          </p>
        </div>
        <RatingRing value={college.final_rating} size={68} />
      </div>

      <div className="flex flex-wrap gap-4">
        {college.annual_fees && (
          <span className="flex items-center gap-1 text-sm text-white/60">
            <IndianRupee size={14} /> {Number(college.annual_fees).toLocaleString('en-IN')}/yr
          </span>
        )}
        {college.total_seats && (
          <span className="flex items-center gap-1 text-sm text-white/60">
            <Armchair size={14} /> {college.total_seats} seats
          </span>
        )}
      </div>
    </div>
  )
}
