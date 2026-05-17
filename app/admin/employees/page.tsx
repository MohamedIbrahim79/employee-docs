'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import AddEmployeeModal from '@/components/AddEmployeeModal'

export default function AdminEmployees() {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  function getToken() {
    return localStorage.getItem('auth_token') ||
      document.cookie.split('; ').find(r => r.startsWith('auth_token='))?.split('=')[1] || ''
  }

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/employees', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      const data = await res.json()
      if (res.ok) setEmployees(Array.isArray(data) ? data : [])
      else setError(data.error || 'Serverfehler')
    } catch {
      setError('Verbindungsfehler')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function deleteEmployee() {
    if (!deleteId) return
    setDeleting(true)
    await fetch(`/api/employees/${deleteId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
    setDeleteId(null)
    setDeleting(false)
    load()
  }

  const filtered = employees.filter(e =>
    e.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase())
  )

  const empToDelete = employees.find(e => e.id === deleteId)

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Mitarbeiter</h1>
          <p className="text-gray-500 text-sm mt-1">{employees.length} registrierte Mitarbeiter</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary text-xs py-1.5 px-3">
          + Hinzufügen
        </button>
      </div>

      <div className="card mb-5">
        <div className="p-4">
          <input
            className="input"
            placeholder="Nach Name suchen..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}

      {loading ? (
        <div className="text-center py-20 text-gray-400">Wird geladen...</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Mitarbeiter</th>
                <th className="px-4 py-3 text-left font-semibold">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(emp => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-brand-800 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {emp.full_name?.charAt(0)}
                      </div>
                      <p className="font-medium text-gray-900">{emp.full_name}</p>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      <Link href={`/admin/employees/${emp.id}`} className="btn-secondary py-1.5 px-3 text-xs">
                        Öffnen
                      </Link>
                      <button onClick={() => setDeleteId(emp.id)} className="btn-danger py-1.5 px-3 text-xs">
                        Löschen
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={2} className="text-center py-10 text-gray-400">Keine Ergebnisse</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && <AddEmployeeModal onClose={() => setShowAdd(false)} onDone={load} />}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Mitarbeiter löschen?</h2>
            <p className="text-gray-500 text-sm mb-6">
              Möchten Sie <strong>{empToDelete?.full_name}</strong> wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1 justify-center">Abbrechen</button>
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