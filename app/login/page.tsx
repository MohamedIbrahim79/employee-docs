'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError('E-Mail oder Passwort ist falsch'); return }
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('user_role', data.role)
      router.push(data.role === 'employee' ? '/employee' : '/admin')
      router.refresh()
    } catch {
      setError('Verbindungsfehler. Bitte versuchen Sie es erneut.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f1a2e 0%, #1a2744 50%, #0f1a2e 100%)' }}>

      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #c9a84c, transparent)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #c9a84c, transparent)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #c9a84c, transparent)' }} />
      </div>

      <div className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-2xl mb-5"
            style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 0 40px rgba(201,168,76,0.3)' }}>
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-14 h-14">
              <polygon points="20,2 38,34 2,34" fill="#c9a84c" opacity="0.9"/>
              <polygon points="20,9 32,34 8,34" fill="#1a2744"/>
              <polygon points="20,16 28,34 12,34" fill="#c9a84c" opacity="0.6"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-wide">Schmeuser GmbH</h1>
          <p className="text-[#c9a84c] text-sm mt-1 font-medium tracking-widest uppercase">Security Services</p>
          <p className="text-white/40 text-xs mt-3 tracking-wide">Mitarbeiter-Dokumentenverwaltung</p>
        </div>

        {/* Card with glass effect */}
        <div className="rounded-2xl shadow-2xl p-8"
          style={{
            background: 'rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
          }}>
          <h2 className="text-xl font-bold text-white mb-6 text-center">Anmelden</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">E-Mail-Adresse</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'white',
                }}
                placeholder="name@schmeuser.de"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Passwort</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'white',
                }}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/20 text-red-300 text-sm px-4 py-3 rounded-xl border border-red-500/30">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-base font-semibold transition-all duration-200"
              style={{
                background: loading ? 'rgba(201,168,76,0.5)' : 'linear-gradient(135deg, #c9a84c, #b8973b)',
                color: 'white',
                boxShadow: '0 4px 20px rgba(201,168,76,0.3)'
              }}>
              {loading ? 'Anmeldung läuft...' : 'Anmelden'}
            </button>
          </form>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          Internal Access Only
        </p>
      </div>
    </div>
  )
}