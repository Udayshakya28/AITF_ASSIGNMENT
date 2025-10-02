import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user, profile } = useAuth()
  const [searchHistory, setSearchHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/search-history', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setSearchHistory(data)
      }
    } catch (err) {
      console.error('Error loading profile:', err)
    } finally {
      setLoading(false)
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
              <div className="text-3xl font-bold text-blue-600 mb-2">{profile?.total_searches || 0}</div>
              <div className="text-gray-600">Total Searches</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2 capitalize">
                {profile?.favorite_persona || 'None'}
              </div>
              <div className="text-gray-600">Favorite Persona</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-600 mb-2 uppercase">
                {profile?.preferred_language || 'EN'}
              </div>
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
              <div className="text-gray-900 font-medium">{user?.email || 'N/A'}</div>
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
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500 mt-3">
                    <span className="bg-gray-100 px-2 py-1 rounded capitalize">{item.persona}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded uppercase">{item.language}</span>
                    <span>{new Date(item.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
