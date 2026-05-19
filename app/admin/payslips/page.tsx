'use client'
import { useState, useEffect } from 'react'

const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
]

export default function AdminPayslips() {
  const [employees, setEmployees] = useState<any[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [payslips, setPayslips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  function getToken() {
    return localStorage.getItem('auth_token') || ''
  }

  async function loadEmployees() {
    const res = await fetch('/api/employees', {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
    const data = await res.json()
    setEmployees(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function loadPayslips(userId: string) {
    const res = await fetch(`/api/payslips?user_id=${userId}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
    const data = await res.json()
    setPayslips(Array.isArray(data) ? data : [])
  }

  useEffect(() => { loadEmployees() }, [])

  async function handleUpload() {
    if (!file || !selectedEmployee) { setError('Bitte Datei und Mitarbeiter auswählen'); return }
    setUploading(true); setMsg(''); setError('')

    const fd = new FormData()
    fd.append('file', file)
    fd.append('user_id', selectedEmployee.id)
    fd.append('month', month.toString())
    fd.append('year', year.toString())

    const res = await fetch('/api/payslips', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` },
      body: fd
    })
    const data = await res.json()

    if (!res.ok) { setError(data.error || 'Fehler'); setUploading(false); return }
    setMsg('Lohnabrechnung erfolgreich hochgeladen')
    setFile(null)
    loadPayslips(selectedEmployee.id)
    setUploading(false)
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl">
      <h1 className="page-title mb-6">Lohnabrechnungen</h1>

      <div className="card overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100 bg-brand-900/5">
          <h2 className="font-semibold text-brand-900">Lohnabrechnung hochladen</h2>
        </div>
        <div className="p-6 space-y-4">
          {/* Employee Select */}
          <div>
            <label className="label">Mitarbeiter</label>
            <select
              className="input"
              value={selectedEmployee?.id || ''}
              onChange={e => {
                const emp = employees.find(em => em.id === e.target.value)
                setSelectedEmployee(emp || null)
                if (emp) loadPayslips(emp.id)
                setMsg(''); setError('')
              }}>
              <option value="">Mitarbeiter auswählen...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.full_name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Monat</label>
              <select className="input" value={month} onChange={e => setMonth(parseInt(e.target.value))}>
                {MONTHS.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Jahr</label>
              <select className="input" value={year} onChange={e => setYear(parseInt(e.target.value))}>
                {[2024, 2025, 2026, 2027].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">PDF-Datei</label>
            <input
              type="file"
              accept=".pdf"
              className="input"
              onChange={e => setFile(e.target.files?.[0] || null)}
            />
          </div>

          {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg">{error}</p>}
          {msg && <p className="text-green-700 text-sm bg-green-50 px-4 py-3 rounded-lg">{msg}</p>}

          <button
            onClick={handleUpload}
            disabled={uploading || !file || !selectedEmployee}
            className="btn-primary">
            {uploading ? 'Wird hochgeladen...' : 'Hochladen'}
          </button>
        </div>
      </div>

      {/* Payslips list */}
      {selectedEmployee && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-brand-900/5">
            <h2 className="font-semibold text-brand-900">
              Lohnabrechnungen — {selectedEmployee.full_name}
            </h2>
          </div>
          {payslips.length === 0 ? (
            <div className="p-8 text-center text-gray-400">Keine Lohnabrechnungen vorhanden</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {payslips.map(p => (
                <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-900/10 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-brand-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{MONTHS[p.month - 1]} {p.year}</p>
                      <p className="text-xs text-gray-400">{new Date(p.uploaded_at).toLocaleDateString('de-DE')}</p>
                    </div>
                  </div>
                  <a href={p.file_url} target="_blank" rel="noopener noreferrer"
                    className="btn-secondary py-1.5 px-3 text-xs">
                    Anzeigen
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}