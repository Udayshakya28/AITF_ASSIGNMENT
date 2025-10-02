import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function Profile() {
  const { user } = useAuth()
  const [searchHistory, setSearchHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSearches: 0,
    favoritePersona: '',
    favoriteLanguage: '',
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setSearchHistory(data || [])

      const personaCounts = {}
      const langCounts = {}

      data?.forEach((item) => {
        personaCounts[item.persona] = (personaCounts[item.persona] || 0) + 1
        langCounts[item.language] = (langCounts[item.language] || 0) + 1
      })

      const favoritePersona = Object.keys(personaCounts).reduce(
        (a, b) => (personaCounts[a] > personaCounts[b] ? a : b),
        'outings'
      )
      const favoriteLanguage = Object.keys(langCounts).reduce(
        (a, b) => (langCounts[a] > langCounts[b] ? a : b),
        'en'
      )

      setStats({
        totalSearches: data?.length || 0,
        favoritePersona,
        favoriteLanguage,
      })
    } catch (err) {
      console.error('Error loading profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const deleteHistoryItem = async (id) => {
    try {
      const { error } = await supabase
        .from('search_history')
        .delete()
        .eq('id', id)

      if (error) throw error
      await loadProfile()
    } catch (err) {
      console.error('Error deleting history item:', err)
    }
  }

  const clearAllHistory = async () => {
    if (!confirm('Are you sure you want to clear all history?')) return

    try {
      const { error } = await supabase
        .from('search_history')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error
      await loadProfile()
    } catch (err) {
      console.error('Error clearing history:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Your Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalSearches}</div>
              <div className="text-gray-600">Total Searches</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2 capitalize">{stats.favoritePersona}</div>
              <div className="text-gray-600">Favorite Persona</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-600 mb-2 uppercase">{stats.favoriteLanguage}</div>
              <div className="text-gray-600">Preferred Language</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Account Information</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <div className="text-gray-900 font-medium">{user?.email}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">User ID</label>
              <div className="text-gray-900 font-mono text-sm">{user?.id}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Search History</h2>
            {searchHistory.length > 0 && (
              <button
                onClick={clearAllHistory}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition"
              >
                Clear All
              </button>
            )}
          </div>

          {searchHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No search history yet</p>
          ) : (
            <div className="space-y-4">
              {searchHistory.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.place}</h3>
                      <p className="text-sm text-gray-600 mt-1">{item.query}</p>
                    </div>
                    <button
                      onClick={() => deleteHistoryItem(item.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium ml-4"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500 mt-3">
                    <span className="bg-gray-100 px-2 py-1 rounded capitalize">{item.persona}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded uppercase">{item.language}</span>
                    <span>{new Date(item.created_at).toLocaleString()}</span>
                  </div>
                  {item.weather_summary && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-700">{item.weather_summary}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
