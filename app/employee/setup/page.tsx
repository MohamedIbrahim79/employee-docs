'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ProfileSetup() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    birth_date: '',
    street: '',
    house_number: '',
    postal_code: '',
    city: '',
  })
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'password' | 'profile'>('password')
  const router = useRouter()

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  function getToken() {
    return localStorage.getItem('auth_token') || ''
  }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (newPw !== confirmPw) { setError('Passwörter stimmen nicht überein'); return }
    if (newPw.length < 8) { setError('Passwort muss mindestens 8 Zeichen haben'); return }
    setLoading(true)
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify({ current_password: newPw, new_password: newPw, skip_current: true }),
    })
    setLoading(false)
    setStep('profile')
  }

  async function submitProfile(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const full_name = `${form.first_name} ${form.last_name}`.trim()
    const address = `${form.street} ${form.house_number}, ${form.postal_code} ${form.city}`.trim()

    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify({
        full_name,
        phone: form.phone,
        birth_date: form.birth_date || null,
        address,
        needs_profile_setup: false,
      }),
    })

    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Fehler'); setLoading(false); return }
    setLoading(false)
    router.push('/employee')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0f1a2e 0%, #1a2744 50%, #0f1a2e 100%)' }}>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
              <polygon points="20,2 38,34 2,34" fill="#c9a84c" opacity="0.9"/>
              <polygon points="20,9 32,34 8,34" fill="#1a2744"/>
              <polygon points="20,16 28,34 12,34" fill="#c9a84c" opacity="0.6"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Schmeuser GmbH</h1>
          <p className="text-[#c9a84c] text-xs mt-1">Security Services</p>
        </div>

        <div className="rounded-2xl p-8"
          style={{
            background: 'rgba(29,39,71,0.85)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 80px rgba(0,0,0,0.45)',
          }}>

          {step === 'password' ? (
            <>
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white">Willkommen! 👋</h2>
                <p className="text-white/60 text-sm mt-2">Bitte legen Sie zuerst ein neues Passwort fest</p>
              </div>

              <form onSubmit={submitPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Neues Passwort</label>
                  <input
                    type="password"
                    value={newPw}
                    onChange={e => setNewPw(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
                    placeholder="Mindestens 8 Zeichen"
                    required
                    onFocus={e => { e.target.style.border = '1px solid rgba(201,168,76,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.15)' }}
                    onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Passwort bestätigen</label>
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={e => setConfirmPw(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
                    placeholder="Passwort wiederholen"
                    required
                    onFocus={e => { e.target.style.border = '1px solid rgba(201,168,76,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.15)' }}
                    onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
                {error && <p className="text-red-300 text-sm bg-red-500/20 px-4 py-3 rounded-xl">{error}</p>}
                <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-300"
                  style={{ background: 'linear-gradient(135deg, #c9a84c, #b8973b)', boxShadow: '0 4px 20px rgba(201,168,76,0.3)' }}>
                  {loading ? 'Wird gespeichert...' : 'Weiter →'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white">Ihre Daten vervollständigen</h2>
                <p className="text-white/60 text-sm mt-2">Diese Informationen sind für Ihre Personalakte erforderlich</p>
              </div>

              <form onSubmit={submitProfile} className="space-y-4" dir="ltr">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">Vorname <span className="text-red-400">*</span></label>
                    <input type="text" value={form.first_name} onChange={e => set('first_name', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
                      placeholder="Max" required
                      onFocus={e => { e.target.style.border = '1px solid rgba(201,168,76,0.6)' }}
                      onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.12)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">Nachname <span className="text-red-400">*</span></label>
                    <input type="text" value={form.last_name} onChange={e => set('last_name', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
                      placeholder="Mustermann" required
                      onFocus={e => { e.target.style.border = '1px solid rgba(201,168,76,0.6)' }}
                      onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.12)' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Telefon <span className="text-red-400">*</span></label>
                  <input type="text" value={form.phone} onChange={e => set('phone', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
                    placeholder="+49 ..." required
                    onFocus={e => { e.target.style.border = '1px solid rgba(201,168,76,0.6)' }}
                    onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.12)' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Geburtsdatum <span className="text-red-400">*</span></label>
                  <input type="date" value={form.birth_date} onChange={e => set('birth_date', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
                    required
                    onFocus={e => { e.target.style.border = '1px solid rgba(201,168,76,0.6)' }}
                    onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.12)' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Adresse <span className="text-red-400">*</span></label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <input type="text" value={form.street} onChange={e => set('street', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
                        placeholder="Straße" required
                        onFocus={e => { e.target.style.border = '1px solid rgba(201,168,76,0.6)' }}
                        onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.12)' }}
                      />
                    </div>
                    <div>
                      <input type="text" value={form.house_number} onChange={e => set('house_number', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
                        placeholder="Nr." required
                        onFocus={e => { e.target.style.border = '1px solid rgba(201,168,76,0.6)' }}
                        onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.12)' }}
                      />
                    </div>
                    <div>
                      <input type="text" value={form.postal_code} onChange={e => set('postal_code', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
                        placeholder="PLZ" required
                        onFocus={e => { e.target.style.border = '1px solid rgba(201,168,76,0.6)' }}
                        onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.12)' }}
                      />
                    </div>
                    <div className="col-span-2">
                      <input type="text" value={form.city} onChange={e => set('city', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
                        placeholder="Stadt" required
                        onFocus={e => { e.target.style.border = '1px solid rgba(201,168,76,0.6)' }}
                        onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.12)' }}
                      />
                    </div>
                  </div>
                </div>

                {error && <p className="text-red-300 text-sm bg-red-500/20 px-4 py-3 rounded-xl">{error}</p>}

                <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-300"
                  style={{ background: 'linear-gradient(135deg, #c9a84c, #b8973b)', boxShadow: '0 4px 20px rgba(201,168,76,0.3)' }}>
                  {loading ? 'Wird gespeichert...' : 'Profil speichern'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}