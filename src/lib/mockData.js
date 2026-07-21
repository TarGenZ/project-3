export const RATING_PARAMS = [
  { key: 'rating_location', label: 'Location', icon: 'MapPin', weight: 0.08 },
  { key: 'rating_roi', label: 'ROI', icon: 'TrendingUp', weight: 0.15 },
  { key: 'rating_fees', label: 'Fees Value', icon: 'GraduationCap', weight: 0.10 },
  { key: 'rating_facilities', label: 'Facilities', icon: 'Building2', weight: 0.12 },
  { key: 'rating_faculty', label: 'Faculty', icon: 'Stethoscope', weight: 0.13 },
  { key: 'rating_campus', label: 'Campus', icon: 'Landmark', weight: 0.06 },
  { key: 'rating_hostel', label: 'Hostel', icon: 'Home', weight: 0.05 },
  { key: 'rating_patient_load', label: 'Patient Load', icon: 'HeartPulse', weight: 0.13 },
  { key: 'rating_research', label: 'Research', icon: 'FlaskConical', weight: 0.09 },
  { key: 'rating_placement', label: 'Placement', icon: 'BarChart3', weight: 0.09 },
]

// Computes the overall (final) rating as a weighted average of the 10 parameters.
// Weights reflect what matters most for a med student's decision — ROI, faculty
// quality, and patient load (clinical exposure) carry the most influence.
export function computeFinalRating(college) {
  let weightedSum = 0
  let totalWeight = 0
  for (const p of RATING_PARAMS) {
    const val = college[p.key]
    if (val === null || val === undefined || val === '') continue
    weightedSum += Number(val) * p.weight
    totalWeight += p.weight
  }
  if (totalWeight === 0) return 0
  // Re-normalize in case some parameters are missing, so the scale stays 0-10
  const raw = weightedSum / totalWeight
  return Math.round(raw * 10) / 10
}

const RAW_COLLEGES = [
  {
    id: '1', name: 'AIIMS New Delhi', city: 'New Delhi', state: 'Delhi',
    year_established: 1956, type: 'government', total_seats: 100, annual_fees: 1628,
    image_url: null, worthness: 'The gold standard of medical education in India. Exceptional research infrastructure, world-class faculty, and unmatched brand value. Every rupee spent here yields returns that are immeasurable.',
    rating_location: 9.5, rating_roi: 9.8, rating_fees: 9.9, rating_facilities: 9.7,
    rating_faculty: 9.9, rating_campus: 8.8, rating_hostel: 8.5, rating_patient_load: 9.6,
    rating_research: 9.8, rating_placement: 9.7,
  },
  {
    id: '2', name: 'Maulana Azad Medical College', city: 'New Delhi', state: 'Delhi',
    year_established: 1958, type: 'government', total_seats: 150, annual_fees: 2000,
    image_url: null, worthness: 'One of the best government medical colleges in India. Excellent patient load, strong faculty, and affordable fees make it a top choice for state quota candidates.',
    rating_location: 9.2, rating_roi: 9.1, rating_fees: 9.5, rating_facilities: 8.8,
    rating_faculty: 9.0, rating_campus: 7.9, rating_hostel: 8.0, rating_patient_load: 9.4,
    rating_research: 8.5, rating_placement: 8.9,
  },
  {
    id: '3', name: 'Grant Medical College', city: 'Mumbai', state: 'Maharashtra',
    year_established: 1845, type: 'government', total_seats: 200, annual_fees: 25000,
    image_url: null, worthness: 'Historic institution with rich legacy. Attached to JJ Hospital, one of the busiest hospitals in Asia. Strong clinical exposure.',
    rating_location: 8.5, rating_roi: 8.7, rating_fees: 9.0, rating_facilities: 8.2,
    rating_faculty: 8.6, rating_campus: 7.5, rating_hostel: 7.8, rating_patient_load: 9.5,
    rating_research: 7.9, rating_placement: 8.4,
  },
  {
    id: '4', name: 'Kasturba Medical College Manipal', city: 'Manipal', state: 'Karnataka',
    year_established: 1953, type: 'deemed', total_seats: 250, annual_fees: 1350000,
    image_url: null, worthness: 'Premier private deemed university with excellent infrastructure and international recognition. High fees but strong ROI for those seeking global opportunities.',
    rating_location: 7.8, rating_roi: 7.5, rating_fees: 4.0, rating_facilities: 9.2,
    rating_faculty: 8.9, rating_campus: 9.1, rating_hostel: 8.7, rating_patient_load: 8.5,
    rating_research: 8.8, rating_placement: 9.0,
  },
  {
    id: '5', name: 'JIPMER Puducherry', city: 'Puducherry', state: 'Puducherry',
    year_established: 1823, type: 'government', total_seats: 150, annual_fees: 1628,
    image_url: null, worthness: 'National importance institution with autonomous status. Excellent research environment and clinical training. Highly competitive cutoffs.',
    rating_location: 8.0, rating_roi: 9.5, rating_fees: 9.8, rating_facilities: 9.3,
    rating_faculty: 9.2, rating_campus: 8.9, rating_hostel: 8.6, rating_patient_load: 9.1,
    rating_research: 9.4, rating_placement: 9.3,
  },
  {
    id: '6', name: 'Vardhman Mahavir Medical College', city: 'New Delhi', state: 'Delhi',
    year_established: 2001, type: 'government', total_seats: 150, annual_fees: 2000,
    image_url: null, worthness: 'Attached to Safdarjung Hospital — one of Delhi\'s largest. Newer institution but rapidly growing in reputation. Great patient exposure.',
    rating_location: 8.8, rating_roi: 8.9, rating_fees: 9.5, rating_facilities: 8.5,
    rating_faculty: 8.7, rating_campus: 8.0, rating_hostel: 7.9, rating_patient_load: 9.3,
    rating_research: 8.2, rating_placement: 8.6,
  },
]

