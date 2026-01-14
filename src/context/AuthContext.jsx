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
      // Try to get user profile with a timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 5000)
      )

      const queryPromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      const { data, error } = await Promise.race([queryPromise, timeoutPromise])

      if (error) {
        console.log('Profile fetch error (non-critical):', error.message)
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

    // Force loading to false after 5 seconds no matter what
    const forceLoadingTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.log('Force ending loading state')
        setLoading(false)
      }
    }, 5000)

    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (!isMounted) return

        if (error) {
          console.error('Session error:', error)
          setUser(null)
          setLoading(false)
          return
        }

        setUser(session?.user ?? null)

        if (session?.user) {
          // Don't wait for profile - just fire and forget
          fetchProfile(session.user.id)
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
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => {
      isMounted = false
      clearTimeout(forceLoadingTimeout)
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
