import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { hashPassword, verifyPassword, saveSession, getSession, clearSession } from '../lib/auth'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load session on mount
  useEffect(() => {
    const session = getSession()
    if (session) {
      setUser(session)
    }
    setLoading(false)
  }, [])

  // Sign in with email and password against user_profiles table
  const signIn = async (email, password) => {
    // Look up user in user_profiles
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single()

    console.log('Login attempt for:', email.toLowerCase().trim())
    console.log('Query result - profile:', profile)
    console.log('Query result - error:', error)

    if (error || !profile) {
      throw new Error('Invalid login credentials - user not found')
    }

    // Check password
    if (!profile.password_hash) {
      throw new Error('Account not set up. Please contact admin.')
    }

    const computedHash = await hashPassword(password)
    console.log('Stored hash:', profile.password_hash)
    console.log('Computed hash:', computedHash)
    console.log('Hash length - stored:', profile.password_hash.length, 'computed:', computedHash.length)

    const isValid = await verifyPassword(password, profile.password_hash)
    if (!isValid) {
      throw new Error('Invalid login credentials - password mismatch')
    }

    // Create session
    const sessionUser = {
      id: profile.user_id,
      email: profile.email,
      is_superadmin: profile.is_superadmin || false
    }

    saveSession(sessionUser)
    setUser(sessionUser)

    return sessionUser
  }

  // Sign out
  const signOut = async () => {
    clearSession()
    setUser(null)
  }

  // Create a new user (superadmin only)
  const createUser = async (email, password) => {
    const passwordHash = await hashPassword(password)
    const userId = crypto.randomUUID()

    const { error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        is_superadmin: false
      })

    if (error) {
      if (error.code === '23505') {
        throw new Error('A user with this email already exists')
      }
      throw error
    }

    return { user_id: userId, email }
  }

  // Update user password (for password reset)
  const updatePassword = async (userId, newPassword) => {
    const passwordHash = await hashPassword(newPassword)

    const { error } = await supabase
      .from('user_profiles')
      .update({ password_hash: passwordHash })
      .eq('user_id', userId)

    if (error) throw error
  }

  const value = {
    user,
    loading,
    signIn,
    signOut,
    createUser,
    updatePassword,
    isAuthenticated: !!user,
    isSuperadmin: user?.is_superadmin ?? false
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
