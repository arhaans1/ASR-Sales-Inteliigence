import { useState, useCallback } from 'react'
import {
  getProspects as fetchProspects,
  getProspect as fetchProspect,
  createProspect as createProspectApi,
  updateProspect as updateProspectApi,
  deleteProspect as deleteProspectApi,
  searchProspects as searchProspectsApi
} from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useProspects() {
  const [prospects, setProspects] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  const loadProspects = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await fetchProspects()
      if (fetchError) throw fetchError
      setProspects(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error loading prospects:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  const searchProspects = useCallback(async (query, status) => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const { data, error: searchError } = await searchProspectsApi(query, status)
      if (searchError) throw searchError
      setProspects(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error searching prospects:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  const getProspect = useCallback(async (id) => {
    if (!user) return null

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await fetchProspect(id)
      if (fetchError) throw fetchError
      return data
    } catch (err) {
      setError(err.message)
      console.error('Error fetching prospect:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [user])

  const createProspect = useCallback(async (prospectData) => {
    if (!user) return null

    setLoading(true)
    setError(null)

    try {
      const { data, error: createError } = await createProspectApi({
        ...prospectData,
        user_id: user.id
      })
      if (createError) throw createError

      setProspects(prev => [data, ...prev])
      return data
    } catch (err) {
      setError(err.message)
      console.error('Error creating prospect:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [user])

  const updateProspect = useCallback(async (id, prospectData) => {
    if (!user) return null

    setLoading(true)
    setError(null)

    try {
      const { data, error: updateError } = await updateProspectApi(id, prospectData)
      if (updateError) throw updateError

      setProspects(prev =>
        prev.map(p => p.id === id ? data : p)
      )
      return data
    } catch (err) {
      setError(err.message)
      console.error('Error updating prospect:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [user])

  const deleteProspect = useCallback(async (id) => {
    if (!user) return false

    setLoading(true)
    setError(null)

    try {
      const { error: deleteError } = await deleteProspectApi(id)
      if (deleteError) throw deleteError

      setProspects(prev => prev.filter(p => p.id !== id))
      return true
    } catch (err) {
      setError(err.message)
      console.error('Error deleting prospect:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [user])

  return {
    prospects,
    loading,
    error,
    loadProspects,
    searchProspects,
    getProspect,
    createProspect,
    updateProspect,
    deleteProspect
  }
}
