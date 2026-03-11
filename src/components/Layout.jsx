import { Link, useNavigate, useLocation } from 'react-router-dom'
import { TrendingUp, BarChart2, Plus, LogOut, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useClients } from '../hooks/useClients'

export default function Layout({ children }) {
  const { user, signOut } = useAuth()
  const { clients, loading } = useClients()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp size={15} className="text-white" />
            </div>
            <div className="leading-tight">
              <p className="text-xs font-bold text-gray-900">Profit Simulator</p>
              <p className="text-[11px] text-gray-400">Business Intelligence</p>
            </div>
          </div>
        </div>

        {/* Client list */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Clients
            </span>
            <Link
              to="/clients/new"
              className="flex items-center gap-0.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <Plus size={13} />
              New
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500" />
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-8 px-2">
              <BarChart2 size={28} className="mx-auto text-gray-200 mb-2" />
              <p className="text-xs text-gray-400 mb-1">No clients yet</p>
              <Link
                to="/clients/new"
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Create first client
              </Link>
            </div>
          ) : (
            <nav className="space-y-0.5">
              {clients.map((client) => {
                const isActive = location.pathname === `/clients/${client.id}`
                return (
                  <Link
                    key={client.id}
                    to={`/clients/${client.id}`}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <BarChart2
                      size={14}
                      className={isActive ? 'text-indigo-500 flex-shrink-0' : 'text-gray-300 flex-shrink-0'}
                    />
                    <span className="flex-1 truncate">{client.name}</span>
                    {isActive && <ChevronRight size={13} className="text-indigo-300 flex-shrink-0" />}
                  </Link>
                )
              })}
            </nav>
          )}
        </div>

        {/* User footer */}
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-2 px-2">
            <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-indigo-600">
                {(user?.email?.[0] ?? '?').toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
