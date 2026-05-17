'use client'
import { useState, useEffect } from 'react'

export default function AdminSettings() {
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profileMsg, setProfileMsg] = useState('')
  const [profileError, setProfileError] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')

  function getToken() {
    return localStorage.getItem('auth_token') ||
      document.cookie.split('; ').find(r => r.startsWith('auth_token='))?.split('=')[1] || ''
  }

  useEffect(() => {
    fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
      .then(r => r.json())
      .then(data => {
        setUser(data)
        setFullName(data.full_name || '')
        setPhone(data.phone || '')
      })
  }, [])

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    setMsg(''); setError('')
    if (newPw !== confirmPw) { setError('Passwörter stimmen nicht überein'); return }
    if (newPw.length < 8) { setError('Passwort muss mindestens 8 Zeichen haben'); return }
    setLoading(true)
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify({ current_password: currentPw, new_password: newPw }),
    })
    const data = await res.json()
    if (!res.ok) setError(data.error)
    else { setMsg('Passwort erfolgreich geändert ✅'); setCurrentPw(''); setNewPw(''); setConfirmPw('') }
    setLoading(false)
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfileMsg(''); setProfileError('')
    setProfileLoading(true)
    const res = await fetch(`/api/employees/${user?.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify({ full_name: fullName, phone, is_active: true }),
    })
    const data = await res.json()
    if (!res.ok) setProfileError(data.error)
    else setProfileMsg('Profil erfolgreich gespeichert ✅')
    setProfileLoading(false)
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="page-title mb-6">⚙️ Einstellungen</h1>

      {/* Profile */}
      <div className="card p-6 mb-5">
        <h2 className="section-title mb-4">👤 Mein Profil</h2>
        <div className="bg-brand-50 rounded-xl p-4 mb-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-brand-800 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {user?.full_name?.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-brand-900">{user?.full_name}</p>
            <p className="text-sm text-brand-600">{user?.email}</p>
            <span className="text-xs bg-brand-800 text-white px-2 py-0.5 rounded-full mt-1 inline-block">
              {user?.role === 'owner' ? 'Geschäftsführer' : user?.role === 'hr' ? 'HR Manager' : 'Administrator'}
            </span>
          </div>
        </div>
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="label">Vollständiger Name</label>
            <input type="text" className="input" value={fullName} onChange={e => setFullName(e.target.value)} required />
          </div>
          <div>
            <label className="label">Telefon</label>
            <input type="text" className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+49 ..." />
          </div>
          {profileError && <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg">{profileError}</p>}
          {profileMsg && <p className="text-green-700 text-sm bg-green-50 px-4 py-3 rounded-lg">{profileMsg}</p>}
          <button type="submit" disabled={profileLoading} className="btn-primary">
            {profileLoading ? 'Wird gespeichert...' : 'Profil speichern'}
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="card p-6 mb-5">
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

      {/* Notifications */}
      <div className="card p-6">
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