import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, BarChart2, LogOut, ChevronDown, ChevronRight, ExternalLink, TrendingUp } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getAllUsers, getClientsByAdmin } from '../lib/supabase'
import { formatDate } from '../lib/formatters'

export default function AdminDashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userClients, setUserClients] = useState([])
  const [clientsLoading, setClientsLoading] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers()
        setUsers(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const toggleUser = async (u) => {
    if (selectedUser?.user_id === u.user_id) {
      setSelectedUser(null)
      setUserClients([])
      return
    }
    setSelectedUser(u)
    setClientsLoading(true)
    try {
      const clients = await getClientsByAdmin(u.user_id)
      setUserClients(clients)
    } catch (err) {
      console.error(err)
    } finally {
      setClientsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin/login')
  }

  const adminUsers = users.filter((u) => !u.is_superadmin)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <TrendingUp size={15} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Super Admin</p>
              <p className="text-xs text-gray-400">Profit Simulator Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={13} />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users size={20} className="text-indigo-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{adminUsers.length}</p>
              <p className="text-sm text-gray-400">Admin Users</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <BarChart2 size={20} className="text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">—</p>
              <p className="text-sm text-gray-400">Total Clients</p>
            </div>
          </div>
        </div>

        {/* Users list */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Admin Users</h2>
            <p className="text-xs text-gray-400 mt-0.5">Click a user to view their clients</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">No users found</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {users.map((u) => {
                const isExpanded = selectedUser?.user_id === u.user_id
                const initial = (u.email?.[0] ?? '?').toUpperCase()
                return (
                  <div key={u.user_id || u.id}>
                    {/* User row */}
                    <div
                      className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => toggleUser(u)}
                    >
                      <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-gray-500">{initial}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{u.email}</p>
                        <p className="text-xs text-gray-400">
                          {u.is_superadmin ? 'Super Admin · ' : 'Admin · '}
                          Joined {formatDate(u.created_at)}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                      )}
                    </div>

                    {/* Expanded client list */}
                    {isExpanded && (
                      <div className="bg-gray-50 border-t border-gray-100 px-6 py-4">
                        {clientsLoading ? (
                          <div className="flex justify-center py-6">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500" />
                          </div>
                        ) : userClients.length === 0 ? (
                          <p className="text-sm text-gray-400 text-center py-4">
                            No clients for this user
                          </p>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                              {userClients.length} Client{userClients.length !== 1 ? 's' : ''}
                            </p>
                            {userClients.map((client) => (
                              <div
                                key={client.id}
                                className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold text-gray-900">{client.name}</p>
                                  {client.description && (
                                    <p className="text-xs text-gray-400 mt-0.5 truncate">{client.description}</p>
                                  )}
                                </div>
                                <a
                                  href={`/clients/${client.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium ml-3 flex-shrink-0"
                                >
                                  Open <ExternalLink size={11} />
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
