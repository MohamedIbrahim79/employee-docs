'use client'
import { useState } from 'react'

export default function EmployeeProfile() {
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
    <div className="p-8 max-w-xl">
      <h1 className="page-title mb-6">👤 ملفي الشخصي</h1>

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
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'جارٍ الحفظ...' : 'تغيير كلمة المرور'}
          </button>
        </form>
      </div>

      <div className="card p-6 mt-4">
        <h2 className="section-title mb-3">💡 تعليمات رفع الوثائق</h2>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>✅ يُقبل: صور واضحة (JPG, PNG) أو ملفات PDF</li>
          <li>✅ الحجم الأقصى للملف: 10 ميغابايت</li>
          <li>✅ تأكد أن الصورة واضحة وغير مقصوصة</li>
          <li>⏰ ستصلك إيميلات تذكير قبل انتهاء أي وثيقة بـ 30 يوم و7 أيام</li>
          <li>🔔 وكذلك في يوم الانتهاء وبعده كل أسبوع</li>
        </ul>
      </div>
    </div>
  )
}
