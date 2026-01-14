import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, onAuthStateChange, signIn as supabaseSignIn, signUp as supabaseSignUp, signOut as supabaseSignOut } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    const { data, error } = await supabaseSignIn(email, password)
    if (error) throw error
    return data
  }

  const signUp = async (email, password) => {
    const { data, error } = await supabaseSignUp(email, password)
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabaseSignOut()
    if (error) throw error
    setUser(null)
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
