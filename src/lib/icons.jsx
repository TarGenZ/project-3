import {
  MapPin, TrendingUp, GraduationCap, Building2, Stethoscope,
  Landmark, Home, HeartPulse, FlaskConical, BarChart3,
} from 'lucide-react'

// Maps RATING_PARAMS icon keys to Lucide components
export const PARAM_ICONS = {
  MapPin, TrendingUp, GraduationCap, Building2, Stethoscope,
  Landmark, Home, HeartPulse, FlaskConical, BarChart3,
}

export function ParamIcon({ name, size = 14, color = 'currentColor', style }) {
  const Icon = PARAM_ICONS[name]
  if (!Icon) return null
  return <Icon size={size} color={color} style={style} />
}
