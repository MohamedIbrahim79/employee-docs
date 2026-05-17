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
  const [address, setAddress] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [editing, setEditing] = useState(false)

  function getToken() {
    return localStorage.getItem('auth_token') ||
      document.cookie.split('; ').find(r => r.startsWith('auth_token='))?.split('=')[1] || ''
  }

  async function loadProfile() {
    const res = await fetch(`/api/auth/me?t=${Date.now()}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` },
      cache: 'no-store'
    })
    const data = await res.json()
    setUser(data)
    setFullName(data.full_name || '')
    setPhone(data.phone || '')
    setAddress(data.address || '')
    setBirthDate(data.birth_date ? data.birth_date.substring(0, 10) : '')
  }

  useEffect(() => { loadProfile() }, [])

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
    else { setMsg('Passwort erfolgreich geändert'); setCurrentPw(''); setNewPw(''); setConfirmPw('') }
    setLoading(false)
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfileMsg(''); setProfileError('')
    setProfileLoading(true)
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify({
        full_name: fullName,
        phone: phone || null,
        address: address || null,
        birth_date: birthDate && birthDate.length > 0 ? birthDate : null,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      setProfileError(data.error)
    } else {
      setProfileMsg('Profil erfolgreich gespeichert')
      setUser(data)
      setFullName(data.full_name || '')
      setPhone(data.phone || '')
      setAddress(data.address || '')
      setBirthDate(data.birth_date ? data.birth_date.substring(0, 10) : '')
      setEditing(false)
    }
    setProfileLoading(false)
  }

  function cancelEdit() {
    setFullName(user?.full_name || '')
    setPhone(user?.phone || '')
    setAddress(user?.address || '')
    setBirthDate(user?.birth_date ? user.birth_date.substring(0, 10) : '')
    setEditing(false)
    setProfileMsg('')
    setProfileError('')
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="page-title mb-6">⚙️ Einstellungen</h1>

      <div className="card p-6 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">👤 Mein Profil</h2>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn-secondary text-sm">
              Bearbeiten
            </button>
          )}
        </div>

        <div className="bg-brand-900 rounded-xl p-4 mb-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-brand-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {user?.full_name?.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-white">{user?.full_name}</p>
            <p className="text-sm text-brand-300">{user?.email}</p>
            <span className="text-xs bg-[#c9a84c] text-white px-2 py-0.5 rounded-full mt-1 inline-block">
              {user?.role === 'owner' ? 'Geschäftsführer' : user?.role === 'hr' ? 'HR Manager' : 'Administrator'}
            </span>
          </div>
        </div>

        {!editing ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Vollständiger Name</p>
              <p className="text-gray-900">{user?.full_name || '—'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">E-Mail</p>
              <p className="text-gray-900">{user?.email || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Telefon</p>
              <p className="text-gray-900">{user?.phone || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Geburtsdatum</p>
              <p className="text-gray-900">{user?.birth_date ? new Date(user.birth_date).toLocaleDateString('de-DE') : '—'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Adresse</p>
              <p className="text-gray-900">{user?.address || '—'}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Vollständiger Name</label>
                <input type="text" className="input" value={fullName} onChange={e => setFullName(e.target.value)} required />
              </div>
              <div className="col-span-2">
                <label className="label">E-Mail</label>
                <input type="text" className="input bg-gray-50" value={user?.email || ''} disabled />
              </div>
              <div>
                <label className="label">Telefon</label>
                <input type="text" className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+49 ..." />
              </div>
              <div>
                <label className="label">Geburtsdatum</label>
                <input type="date" className="input" value={birthDate} onChange={e => setBirthDate(e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="label">Adresse</label>
                <input type="text" className="input" value={address} onChange={e => setAddress(e.target.value)} placeholder="Musterstraße 1, 12345 Berlin" />
              </div>
            </div>
            {profileError && <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg">{profileError}</p>}
            {profileMsg && <p className="text-green-700 text-sm bg-green-50 px-4 py-3 rounded-lg">{profileMsg}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={cancelEdit} className="btn-secondary flex-1 justify-center">Abbrechen</button>
              <button type="submit" disabled={profileLoading} className="btn-primary flex-1 justify-center">
                {profileLoading ? 'Wird gespeichert...' : 'Speichern'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="card p-6 mb-5">
        <h2 className="section-title mb-4">Passwort ändern</h2>
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
    </div>
  )
}