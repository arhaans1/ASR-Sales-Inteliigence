import { useState } from 'react'
import { noteTypes } from '../lib/funnelConfigs'
import { formatRelativeTime, formatDateTime } from '../lib/formatters'

export default function NotesList({ notes, onDelete, onTogglePin }) {
  const [filter, setFilter] = useState('all')

  const filteredNotes = filter === 'all'
    ? notes
    : notes.filter(note => note.note_type === filter)

  const pinnedNotes = filteredNotes.filter(note => note.is_pinned)
  const unpinnedNotes = filteredNotes.filter(note => !note.is_pinned)

  const renderNote = (note) => {
    const typeConfig = noteTypes[note.note_type] || noteTypes.general

    return (
      <div
        key={note.id}
        className={`p-4 rounded-lg border ${
          note.is_pinned ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${typeConfig.bgClass}`}>
              <span className="mr-1">{typeConfig.icon}</span>
              {typeConfig.label}
            </span>
            {note.is_pinned && (
              <span className="text-yellow-600 text-sm">📌 Pinned</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onTogglePin(note.id, note.is_pinned)}
              className="text-gray-400 hover:text-yellow-600 text-sm"
              title={note.is_pinned ? 'Unpin' : 'Pin'}
            >
              {note.is_pinned ? 'Unpin' : 'Pin'}
            </button>
            <button
              onClick={() => {
                if (window.confirm('Delete this note?')) {
                  onDelete(note.id)
                }
              }}
              className="text-gray-400 hover:text-red-600 text-sm"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="mt-3 text-gray-700 whitespace-pre-wrap">
          {note.content}
        </div>

        <div className="mt-3 text-xs text-gray-500" title={formatDateTime(note.created_at)}>
          {formatRelativeTime(note.created_at)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500">Filter:</span>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Types</option>
          {Object.entries(noteTypes).map(([key, config]) => (
            <option key={key} value={key}>
              {config.icon} {config.label}
            </option>
          ))}
        </select>
      </div>

      {/* Pinned Notes */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Pinned
          </h4>
          {pinnedNotes.map(renderNote)}
        </div>
      )}

      {/* Regular Notes */}
      {unpinnedNotes.length > 0 && (
        <div className="space-y-3">
          {pinnedNotes.length > 0 && (
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mt-6">
              All Notes
            </h4>
          )}
          {unpinnedNotes.map(renderNote)}
        </div>
      )}

      {/* Empty State */}
      {filteredNotes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {filter === 'all'
            ? 'No notes yet. Add your first note above.'
            : `No ${noteTypes[filter]?.label.toLowerCase() || filter} notes found.`
          }
        </div>
      )}
    </div>
  )
}
