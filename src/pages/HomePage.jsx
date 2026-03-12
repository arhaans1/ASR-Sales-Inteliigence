import { Link } from 'react-router-dom'
import { Plus, Calculator, Target, BarChart3 } from 'lucide-react'
import Layout from '../components/Layout'

export default function HomePage() {
  return (
    <Layout>
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50 p-8">
        <div className="text-center max-w-lg">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/asr-logo.svg"
              alt="ASR Media Pro"
              className="w-16 h-16 rounded-full shadow-lg"
            />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Business Profit Simulator
          </h1>

          {/* Description */}
          <p className="text-gray-500 text-lg mb-8 leading-relaxed">
            Model your sales funnels, calculate profitability, and find the numbers you need to hit your revenue goals.
          </p>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <Calculator size={24} className="text-indigo-500 mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-600">5 Funnel Types</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <Target size={24} className="text-green-500 mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-600">Reverse Calculate</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <BarChart3 size={24} className="text-purple-500 mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-600">Live Results</p>
            </div>
          </div>

          {/* CTA Button */}
          <Link
            to="/clients/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            <Plus size={20} />
            Create New Client
          </Link>

          <p className="text-xs text-gray-400 mt-4">
            Select a client from the sidebar or create a new one to get started.
          </p>
        </div>
      </div>
    </Layout>
  )
}
