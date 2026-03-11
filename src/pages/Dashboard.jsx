import { Link } from 'react-router-dom'
import { TrendingUp, Plus, BarChart2 } from 'lucide-react'
import Layout from '../components/Layout'
import { useClients } from '../hooks/useClients'

export default function Dashboard() {
  const { clients, loading } = useClients()

  return (
    <Layout>
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center max-w-lg">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <TrendingUp size={32} className="text-indigo-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Business Profitability Simulator
          </h1>

          {loading ? (
            <p className="text-gray-400 text-sm">Loading clients…</p>
          ) : clients.length === 0 ? (
            <>
              <p className="text-gray-500 mb-6">
                Create your first client to start simulating profitability scenarios. Adjust inputs with live sliders and see results instantly.
              </p>
              <Link
                to="/clients/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                <Plus size={18} />
                Create First Client
              </Link>
            </>
          ) : (
            <>
              <p className="text-gray-500 mb-6">
                Select a client from the sidebar, or create a new one.
              </p>
              <div className="grid grid-cols-2 gap-3 text-left">
                {clients.slice(0, 6).map((client) => (
                  <Link
                    key={client.id}
                    to={`/clients/${client.id}`}
                    className="p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all group"
                  >
                    <BarChart2 size={18} className="text-indigo-400 mb-2 group-hover:text-indigo-600 transition-colors" />
                    <p className="text-sm font-semibold text-gray-900 truncate">{client.name}</p>
                    {client.description && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{client.description}</p>
                    )}
                  </Link>
                ))}
              </div>
              {clients.length > 6 && (
                <p className="text-xs text-gray-400 mt-3">{clients.length - 6} more in sidebar</p>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
