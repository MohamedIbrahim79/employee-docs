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
    <div className="min-h-screen bg-brand-900 flex items-center justify-center p-4 relative overflow-hidden">
      
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-800 rounded-full opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-800 rounded-full opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-800 rounded-full opacity-10" />
      </div>

      <div className="w-full max-w-md relative z-10">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl mb-5 border border-white/20">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
              <polygon points="20,2 38,34 2,34" fill="#c9a84c" opacity="0.9"/>
              <polygon points="20,9 32,34 8,34" fill="#1a2744"/>
              <polygon points="20,16 28,34 12,34" fill="#c9a84c" opacity="0.6"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-wide">Schmeuser GmbH</h1>
          <p className="text-[#c9a84c] text-sm mt-1 font-medium tracking-widest uppercase">Security Services</p>
          <p className="text-white/50 text-xs mt-3">Mitarbeiter-Dokumentenverwaltung</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-white/10">
          <h2 className="text-xl font-bold text-brand-900 mb-6 text-center">Anmelden</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">E-Mail-Adresse</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input"
                placeholder="name@schmeuser.de"
                required
              />
            </div>
            <div>
              <label className="label">Passwort</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
              {loading ? 'Anmeldung läuft...' : 'Anmelden'}
            </button>
          </form>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          © 2025 Schmeuser GmbH — Alle Rechte vorbehalten
        </p>
      </div>
    </div>
  )
}