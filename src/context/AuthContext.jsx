import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setProfile(data.profile)
      } else {
        setUser(null)
        setProfile(null)
      }
    } catch (error) {
      setUser(null)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (username, email, password, passwordConfirm) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        username,
        email,
        password,
        password_confirm: passwordConfirm,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || JSON.stringify(data))
    }

    await checkAuth()
    return { data, error: null }
  }

  const signIn = async (username, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        username,
        password,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Login failed')
    }

    setUser(data.user)
    setProfile(data.profile)
    return { data, error: null }
  }

  const signOut = async () => {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })

    if (response.ok) {
      setUser(null)
      setProfile(null)
    }

    return { error: null }
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
