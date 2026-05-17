'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import DocumentCard from '@/components/DocumentCard'

export default function EmployeeDetail() {
  const { id } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [employee, setEmployee] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState<'info' | 'docs'>(
    searchParams.get('tab') === 'docs' ? 'docs' : 'info'
  )
  const highlightDocId = searchParams.get('doc')

  function getToken() {
    return localStorage.getItem('auth_token') ||
      document.cookie.split('; ').find(r => r.startsWith('auth_token='))?.split('=')[1] || ''
  }

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/employees/${id}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
    const data = await res.json()
    setEmployee(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  useEffect(() => {
    if (highlightDocId && !loading) {
      setTimeout(() => {
        const el = document.getElementById(`doc-${highlightDocId}`)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 300)
    }
  }, [highlightDocId, loading])

  async function sendReminders() {
    setSending(true)
    setMsg('')
    const res = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify({ user_id: id })
    })
    const data = await res.json()
    setMsg(data.message)
    setSending(false)
  }

  async function toggleActive() {
    await fetch(`/api/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify({ ...employee, is_active: !employee.is_active })
    })
    load()
  }

  async function deleteEmployee() {
    setDeleting(true)
    await fetch(`/api/employees/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
    router.push('/admin/employees')
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Wird geladen...</div>
  if (!employee) return <div className="p-8 text-center text-gray-400">Mitarbeiter nicht gefunden</div>

  const docs = employee.documents || []

  return (
    <div className="p-6">
      <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-900 mb-6 flex items-center gap-2">
        ← Zurück
      </button>

      <div className="card p-6 mb-6">
        <div className="flex items-start gap-6 flex-wrap">
          <div className="w-16 h-16 bg-brand-800 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shrink-0">
            {employee.full_name?.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{employee.full_name}</h1>
              <span className={`badge ${employee.is_active ? 'badge-green' : 'badge-gray'}`}>
                {employee.is_active ? 'Aktiv' : 'Inaktiv'}
              </span>
            </div>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {msg && <span className="text-xs text-green-600 badge badge-green">{msg}</span>}
            <button onClick={sendReminders} disabled={sending} className="btn-secondary text-xs py-1.5 px-2.5">
              {sending ? '...' : 'Erinnerungen'}
            </button>
            <button onClick={toggleActive} className={`text-xs py-1.5 px-2.5 ${employee.is_active ? 'btn-secondary text-red-600' : 'btn-primary'}`}>
              {employee.is_active ? 'Deaktivieren' : 'Aktivieren'}
            </button>
            <button onClick={() => setShowDeleteConfirm(true)} className="btn-danger text-xs py-1.5 px-2.5">
              Löschen
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'info' ? 'bg-brand-800 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
          Persönliche Daten
        </button>
        <button
          onClick={() => setActiveTab('docs')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'docs' ? 'bg-brand-800 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
          Dokumente ({docs.length})
        </button>
      </div>

      {activeTab === 'info' && (
        <div className="card p-6">
          <h2 className="section-title mb-6">Persönliche Informationen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Vollständiger Name</p>
                <p className="text-gray-900 font-medium">{employee.full_name || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">E-Mail</p>
                <p className="text-gray-900">{employee.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Telefon</p>
                <p className="text-gray-900">{employee.phone || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Geburtsdatum</p>
                <p className="text-gray-900">
                  {employee.birth_date ? new Date(employee.birth_date).toLocaleDateString('de-DE') : '—'}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Adresse</p>
                <p className="text-gray-900">{employee.address || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Eintrittsdatum</p>
                <p className="text-gray-900">
                  {employee.start_date ? new Date(employee.start_date).toLocaleDateString('de-DE') : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'docs' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {docs.map((doc: any) => (
              <div
                key={doc.id}
                id={`doc-${doc.id}`}
                style={highlightDocId === doc.id ? {
                  transform: 'scale(1.03)',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.18)',
                  borderRadius: '12px',
                  position: 'relative',
                  zIndex: 10,
                  transition: 'all 0.3s ease',
                } : {
                  transition: 'all 0.3s ease',
                }}
              >
                <DocumentCard doc={doc} isAdmin={true} onRefresh={load} />
              </div>
            ))}
            {docs.length === 0 && <div className="col-span-2 text-center py-10 text-gray-400">Keine Dokumente</div>}
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Mitarbeiter löschen?</h2>
              <p className="text-gray-500 text-sm">
                Möchten Sie <strong>{employee.full_name}</strong> wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary flex-1 justify-center">Abbrechen</button>
              <button onClick={deleteEmployee} disabled={deleting} className="btn-danger flex-1 justify-center">
                {deleting ? '...' : 'Löschen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}