'use client'
import { useState } from 'react'

export default function AdminSettings() {
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    setMsg(''); setError('')
    if (newPw !== confirmPw) { setError('كلمتا المرور غير متطابقتين'); return }
    if (newPw.length < 8) { setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل'); return }
    setLoading(true)
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_password: currentPw, new_password: newPw }),
    })
    const data = await res.json()
    if (!res.ok) setError(data.error)
    else { setMsg('تم تغيير كلمة المرور بنجاح ✅'); setCurrentPw(''); setNewPw(''); setConfirmPw('') }
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="page-title mb-6">⚙️ الإعدادات</h1>

      <div className="card p-6">
        <h2 className="section-title mb-4">🔐 تغيير كلمة المرور</h2>
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className="label">كلمة المرور الحالية</label>
            <input type="password" className="input" value={currentPw} onChange={e => setCurrentPw(e.target.value)} required />
          </div>
          <div>
            <label className="label">كلمة المرور الجديدة</label>
            <input type="password" className="input" value={newPw} onChange={e => setNewPw(e.target.value)} required placeholder="8 أحرف على الأقل" />
          </div>
          <div>
            <label className="label">تأكيد كلمة المرور الجديدة</label>
            <input type="password" className="input" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required />
          </div>
          {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg">{error}</p>}
          {msg && <p className="text-green-700 text-sm bg-green-50 px-4 py-3 rounded-lg">{msg}</p>}
          <button type="submit" disabled={loading} className="btn-primary">{loading ? 'جارٍ الحفظ...' : 'تغيير كلمة المرور'}</button>
        </form>
      </div>

      <div className="card p-6 mt-5">
        <h2 className="section-title mb-2">📧 إعدادات الإشعارات</h2>
        <p className="text-sm text-gray-500 mb-4">الإشعارات التلقائية تُرسل عبر سكريبت الـ Cron يومياً</p>
        <div className="bg-gray-50 rounded-lg p-4 text-sm font-mono text-gray-700 space-y-1">
          <p># تشغيل يدوي:</p>
          <p className="text-brand-800">node lib/cron.js</p>
          <p className="mt-2"># GitHub Actions (كل يوم الساعة 8 صباحاً):</p>
          <p className="text-brand-800">cron: '0 8 * * *'</p>
        </div>
      </div>
    </div>
  )
}
