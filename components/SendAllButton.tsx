'use client'
import { useState } from 'react'

export default function SendAllButton() {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function sendAll() {
    setLoading(true); setMsg('')
    const res = await fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
    const data = await res.json()
    setMsg(data.message || 'تم الإرسال')
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-3">
      {msg && <span className="text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">{msg}</span>}
      <button onClick={sendAll} disabled={loading} className="btn-primary">
        {loading ? '...' : '📨 إرسال كل التذكيرات'}
      </button>
    </div>
  )
}
