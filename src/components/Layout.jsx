import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { BarChart2, Plus, LogOut, ChevronRight, PanelLeftClose, PanelLeft, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function Layout({ children }) {
  const { user, signOut, isSuperadmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  // Superadmin: admin selection
  const [admins, setAdmins] = useState([])
  const [selectedAdminId, setSelectedAdminId] = useState(null)
  const [showAdminDropdown, setShowAdminDropdown] = useState(false)

  // Fetch admins list (superadmin only)
  useEffect(() => {
    if (!isSuperadmin) return

    const fetchAdmins = async () => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .order('email')
        if (error) throw error
        setAdmins(data || [])
        // Default to current user
        if (user?.id) {
          setSelectedAdminId(user.id)
        } else if (data?.length > 0) {
          setSelectedAdminId(data[0].user_id)
        }
      } catch (err) {
        console.error('Error fetching admins:', err)
      }
    }

    fetchAdmins()
  }, [isSuperadmin, user?.id])

  // Fetch clients based on selected admin (superadmin) or current user
  useEffect(() => {
    const fetchClients = async () => {
      if (!user) return

      try {
        setLoading(true)
        const adminId = isSuperadmin && selectedAdminId ? selectedAdminId : user.id

        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('admin_id', adminId)
          .order('created_at', { ascending: false })

        if (error) throw error
        setClients(data || [])
      } catch (err) {
        console.error('Error fetching clients:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [user, isSuperadmin, selectedAdminId])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const selectedAdmin = admins.find(a => a.user_id === selectedAdminId)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* ── Sidebar ── */}
      <aside
        className={`bg-white border-r border-gray-200 flex flex-col flex-shrink-0 transition-all duration-200 ${
          sidebarOpen ? 'w-60' : 'w-14'
        }`}
      >
        {/* Logo - Clickable */}
        <div className="flex items-center border-b border-gray-100">
          <Link to="/" className="flex-1 p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-2.5">
              <img
                src="/asr-logo.svg"
                alt="ASR"
                className="w-8 h-8 rounded-full flex-shrink-0"
              />
              {sidebarOpen && (
                <div className="leading-tight">
                  <p className="text-xs font-bold text-gray-900">Profit Simulator</p>
                  <p className="text-[11px] text-gray-400">ASR Media Pro</p>
                </div>
              )}
            </div>
          </Link>
          {/* Toggle inside header */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? (
              <PanelLeftClose size={16} />
            ) : (
              <PanelLeft size={16} />
            )}
          </button>
        </div>

        {/* Superadmin: Admin Selector */}
        {sidebarOpen && isSuperadmin && admins.length > 0 && (
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 px-1">
              Viewing as
            </p>
            <div className="relative">
              <button
                onClick={() => setShowAdminDropdown(!showAdminDropdown)}
                className="w-full flex items-center justify-between px-3 py-2 bg-indigo-50 rounded-lg text-sm text-indigo-700 font-medium hover:bg-indigo-100 transition-colors"
              >
                <span className="truncate">{selectedAdmin?.email || 'Select Admin'}</span>
                <ChevronDown size={14} className={`flex-shrink-0 transition-transform ${showAdminDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showAdminDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                  {admins.map((admin) => (
                    <button
                      key={admin.user_id}
                      onClick={() => {
                        setSelectedAdminId(admin.user_id)
                        setShowAdminDropdown(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        admin.user_id === selectedAdminId ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                      }`}
                    >
                      {admin.email}
                      {admin.is_superadmin && (
                        <span className="ml-1 text-xs text-indigo-400">(Super)</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Client list */}
        <div className="flex-1 overflow-y-auto p-3">
          {sidebarOpen && (
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
          )}

          {!sidebarOpen && (
            <div className="flex justify-center mb-2">
              <Link
                to="/clients/new"
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="New client"
              >
                <Plus size={16} />
              </Link>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500" />
            </div>
          ) : clients.length === 0 ? (
            sidebarOpen ? (
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
            ) : null
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
                    title={!sidebarOpen ? client.name : undefined}
                  >
                    <BarChart2
                      size={14}
                      className={isActive ? 'text-indigo-500 flex-shrink-0' : 'text-gray-300 flex-shrink-0'}
                    />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 truncate">{client.name}</span>
                        {isActive && <ChevronRight size={13} className="text-indigo-300 flex-shrink-0" />}
                      </>
                    )}
                  </Link>
                )
              })}
            </nav>
          )}
        </div>

        {/* User footer */}
        <div className="p-3 border-t border-gray-100">
          <div className={`flex items-center gap-2 ${sidebarOpen ? 'px-2' : 'justify-center'}`}>
            <Link
              to="/account"
              className={`flex items-center gap-2 ${sidebarOpen ? 'flex-1 min-w-0' : ''} hover:bg-gray-50 rounded-lg p-1 -m-1 transition-colors`}
              title={!sidebarOpen ? user?.email : undefined}
            >
              <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-indigo-600">
                  {(user?.email?.[0] ?? '?').toUpperCase()}
                </span>
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{user?.email}</p>
                </div>
              )}
            </Link>
            {sidebarOpen && (
              <button
                onClick={handleSignOut}
                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
