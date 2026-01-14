import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, onAuthStateChange, signIn as supabaseSignIn, signUp as supabaseSignUp, signOut as supabaseSignOut } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId) => {
    if (!userId) {
      setProfile(null)
      return
    }

    try {
      // Try to get user profile, but don't fail if table doesn't exist
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        // Table might not exist or profile not found - that's OK
        console.log('Profile not found or table does not exist')
        setProfile(null)
      } else {
        setProfile(data)
      }
    } catch (err) {
      // Silently fail - superadmin features just won't work
      console.log('Could not fetch profile:', err.message)
      setProfile(null)
    }
  }

  useEffect(() => {
    let isMounted = true

    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!isMounted) return

        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchProfile(session.user.id)
        }
      } catch (err) {
        console.error('Auth init error:', err)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange(async (_event, session) => {
      if (!isMounted) return

      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
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
    setProfile(null)
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
    isSuperadmin: profile?.is_superadmin ?? false
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
