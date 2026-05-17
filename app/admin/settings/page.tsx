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

  function getRoleLabel(role: string) {
    if (role === 'owner') return 'Geschäftsführer'
    if (role === 'hr') return 'HR Manager'
    return 'Administrator'
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <h1 className="page-title mb-8">Einstellungen</h1>

      {/* Profile Card */}
      <div className="card overflow-hidden mb-6">
        <div className="bg-brand-900 px-4 py-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-[#c9a84c] rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shrink-0">
              {user?.full_name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-white truncate">{user?.full_name}</h2>
              <p className="text-brand-300 text-sm truncate">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-xs bg-white/20 text-white px-3 py-0.5 rounded-full">
                  {getRoleLabel(user?.role || '')}
                </span>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-[#c9a84c] hover:bg-[#b8973b] text-white text-xs px-3 py-0.5 rounded-full transition-colors">
                    Bearbeiten
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {!editing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { label: 'Vollständiger Name', value: user?.full_name },
                { label: 'E-Mail', value: user?.email },
                { label: 'Telefon', value: user?.phone },
                { label: 'Geburtsdatum', value: user?.birth_date ? new Date(user.birth_date).toLocaleDateString('de-DE') : null },
                { label: 'Adresse', value: user?.address, full: true },
              ].map(item => (
                <div key={item.label} className={item.full ? 'md:col-span-2' : ''}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
                  <p className="text-gray-800 font-medium">{item.value || '—'}</p>
                </div>
              ))}
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
                  <input type="text" className="input bg-gray-50 text-gray-400" value={user?.email || ''} disabled />
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
              {profileError && <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg border border-red-100">{profileError}</p>}
              {profileMsg && <p className="text-green-700 text-sm bg-green-50 px-4 py-3 rounded-lg border border-green-100">{profileMsg}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={cancelEdit} className="btn-secondary flex-1 justify-center">Abbrechen</button>
                <button type="submit" disabled={profileLoading} className="btn-primary flex-1 justify-center">
                  {profileLoading ? 'Wird gespeichert...' : 'Speichern'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Password Card */}
      <div className="card overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100 bg-brand-900/5">
          <h2 className="font-semibold text-brand-900">Passwort ändern</h2>
          <p className="text-xs text-gray-500 mt-0.5">Mindestens 8 Zeichen</p>
        </div>
        <div className="p-6">
          <form onSubmit={changePassword} className="space-y-4">
            <div>
              <label className="label">Aktuelles Passwort</label>
              <input type="password" className="input" value={currentPw} onChange={e => setCurrentPw(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Neues Passwort</label>
                <input type="password" className="input" value={newPw} onChange={e => setNewPw(e.target.value)} required placeholder="Min. 8 Zeichen" />
              </div>
              <div>
                <label className="label">Passwort bestätigen</label>
                <input type="password" className="input" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required />
              </div>
            </div>
            {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg border border-red-100">{error}</p>}
            {msg && <p className="text-green-700 text-sm bg-green-50 px-4 py-3 rounded-lg border border-green-100">{msg}</p>}
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Wird gespeichert...' : 'Passwort ändern'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}