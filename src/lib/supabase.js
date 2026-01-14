import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// Auth
export const signIn = (email, password) =>
  supabase.auth.signInWithPassword({ email, password })

export const signUp = (email, password) =>
  supabase.auth.signUp({ email, password })

export const signOut = () =>
  supabase.auth.signOut()

export const getSession = () =>
  supabase.auth.getSession()

export const onAuthStateChange = (callback) =>
  supabase.auth.onAuthStateChange(callback)

// Prospects
export const getProspects = () =>
  supabase.from('prospects').select('*').order('created_at', { ascending: false })

export const getProspect = (id) =>
  supabase.from('prospects').select('*').eq('id', id).single()

export const createProspect = (data) =>
  supabase.from('prospects').insert(data).select().single()

export const updateProspect = (id, data) =>
  supabase.from('prospects').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id).select().single()

export const deleteProspect = (id) =>
  supabase.from('prospects').delete().eq('id', id)

export const searchProspects = (query, status) => {
  let queryBuilder = supabase.from('prospects').select('*')

  if (query) {
    queryBuilder = queryBuilder.or(`name.ilike.%${query}%,business_name.ilike.%${query}%`)
  }

  if (status && status !== 'all') {
    queryBuilder = queryBuilder.eq('status', status)
  }

  return queryBuilder.order('created_at', { ascending: false })
}

// Notes
export const getNotes = (prospectId) =>
  supabase.from('prospect_notes')
    .select('*')
    .eq('prospect_id', prospectId)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

export const createNote = (data) =>
  supabase.from('prospect_notes').insert(data).select().single()

export const updateNote = (id, data) =>
  supabase.from('prospect_notes').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id).select().single()

export const deleteNote = (id) =>
  supabase.from('prospect_notes').delete().eq('id', id)

export const togglePinNote = (id, isPinned) =>
  supabase.from('prospect_notes').update({ is_pinned: !isPinned }).eq('id', id).select().single()

// User Profiles
export const getUserProfile = (userId) =>
  supabase.from('user_profiles').select('*').eq('user_id', userId).single()

export const getAllUsers = () =>
  supabase.from('user_profiles').select('*').order('created_at', { ascending: false })

// Superadmin - Get prospects for specific user
export const getProspectsByUser = (userId) =>
  supabase.from('prospects').select('*').eq('user_id', userId).order('created_at', { ascending: false })

// Superadmin - Search prospects for specific user
export const searchProspectsByUser = (userId, query, status) => {
  let queryBuilder = supabase.from('prospects').select('*').eq('user_id', userId)

  if (query) {
    queryBuilder = queryBuilder.or(`name.ilike.%${query}%,business_name.ilike.%${query}%`)
  }

  if (status && status !== 'all') {
    queryBuilder = queryBuilder.eq('status', status)
  }

  return queryBuilder.order('created_at', { ascending: false })
}

// Superadmin - Get all prospects (across all users)
export const getAllProspects = () =>
  supabase.from('prospects').select('*').order('created_at', { ascending: false })

// Superadmin - Search all prospects
export const searchAllProspects = (query, status) => {
  let queryBuilder = supabase.from('prospects').select('*')

  if (query) {
    queryBuilder = queryBuilder.or(`name.ilike.%${query}%,business_name.ilike.%${query}%`)
  }

  if (status && status !== 'all') {
    queryBuilder = queryBuilder.eq('status', status)
  }

  return queryBuilder.order('created_at', { ascending: false })
}