// final_rating is derived automatically from the weighted parameters above —
// kept in sync with how the admin panel and bulk import compute it.
export const MOCK_COLLEGES = RAW_COLLEGES.map(c => ({ ...c, final_rating: computeFinalRating(c) }))

export const MOCK_QUOTAS = [
  { id: 'q1', college_id: '1', name: 'General', quota_type: 'all_india' },
  { id: 'q2', college_id: '1', name: 'OBC', quota_type: 'all_india' },
  { id: 'q3', college_id: '1', name: 'SC', quota_type: 'all_india' },
  { id: 'q4', college_id: '1', name: 'ST', quota_type: 'all_india' },
  { id: 'q5', college_id: '2', name: 'General', quota_type: 'all_india' },
  { id: 'q6', college_id: '2', name: 'Delhi State - General', quota_type: 'state' },
  { id: 'q7', college_id: '2', name: 'OBC', quota_type: 'all_india' },
  { id: 'q8', college_id: '3', name: 'General', quota_type: 'all_india' },
  { id: 'q9', college_id: '3', name: 'MH State - General', quota_type: 'state' },
  { id: 'q10', college_id: '4', name: 'General', quota_type: 'all_india' },
  { id: 'q11', college_id: '5', name: 'General', quota_type: 'all_india' },
  { id: 'q12', college_id: '5', name: 'OBC', quota_type: 'all_india' },
  { id: 'q13', college_id: '6', name: 'General', quota_type: 'all_india' },
  { id: 'q14', college_id: '6', name: 'Delhi State - General', quota_type: 'state' },
]

export const MOCK_CUTOFFS = [
  // AIIMS General AIQ
  { id: 'c1', quota_id: 'q1', year: 2024, round_number: 1, closing_rank: 35 },
  { id: 'c2', quota_id: 'q1', year: 2024, round_number: 2, closing_rank: 42 },
  { id: 'c3', quota_id: 'q1', year: 2024, round_number: 3, closing_rank: 50 },
  { id: 'c4', quota_id: 'q1', year: 2023, round_number: 1, closing_rank: 32 },
  { id: 'c5', quota_id: 'q1', year: 2023, round_number: 2, closing_rank: 38 },
  { id: 'c6', quota_id: 'q1', year: 2023, round_number: 3, closing_rank: 45 },
  { id: 'c7', quota_id: 'q1', year: 2022, round_number: 1, closing_rank: 28 },
  { id: 'c8', quota_id: 'q1', year: 2022, round_number: 2, closing_rank: 36 },
  // AIIMS OBC
  { id: 'c9', quota_id: 'q2', year: 2024, round_number: 1, closing_rank: 120 },
  { id: 'c10', quota_id: 'q2', year: 2024, round_number: 2, closing_rank: 145 },
  { id: 'c11', quota_id: 'q2', year: 2024, round_number: 3, closing_rank: 160 },
  { id: 'c12', quota_id: 'q2', year: 2023, round_number: 1, closing_rank: 110 },
  { id: 'c13', quota_id: 'q2', year: 2023, round_number: 2, closing_rank: 130 },
  // AIIMS SC
  { id: 'c14', quota_id: 'q3', year: 2024, round_number: 1, closing_rank: 850 },
  { id: 'c15', quota_id: 'q3', year: 2024, round_number: 2, closing_rank: 980 },
  { id: 'c16', quota_id: 'q3', year: 2024, round_number: 3, closing_rank: 1100 },
  { id: 'c17', quota_id: 'q3', year: 2023, round_number: 1, closing_rank: 780 },
  // AIIMS ST
  { id: 'c18', quota_id: 'q4', year: 2024, round_number: 1, closing_rank: 3500 },
  { id: 'c19', quota_id: 'q4', year: 2024, round_number: 2, closing_rank: 4200 },
  { id: 'c20', quota_id: 'q4', year: 2023, round_number: 1, closing_rank: 3200 },
  // MAMC General AIQ
  { id: 'c21', quota_id: 'q5', year: 2024, round_number: 1, closing_rank: 320 },
  { id: 'c22', quota_id: 'q5', year: 2024, round_number: 2, closing_rank: 380 },
  { id: 'c23', quota_id: 'q5', year: 2023, round_number: 1, closing_rank: 300 },
  { id: 'c24', quota_id: 'q5', year: 2023, round_number: 2, closing_rank: 350 },
  // MAMC Delhi State
  { id: 'c25', quota_id: 'q6', year: 2024, round_number: 1, closing_rank: 220 },
  { id: 'c26', quota_id: 'q6', year: 2024, round_number: 2, closing_rank: 270 },
]
