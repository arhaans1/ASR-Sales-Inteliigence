import { useState } from 'react'
import { noteTypes } from '../lib/funnelConfigs'

export default function NoteEditor({ onSave, loading }) {
  const [content, setContent] = useState('')
  const [noteType, setNoteType] = useState('general')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return

    const success = await onSave({
      content: content.trim(),
      note_type: noteType
    })

    if (success) {
      setContent('')
      setNoteType('general')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Note Type
        </label>
        <select
          value={noteType}
          onChange={(e) => setNoteType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          {Object.entries(noteTypes).map(([key, config]) => (
            <option key={key} value={key}>
              {config.icon} {config.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Note Content
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note here..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!content.trim() || loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Saving...' : 'Save Note'}
        </button>
      </div>
    </form>
  )
}
