import { useState, useCallback } from 'react'
import {
  getNotes as fetchNotes,
  createNote as createNoteApi,
  updateNote as updateNoteApi,
  deleteNote as deleteNoteApi,
  togglePinNote as togglePinNoteApi
} from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useNotes(prospectId) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  const loadNotes = useCallback(async () => {
    if (!user || !prospectId) return

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await fetchNotes(prospectId)
      if (fetchError) throw fetchError
      setNotes(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error loading notes:', err)
    } finally {
      setLoading(false)
    }
  }, [user, prospectId])

  const createNote = useCallback(async (noteData) => {
    if (!user || !prospectId) return null

    setLoading(true)
    setError(null)

    try {
      const { data, error: createError } = await createNoteApi({
        ...noteData,
        prospect_id: prospectId,
        user_id: user.id
      })
      if (createError) throw createError

      // Insert at beginning if not pinned, otherwise sort properly
      setNotes(prev => {
        if (data.is_pinned) {
          return [data, ...prev]
        }
        const pinnedNotes = prev.filter(n => n.is_pinned)
        const unpinnedNotes = prev.filter(n => !n.is_pinned)
        return [...pinnedNotes, data, ...unpinnedNotes]
      })
      return data
    } catch (err) {
      setError(err.message)
      console.error('Error creating note:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [user, prospectId])

  const updateNote = useCallback(async (id, noteData) => {
    if (!user) return null

    setLoading(true)
    setError(null)

    try {
      const { data, error: updateError } = await updateNoteApi(id, noteData)
      if (updateError) throw updateError

      setNotes(prev =>
        prev.map(n => n.id === id ? data : n)
      )
      return data
    } catch (err) {
      setError(err.message)
      console.error('Error updating note:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [user])

  const deleteNote = useCallback(async (id) => {
    if (!user) return false

    setLoading(true)
    setError(null)

    try {
      const { error: deleteError } = await deleteNoteApi(id)
      if (deleteError) throw deleteError

      setNotes(prev => prev.filter(n => n.id !== id))
      return true
    } catch (err) {
      setError(err.message)
      console.error('Error deleting note:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [user])

  const togglePin = useCallback(async (id, isPinned) => {
    if (!user) return null

    try {
      const { data, error: toggleError } = await togglePinNoteApi(id, isPinned)
      if (toggleError) throw toggleError

      // Re-sort notes after pin toggle
      setNotes(prev => {
        const updated = prev.map(n => n.id === id ? data : n)
        return updated.sort((a, b) => {
          if (a.is_pinned && !b.is_pinned) return -1
          if (!a.is_pinned && b.is_pinned) return 1
          return new Date(b.created_at) - new Date(a.created_at)
        })
      })
      return data
    } catch (err) {
      setError(err.message)
      console.error('Error toggling pin:', err)
      return null
    }
  }, [user])

  // Filter notes by type
  const filterNotes = useCallback((type) => {
    if (!type || type === 'all') return notes
    return notes.filter(n => n.note_type === type)
  }, [notes])

  return {
    notes,
    loading,
    error,
    loadNotes,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    filterNotes
  }
}
