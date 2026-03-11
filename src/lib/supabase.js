import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createSupabaseClient(supabaseUrl, supabaseKey)

// ── Auth ──────────────────────────────────────────────────────
export const signIn = (email, password) =>
  supabase.auth.signInWithPassword({ email, password })

export const signUp = (email, password) =>
  supabase.auth.signUp({ email, password })

export const signOut = () => supabase.auth.signOut()

export const onAuthStateChange = (cb) =>
  supabase.auth.onAuthStateChange(cb)

// ── Clients ───────────────────────────────────────────────────
export async function getClients(userId) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('admin_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getClient(id) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createClient(clientData) {
  const { data, error } = await supabase
    .from('clients')
    .insert([clientData])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateClient(id, updates) {
  const { data, error } = await supabase
    .from('clients')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteClient(id) {
  const { error } = await supabase.from('clients').delete().eq('id', id)
  if (error) throw error
}

// ── Superadmin ────────────────────────────────────────────────
export async function getAllUsers() {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getClientsByAdmin(adminId) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('admin_id', adminId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}
