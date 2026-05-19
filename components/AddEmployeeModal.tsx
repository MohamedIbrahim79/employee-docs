'use client'
import { useState } from 'react'

interface Props {
  onClose: () => void
  onDone: () => void
}

export default function AddEmployeeModal({ onClose, onDone }: Props) {
  const [form, setForm] = useState({
    email: '',
    start_date: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<any>(null)

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  function getToken() {
    return localStorage.getItem('auth_token') ||
      document.cookie.split('; ').find(r => r.startsWith('auth_token='))?.split('=')[1] || ''
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const token = getToken()
    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        email: form.email,
        start_date: form.start_date || null,
        full_name: form.email.split('@')[0], // اسم مؤقت
        needs_profile_setup: true,
      }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    setSuccess(data)
    setLoading(false)
    onDone()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-lg">Neuen Mitarbeiter hinzufügen</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
        </div>

        {success ? (
          <div className="p-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
              <p className="font-bold text-green-800">Mitarbeiter erfolgreich hinzugefügt!</p>
              <p className="text-sm text-green-700 mt-1">Zugangsdaten wurden gesendet an {success.email}</p>
              {success.temp_password && (
                <div className="mt-4 bg-white border border-green-200 rounded-lg p-3 text-sm">
                  <p className="text-gray-500 mb-1">Temporäres Passwort:</p>
                  <code className="font-mono font-bold text-brand-800 text-base tracking-widest">{success.temp_password}</code>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-3">Der Mitarbeiter wird beim ersten Login aufgefordert, sein Passwort und seine Daten zu vervollständigen.</p>
            </div>
            <button onClick={onClose} className="btn-primary w-full justify-center mt-4">Schließen</button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-6 space-y-4" dir="ltr">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
              Der Mitarbeiter wird per E-Mail eingeladen und vervollständigt seine Daten beim ersten Login selbst.
            </div>

            <div>
              <label className="label">E-Mail <span className="text-red-500">*</span></label>
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="max@schmeuser.de"
                required
              />
            </div>

            <div>
              <label className="label">Eintrittsdatum <span className="text-red-500">*</span></label>
              <input
                className="input"
                type="date"
                value={form.start_date}
                onChange={e => set('start_date', e.target.value)}
                required
              />
            </div>

            {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Abbrechen</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
                {loading ? 'Wird hinzugefügt...' : 'Einladen'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}