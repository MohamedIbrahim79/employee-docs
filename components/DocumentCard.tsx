'use client'
import { useState } from 'react'
import { differenceInDays } from 'date-fns'

interface Props {
  doc: any
  isAdmin: boolean
  onRefresh: () => void
  onUpload?: () => void
}

export default function DocumentCard({ doc, isAdmin, onRefresh, onUpload }: Props) {
  const [reviewing, setReviewing] = useState(false)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const today = new Date(); today.setHours(0,0,0,0)
  const hasFile = !!doc.file_url
  const daysLeft = doc.expiry_date ? differenceInDays(new Date(doc.expiry_date), today) : null
  const isExpired = daysLeft !== null && daysLeft < 0
  const isExpiring = daysLeft !== null && daysLeft >= 0 && daysLeft <= 30

  let statusLabel = 'Fehlend'
  let statusClass = 'badge-gray'
  let borderColor = 'border-gray-100'
  let statusBg = 'bg-gray-50'

  if (hasFile) {
    if (doc.status === 'rejected') { statusLabel = 'Abgelehnt'; statusClass = 'badge-red'; borderColor = 'border-red-200'; statusBg = 'bg-red-50' }
    else if (doc.status === 'pending') { statusLabel = 'In Bearbeitung'; statusClass = 'badge-blue'; borderColor = 'border-blue-200'; statusBg = 'bg-blue-50' }
    else if (isExpired) { statusLabel = 'Abgelaufen'; statusClass = 'badge-red'; borderColor = 'border-red-200'; statusBg = 'bg-red-50' }
    else if (isExpiring) { statusLabel = 'Läuft bald ab'; statusClass = 'badge-yellow'; borderColor = 'border-yellow-200'; statusBg = 'bg-yellow-50' }
    else { statusLabel = 'Gültig'; statusClass = 'badge-green'; borderColor = 'border-green-200'; statusBg = 'bg-green-50' }
  }

  function getToken() {
    return localStorage.getItem('auth_token') ||
      document.cookie.split('; ').find(r => r.startsWith('auth_token='))?.split('=')[1] || ''
  }

  async function review(action: 'approve' | 'reject') {
    setLoading(true)
    await fetch(`/api/documents/${doc.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify({ action, notes }),
    })
    setLoading(false)
    setReviewing(false)
    onRefresh()
  }

  return (
    <div className={`card border ${borderColor} transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden`}>
      {/* Status bar at top */}
      <div className={`${statusBg} px-5 py-3 flex items-center justify-between border-b ${borderColor}`}>
        <p className="font-semibold text-gray-900 text-sm">{doc.document_type?.name_de}</p>
        <span className={`badge ${statusClass} shrink-0`}>{statusLabel}</span>
      </div>

      <div className="p-5">
        <div className="space-y-2 mb-4">
          {doc.document_type?.has_expiry && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Ablaufdatum</span>
              <span className={`font-medium ${isExpired ? 'text-red-600' : isExpiring ? 'text-yellow-700' : 'text-gray-700'}`}>
                {doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString('de-DE') : '—'}
              </span>
            </div>
          )}
          {daysLeft !== null && hasFile && doc.status === 'active' && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Verbleibend</span>
              <span className={`font-medium ${isExpired ? 'text-red-600' : isExpiring ? 'text-yellow-700' : 'text-green-700'}`}>
                {isExpired ? `Abgelaufen seit ${Math.abs(daysLeft)} Tagen` : `${daysLeft} Tage`}
              </span>
            </div>
          )}
          {doc.file_name && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Datei</span>
              <span className="text-gray-600 truncate max-w-[150px]">{doc.file_name}</span>
            </div>
          )}
          {!doc.document_type?.is_required && (
            <span className="text-xs text-gray-400">Optional</span>
          )}
          {doc.notes && (
            <div className="bg-red-50 text-red-700 text-xs px-3 py-2 rounded-lg border border-red-100">
              {doc.notes}
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {hasFile && (
            <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
              className="btn-secondary py-1.5 px-3 text-xs hover:bg-brand-800 hover:text-white transition-all">
              Anzeigen
            </a>
          )}
          {!isAdmin && (
            <button onClick={onUpload} className={`py-1.5 px-3 text-xs transition-all ${hasFile ? 'btn-secondary hover:bg-brand-800 hover:text-white' : 'btn-primary'}`}>
              {hasFile ? 'Aktualisieren' : 'Hochladen'}
            </button>
          )}
          {isAdmin && hasFile && !reviewing && (
            <button onClick={() => setReviewing(true)} className="btn-secondary py-1.5 px-3 text-xs hover:bg-brand-800 hover:text-white transition-all">
              Überprüfen
            </button>
          )}
        </div>

        {isAdmin && reviewing && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
            <textarea
              className="input text-xs"
              rows={2}
              placeholder="Anmerkungen (optional)..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
            <div className="flex gap-2">
              <button onClick={() => review('approve')} disabled={loading} className="btn-primary py-1.5 px-3 text-xs flex-1 justify-center">
                Genehmigen
              </button>
              <button onClick={() => review('reject')} disabled={loading} className="btn-danger py-1.5 px-3 text-xs flex-1 justify-center">
                Ablehnen
              </button>
              <button onClick={() => setReviewing(false)} className="btn-secondary py-1.5 px-3 text-xs">
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}