'use client'
import { useState } from 'react'
import { differenceInDays } from 'date-fns'

interface Props {
  doc: any
  isAdmin: boolean
  onRefresh: () => void
  onUpload?: () => void
}

export default function DocumentCard({ doc, isAdmin, onRefresh, onUpload }: Props) {
  const [reviewing, setReviewing] = useState(false)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const today = new Date(); today.setHours(0,0,0,0)
  const hasFile = !!doc.file_url
  const daysLeft = doc.expiry_date ? differenceInDays(new Date(doc.expiry_date), today) : null
  const isExpired = daysLeft !== null && daysLeft < 0
  const isExpiring = daysLeft !== null && daysLeft >= 0 && daysLeft <= 30

  let statusLabel = 'مفقودة'
  let statusClass = 'badge-gray'
  let borderColor = 'border-gray-100'

  if (hasFile) {
    if (doc.status === 'rejected') { statusLabel = 'مرفوضة'; statusClass = 'badge-red'; borderColor = 'border-red-200' }
    else if (isExpired) { statusLabel = 'منتهية'; statusClass = 'badge-red'; borderColor = 'border-red-200' }
    else if (isExpiring) { statusLabel = 'تنتهي قريباً'; statusClass = 'badge-yellow'; borderColor = 'border-yellow-200' }
    else { statusLabel = 'سارية'; statusClass = 'badge-green'; borderColor = 'border-green-200' }
  }

  async function review(action: 'approve' | 'reject') {
    setLoading(true)
    await fetch(`/api/documents/${doc.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, notes }),
    })
    setLoading(false)
    setReviewing(false)
    onRefresh()
  }

  return (
    <div className={`card p-5 border ${borderColor} transition-colors`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-tight">
            {doc.document_type?.name_ar}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{doc.document_type?.name_de}</p>
        </div>
        <span className={`badge ${statusClass} shrink-0`}>{statusLabel}</span>
      </div>

      {/* Details */}
      <div className="space-y-1.5 mb-4">
        {doc.document_type?.has_expiry && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">تاريخ الانتهاء</span>
            <span className={`font-medium ${isExpired ? 'text-red-600' : isExpiring ? 'text-yellow-700' : 'text-gray-700'}`}>
              {doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString('de-DE') : '—'}
            </span>
          </div>
        )}
        {daysLeft !== null && hasFile && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">المتبقي</span>
            <span className={`font-medium ${isExpired ? 'text-red-600' : isExpiring ? 'text-yellow-700' : 'text-green-700'}`}>
              {isExpired ? `انتهت منذ ${Math.abs(daysLeft)} يوم` : `${daysLeft} يوم`}
            </span>
          </div>
        )}
        {doc.file_name && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">الملف</span>
            <span className="text-gray-600 truncate max-w-[150px]">{doc.file_name}</span>
          </div>
        )}
        {doc.notes && (
          <div className="bg-red-50 text-red-700 text-xs px-3 py-2 rounded-lg mt-2">
            💬 {doc.notes}
          </div>
        )}
        {!doc.document_type?.is_required && (
          <span className="text-xs text-gray-400">اختياري</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        {hasFile && (
          <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
            className="btn-secondary py-1.5 px-3 text-xs">
            👁 عرض
          </a>
        )}
        {!isAdmin && (
          <button onClick={onUpload} className={`py-1.5 px-3 text-xs ${hasFile ? 'btn-secondary' : 'btn-primary'}`}>
            {hasFile ? '🔄 تحديث' : '⬆️ رفع الوثيقة'}
          </button>
        )}
        {isAdmin && hasFile && !reviewing && (
          <button onClick={() => setReviewing(true)} className="btn-secondary py-1.5 px-3 text-xs">
            📝 مراجعة
          </button>
        )}
      </div>

      {/* Admin review panel */}
      {isAdmin && reviewing && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
          <textarea
            className="input text-xs"
            rows={2}
            placeholder="ملاحظات (اختياري)..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
          <div className="flex gap-2">
            <button onClick={() => review('approve')} disabled={loading} className="btn-primary py-1.5 px-3 text-xs flex-1 justify-center">
              ✅ قبول
            </button>
            <button onClick={() => review('reject')} disabled={loading} className="btn-danger py-1.5 px-3 text-xs flex-1 justify-center">
              ❌ رفض
            </button>
            <button onClick={() => setReviewing(false)} className="btn-secondary py-1.5 px-3 text-xs">
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
