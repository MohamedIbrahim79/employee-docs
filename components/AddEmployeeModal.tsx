'use client'
import { useState } from 'react'

interface Props {
  onClose: () => void
  onDone: () => void
}

export default function AddEmployeeModal({ onClose, onDone }: Props) {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    street: '', house_number: '', postal_code: '', city: '',
    birth_date: '', start_date: ''
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
    const full_name = `${form.first_name} ${form.last_name}`.trim()
    const address = `${form.street} ${form.house_number}, ${form.postal_code} ${form.city}`.trim()
    const token = getToken()
    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        full_name,
        email: form.email,
        phone: form.phone,
        address,
        birth_date: form.birth_date || null,
        start_date: form.start_date || null,
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-lg">➕ Neuen Mitarbeiter hinzufügen</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
        </div>

        {success ? (
          <div className="p-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
              <div className="text-4xl mb-3">✅</div>
              <p className="font-bold text-green-800">Mitarbeiter erfolgreich hinzugefügt!</p>
              <p className="text-sm text-green-700 mt-1">Zugangsdaten wurden gesendet an {success.email}</p>
              {success.temp_password && (
                <div className="mt-4 bg-white border border-green-200 rounded-lg p-3 text-sm">
                  <p className="text-gray-500 mb-1">Temporäres Passwort:</p>
                  <code className="font-mono font-bold text-brand-800 text-base tracking-widest">{success.temp_password}</code>
                </div>
              )}
            </div>
            <button onClick={onClose} className="btn-primary w-full justify-center mt-4">Schließen</button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-6 space-y-4" dir="ltr">

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Vorname <span className="text-red-500">*</span></label>
                <input className="input" value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="Max" required />
              </div>
              <div>
                <label className="label">Nachname <span className="text-red-500">*</span></label>
                <input className="input" value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Mustermann" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">E-Mail <span className="text-red-500">*</span></label>
                <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="max@schmeuser.de" required />
              </div>
              <div>
                <label className="label">Telefon</label>
                <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+49 ..." />
              </div>
              <div>
                <label className="label">Geburtsdatum</label>
                <input className="input" type="date" value={form.birth_date} onChange={e => set('birth_date', e.target.value)} />
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">📍 Adresse</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="label">Straße</label>
                  <input className="input" value={form.street} onChange={e => set('street', e.target.value)} placeholder="Musterstraße" />
                </div>
                <div>
                  <label className="label">Hausnummer</label>
                  <input className="input" value={form.house_number} onChange={e => set('house_number', e.target.value)} placeholder="12" />
                </div>
                <div>
                  <label className="label">PLZ</label>
                  <input className="input" value={form.postal_code} onChange={e => set('postal_code', e.target.value)} placeholder="12345" />
                </div>
                <div className="col-span-2">
                  <label className="label">Stadt</label>
                  <input className="input" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Berlin" />
                </div>
              </div>
            </div>

            <div>
              <label className="label">Eintrittsdatum</label>
              <input className="input" type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
            </div>

            {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg">⚠️ {error}</p>}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Abbrechen</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
                {loading ? 'Wird hinzugefügt...' : 'Mitarbeiter hinzufügen'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}