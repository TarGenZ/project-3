/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        base:     '#0F1B2D',
        panel:    '#162236',
        mid:      '#1E3050',
        line:     '#64748B',   // solid so /20, /30, /70 opacity modifiers work
        violet:  { DEFAULT: '#7C3AED', soft: '#9061F9' },
        amber:    '#F59E0B',
        lavender: '#A78BFA',
        success:  '#22C55E',
        danger:   '#EF4444',
      },
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        mono:    ['"DM Mono"', 'monospace'],
        display: ['Inter', 'sans-serif'],
      },
      maxWidth: { page: '1400px' },
      boxShadow: {
        glow:   '0 4px 24px rgba(0,0,0,0.3)',
        violet: '0 8px 40px rgba(124,58,237,0.15)',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        spin:   { to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease forwards',
        'spin-slow': 'spin 0.8s linear infinite',
      },
    },
  },
  plugins: [],
}
