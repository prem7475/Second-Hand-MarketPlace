import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { useAuth } from './context/AuthContext.jsx'
import AuthPage from './pages/AuthPage.jsx'
import Browse from './pages/Browse.jsx'
import Home from './pages/Home.jsx'
import Inbox from './pages/Inbox.jsx'
import ListingDetail from './pages/ListingDetail.jsx'
import Profile from './pages/Profile.jsx'
import Saved from './pages/Saved.jsx'
import SellPage from './pages/SellPage.jsx'

function AuthRedirect({ registration = false }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return null
  if (user) return <Navigate to={location.state?.from?.pathname || '/profile'} replace />
  return <AuthPage registration={registration} />
}

export default function App() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="app-frame">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/login" element={<AuthRedirect />} />
        <Route path="/register" element={<AuthRedirect registration />} />
        <Route
          path="/sell"
          element={
            <ProtectedRoute>
              <SellPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sell/:id"
          element={
            <ProtectedRoute>
              <SellPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <Saved />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inbox"
          element={
            <ProtectedRoute>
              <Inbox />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inbox/:id"
          element={
            <ProtectedRoute>
              <Inbox />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <main className="page-shell not-found">
              <span className="eyebrow">Not quite the right find</span>
              <h1>
                That page wandered <em>off.</em>
              </h1>
              <p>Let's get you back to the good stuff.</p>
              <Link className="button button-primary" to="/">
                Back to Refind
              </Link>
            </main>
          }
        />
      </Routes>
      <Footer />
    </div>
  )
}
