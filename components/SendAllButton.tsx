'use client'
import { useState } from 'react'

export default function SendAllButton() {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  function getToken() {
    return localStorage.getItem('auth_token') ||
      document.cookie.split('; ').find(r => r.startsWith('auth_token='))?.split('=')[1] || ''
  }

  async function sendAll() {
    setLoading(true); setMsg('')
    const res = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: '{}'
    })
    const data = await res.json()
    setMsg(`${data.sent} gesendet`)
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button onClick={sendAll} disabled={loading} className="btn-primary text-xs py-1.5 px-3 whitespace-nowrap">
        {loading ? '...' : 'Erinnerungen senden'}
      </button>
      {msg && <span className="text-xs text-green-700">{msg}</span>}
    </div>
  )
}