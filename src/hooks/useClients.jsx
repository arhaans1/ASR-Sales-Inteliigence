import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getClients,
  getClient as apiGetClient,
  createClient as apiCreateClient,
  updateClient as apiUpdateClient,
  deleteClient as apiDeleteClient,
} from '../lib/supabase'

// Hook for the full list of clients belonging to the current user
export function useClients() {
  const { user } = useAuth()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchClients = useCallback(async () => {
    if (!user) return
    try {
      setLoading(true)
      setError(null)
      const data = await getClients(user.id)
      setClients(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const createClient = async (data) => {
    const client = await apiCreateClient({ ...data, admin_id: user.id })
    setClients((prev) => [client, ...prev])
    return client
  }

  const updateClient = async (id, data) => {
    const updated = await apiUpdateClient(id, data)
    setClients((prev) => prev.map((c) => (c.id === id ? updated : c)))
    return updated
  }

  const deleteClient = async (id) => {
    await apiDeleteClient(id)
    setClients((prev) => prev.filter((c) => c.id !== id))
  }

  return { clients, loading, error, createClient, updateClient, deleteClient, refetch: fetchClients }
}

// Hook for a single client by id
export function useClient(id) {
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    const fetch = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiGetClient(id)
        if (!cancelled) setClient(data)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetch()
    return () => { cancelled = true }
  }, [id])

  return { client, setClient, loading, error }
}
