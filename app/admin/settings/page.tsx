'use client'
import { useState } from 'react'

export default function AdminSettings() {
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function getToken() {
    return localStorage.getItem('auth_token') ||
      document.cookie.split('; ').find(r => r.startsWith('auth_token='))?.split('=')[1] || ''
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    setMsg(''); setError('')
    if (newPw !== confirmPw) { setError('Passwörter stimmen nicht überein'); return }
    if (newPw.length < 8) { setError('Passwort muss mindestens 8 Zeichen haben'); return }
    setLoading(true)
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ current_password: currentPw, new_password: newPw }),
    })
    const data = await res.json()
    if (!res.ok) setError(data.error)
    else { setMsg('Passwort erfolgreich geändert ✅'); setCurrentPw(''); setNewPw(''); setConfirmPw('') }
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="page-title mb-6">⚙️ Einstellungen</h1>

      <div className="card p-6">
        <h2 className="section-title mb-4">🔐 Passwort ändern</h2>
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className="label">Aktuelles Passwort</label>
            <input type="password" className="input" value={currentPw} onChange={e => setCurrentPw(e.target.value)} required />
          </div>
          <div>
            <label className="label">Neues Passwort</label>
            <input type="password" className="input" value={newPw} onChange={e => setNewPw(e.target.value)} required placeholder="Mindestens 8 Zeichen" />
          </div>
          <div>
            <label className="label">Passwort bestätigen</label>
            <input type="password" className="input" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required />
          </div>
          {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg">{error}</p>}
          {msg && <p className="text-green-700 text-sm bg-green-50 px-4 py-3 rounded-lg">{msg}</p>}
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Wird gespeichert...' : 'Passwort ändern'}
          </button>
        </form>
      </div>

      <div className="card p-6 mt-5">
        <h2 className="section-title mb-2">📧 Benachrichtigungseinstellungen</h2>
        <p className="text-sm text-gray-500 mb-4">Automatische Benachrichtigungen werden täglich per Cron-Skript gesendet</p>
        <div className="bg-gray-50 rounded-lg p-4 text-sm font-mono text-gray-700 space-y-1">
          <p># Manuell ausführen:</p>
          <p className="text-brand-800">node lib/cron.js</p>
          <p className="mt-2"># GitHub Actions (täglich um 8 Uhr):</p>
          <p className="text-brand-800">cron: '0 8 * * *'</p>
        </div>
      </div>
    </div>
  )
}