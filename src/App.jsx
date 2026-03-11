import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import SimulatorPage from './pages/SimulatorPage'
import CreateClient from './pages/CreateClient'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'

function Spinner({ dark = false }) {
  return (
    <div className={`min-h-screen flex items-center justify-center ${dark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${dark ? 'border-indigo-400' : 'border-indigo-600'}`} />
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (user) return <Navigate to="/" replace />
  return children
}

function AdminRoute({ children }) {
  const { user, loading, isSuperadmin } = useAuth()
  if (loading) return <Spinner dark />
  if (!user) return <Navigate to="/admin/login" replace />
  if (!isSuperadmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-xl font-bold text-red-500 mb-3">Access Denied</h1>
          <p className="text-gray-400 text-sm mb-4">You do not have superadmin privileges.</p>
          <a href="/" className="text-indigo-600 text-sm hover:underline">Go to Dashboard</a>
        </div>
      </div>
    )
  }
  return children
}

function AdminPublicRoute({ children }) {
  const { user, loading, isSuperadmin } = useAuth()
  if (loading) return <Spinner dark />
  if (user && isSuperadmin) return <Navigate to="/admin" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Regular user routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/clients/new" element={<ProtectedRoute><CreateClient /></ProtectedRoute>} />
      <Route path="/clients/:id" element={<ProtectedRoute><SimulatorPage /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminPublicRoute><AdminLogin /></AdminPublicRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
