'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DocumentCard from '@/components/DocumentCard'

export default function EmployeeDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [employee, setEmployee] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/employees/${id}`)
    const data = await res.json()
    setEmployee(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  async function sendReminders() {
    setSending(true)
    setMsg('')
    const res = await fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: id }) })
    const data = await res.json()
    setMsg(data.message)
    setSending(false)
  }

  async function toggleActive() {
    await fetch(`/api/employees/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...employee, is_active: !employee.is_active }) })
    load()
  }

  async function deleteEmployee() {
    setDeleting(true)
    await fetch(`/api/employees/${id}`, { method: 'DELETE' })
    router.push('/admin/employees')
  }

  if (loading) return <div className="p-8 text-center text-gray-400">جارٍ التحميل...</div>
  if (!employee) return <div className="p-8 text-center text-gray-400">الموظف غير موجود</div>

  const docs = employee.documents || []

  return (
    <div className="p-8">
      <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-900 mb-6 flex items-center gap-2">
        ← رجوع
      </button>

      <div className="card p-6 mb-6 flex items-center gap-6">
        <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-800 font-bold text-2xl shrink-0">
          {employee.full_name?.charAt(0)}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{employee.full_name}</h1>
          <div className="flex flex-wrap gap-3 mt-1.5 text-sm text-gray-500">
            <span>📧 {employee.email}</span>
            {employee.phone && <span>📞 {employee.phone}</span>}
            {employee.position && <span>💼 {employee.position}</span>}
            {employee.department && <span>🏛 {employee.department}</span>}
            {employee.start_date && <span>📅 {new Date(employee.start_date).toLocaleDateString('de-DE')}</span>}
          </div>
        </div>
        <div className="flex gap-3 items-center flex-wrap justify-end">
          {msg && <span className="text-sm text-green-600 badge badge-green">{msg}</span>}
          <button onClick={sendReminders} disabled={sending} className="btn-secondary">
            {sending ? '...' : '📨 Erinnerungen senden'}
          </button>
          <button onClick={toggleActive} className={employee.is_active ? 'btn-secondary text-red-600' : 'btn-primary'}>
            {employee.is_active ? '⏸ Deaktivieren' : '▶️ Aktivieren'}
          </button>
          <button onClick={() => setShowDeleteConfirm(true)} className="btn-danger">
            🗑 Löschen
          </button>
        </div>
      </div>

      <div>
        <h2 className="section-title mb-4">📄 Dokumente ({docs.length})</h2>
        <div className="grid grid-cols-2 gap-4">
          {docs.map((doc: any) => (
            <DocumentCard key={doc.id} doc={doc} isAdmin={true} onRefresh={load} />
          ))}
          {docs.length === 0 && <div className="col-span-2 text-center py-10 text-gray-400">Keine Dokumente</div>}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">⚠️</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Mitarbeiter löschen?</h2>
              <p className="text-gray-500 text-sm">
                Möchten Sie <strong>{employee.full_name}</strong> wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary flex-1 justify-center">
                Abbrechen
              </button>
              <button onClick={deleteEmployee} disabled={deleting} className="btn-danger flex-1 justify-center">
                {deleting ? '...' : '🗑 Endgültig löschen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}