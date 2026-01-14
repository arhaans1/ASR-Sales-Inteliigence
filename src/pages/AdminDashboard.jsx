import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAllUsers, getProspectsByUser, searchProspectsByUser, getAllProspects, searchAllProspects, deleteProspect as deleteProspectApi } from '../lib/supabase'
import ProspectList from '../components/ProspectList'
import SearchBar from '../components/SearchBar'
import { formatDate } from '../lib/formatters'

export default function AdminDashboard() {
  const { user, signOut, isSuperadmin } = useAuth()
  const navigate = useNavigate()

  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null) // null means "all users"
  const [prospects, setProspects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUserModal, setShowUserModal] = useState(false)

  // Fetch all users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await getAllUsers()
      if (!error && data) {
        setUsers(data.filter(u => !u.is_superadmin)) // Exclude superadmin from list
      }
    }
    fetchUsers()
  }, [])

  // Fetch prospects based on selected user
  const loadProspects = useCallback(async () => {
    setLoading(true)
    try {
      let result
      if (selectedUser) {
        result = await getProspectsByUser(selectedUser.user_id)
      } else {
        result = await getAllProspects()
      }

      if (!result.error) {
        setProspects(result.data || [])
      }
    } catch (err) {
      console.error('Error loading prospects:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedUser])

  useEffect(() => {
    loadProspects()
  }, [loadProspects])

  const handleSearch = useCallback(async (query, status) => {
    setLoading(true)
    try {
      let result
      if (selectedUser) {
        result = await searchProspectsByUser(selectedUser.user_id, query, status)
      } else {
        result = await searchAllProspects(query, status)
      }

      if (!result.error) {
        setProspects(result.data || [])
      }
    } catch (err) {
      console.error('Error searching prospects:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedUser])

  const handleDelete = async (id) => {
    const { error } = await deleteProspectApi(id)
    if (!error) {
      setProspects(prev => prev.filter(p => p.id !== id))
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin/login')
  }

  const handleUserSelect = (userProfile) => {
    setSelectedUser(userProfile)
    setShowUserModal(false)
  }

  // Get stats
  const totalProspects = prospects.length
  const wonProspects = prospects.filter(p => p.status === 'won').length
  const activeProspects = prospects.filter(p => !['won', 'lost'].includes(p.status)).length

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Admin Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <span className="text-xl font-bold text-red-500">Admin Panel</span>
              <span className="text-sm text-gray-500">|</span>
              <span className="text-sm text-gray-400">Prospect Tracker</span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">{user?.email}</span>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-400 hover:text-white font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-sm text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-white">{users.length}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-sm text-gray-400">Total Prospects</p>
              <p className="text-2xl font-bold text-white">{totalProspects}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-sm text-gray-400">Active Prospects</p>
              <p className="text-2xl font-bold text-yellow-500">{activeProspects}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-sm text-gray-400">Won Deals</p>
              <p className="text-2xl font-bold text-green-500">{wonProspects}</p>
            </div>
          </div>

          {/* User Selector */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-white">Viewing Data For:</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {selectedUser ? (
                    <>
                      <span className="text-indigo-400 font-medium">{selectedUser.email}</span>
                      <span className="text-gray-500 ml-2">
                        (Joined {formatDate(selectedUser.created_at)})
                      </span>
                    </>
                  ) : (
                    <span className="text-green-400 font-medium">All Users</span>
                  )}
                </p>
              </div>
              <button
                onClick={() => setShowUserModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                Select User
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Prospects Table */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">
                Prospects {selectedUser && `- ${selectedUser.email}`}
              </h3>
              {selectedUser && (
                <Link
                  to={`/prospect/new?user_id=${selectedUser.user_id}`}
                  className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                >
                  + Add Prospect for User
                </Link>
              )}
            </div>
            <div className="[&_table]:text-gray-300 [&_th]:text-gray-400 [&_td]:text-gray-300 [&_tr:hover]:bg-gray-700/50">
              <ProspectList
                prospects={prospects}
                loading={loading}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>
      </main>

      {/* User Selection Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg w-full max-w-lg mx-4 border border-gray-700">
            <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Select User</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto">
              {/* All Users Option */}
              <button
                onClick={() => handleUserSelect(null)}
                className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-colors ${
                  !selectedUser
                    ? 'bg-green-600/20 border border-green-500 text-green-400'
                    : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300'
                }`}
              >
                <div className="font-medium">All Users</div>
                <div className="text-sm text-gray-500">View prospects from all users</div>
              </button>

              {/* Individual Users */}
              {users.map((userProfile) => (
                <button
                  key={userProfile.id}
                  onClick={() => handleUserSelect(userProfile)}
                  className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-colors ${
                    selectedUser?.user_id === userProfile.user_id
                      ? 'bg-indigo-600/20 border border-indigo-500 text-indigo-400'
                      : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  <div className="font-medium">{userProfile.email}</div>
                  <div className="text-sm text-gray-500">
                    Joined {formatDate(userProfile.created_at)}
                  </div>
                </button>
              ))}

              {users.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No users found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
