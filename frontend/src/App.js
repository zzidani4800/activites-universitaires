import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'

// Pages
import LoginEtudiant         from './pages/LoginEtudiant'
import LoginAdmin            from './pages/LoginAdmin'
import Inscription           from './pages/Inscription'
import MesReservations       from './pages/MesReservations'
import Annulation            from './pages/Annulation'
import DashboardAdmin        from './pages/DashboardAdmin'
import AdminCreerUtilisateur from './pages/AdminCreerUtilisateur'

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-on-surface-variant">
      <span className="material-symbols-outlined animate-spin text-primary mr-2">progress_activity</span>
      Chargement...
    </div>
  )
  return isAuthenticated ? children : <Navigate to="/" replace />
}

function AdminRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-on-surface-variant">
      <span className="material-symbols-outlined animate-spin text-primary mr-2">progress_activity</span>
      Chargement...
    </div>
  )
  if (!isAuthenticated) return <Navigate to="/login-admin" replace />
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Publiques */}
        <Route path="/"            element={<LoginEtudiant />} />
        <Route path="/login-admin" element={<LoginAdmin />} />

        {/* Étudiant */}
        <Route path="/inscription"      element={<PrivateRoute><Inscription /></PrivateRoute>} />
        <Route path="/mes-reservations" element={<PrivateRoute><MesReservations /></PrivateRoute>} />
        <Route path="/annulation"       element={<PrivateRoute><Annulation /></PrivateRoute>} />

        {/* Admin */}
        <Route path="/admin/dashboard"         element={<AdminRoute><DashboardAdmin /></AdminRoute>} />
        <Route path="/admin/creer-utilisateur" element={<AdminRoute><AdminCreerUtilisateur /></AdminRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App