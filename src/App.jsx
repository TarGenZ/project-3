import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AuthProvider from './auth/AuthProvider.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import Navbar from './components/ui/Navbar.jsx'
import HomePage from './pages/HomePage.jsx'
import ExplorePage from './pages/ExplorePage.jsx'
import CollegePage from './pages/CollegePage.jsx'
import AuthCallback from './pages/AuthCallback.jsx'
import ComingSoonPage from './pages/ComingSoonPage.jsx'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen bg-base text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/"                   element={<HomePage />} />
                <Route path="/explore"            element={<ExplorePage />} />
                <Route path="/college/:id"        element={<CollegePage />} />
                <Route path="/auth/callback"      element={<AuthCallback />} />
                <Route path="/shortlister"        element={<ComingSoonPage />} />
                <Route path="/rank-predictor"     element={<ComingSoonPage />} />
                <Route path="/college-compare"    element={<ComingSoonPage />} />
                <Route path="/counselling-guide"  element={<ComingSoonPage />} />
              </Routes>
            </main>
            <footer className="border-t border-line/20 py-5 px-6 text-center text-[13px] text-white/50">
              Cutoffs —{' '}
              <a href="https://arpansarkar.org" className="text-violet hover:text-violet-soft transition-colors">
                arpansarkar.org
              </a>
            </footer>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
