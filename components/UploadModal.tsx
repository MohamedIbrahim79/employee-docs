'use client'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface Props {
  doc: any
  userId: string
  onClose: () => void
  onDone: () => void
}

export default function UploadModal({ doc, userId, onClose, onDone }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [expiryDate, setExpiryDate] = useState(doc.expiry_date || '')
  const [issueDate, setIssueDate] = useState(doc.issue_date || '')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setFile(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'], 'application/pdf': ['.pdf'] },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    onDropRejected: () => setError('الملف غير مقبول. يجب أن يكون صورة أو PDF ولا يتجاوز 10MB'),
  })

  async function handleUpload() {
    if (!file && !doc.file_url) { setError('يجب رفع ملف'); return }
    if (doc.document_type?.has_expiry && !expiryDate) { setError('يجب إدخال تاريخ الانتهاء'); return }

    setUploading(true)
    setError('')
    setProgress(30)

    try {
      const fd = new FormData()
      if (file) fd.append('file', file)
      fd.append('document_type_id', doc.document_type?.id)
      fd.append('user_id', userId)
      if (expiryDate) fd.append('expiry_date', expiryDate)
      if (issueDate) fd.append('issue_date', issueDate)

      setProgress(60)
      const res = await fetch('/api/documents', { method: 'POST', body: fd })
      const data = await res.json()
      setProgress(100)

      if (!res.ok) { setError(data.error || 'فشل الرفع'); setUploading(false); return }
      onDone()
    } catch {
      setError('خطأ في الاتصال')
      setUploading(false)
    }
  }

  const fileSizeMB = file ? (file.size / 1024 / 1024).toFixed(1) : null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900">{doc.document_type?.name_ar}</h2>
              <p className="text-sm text-gray-400">{doc.document_type?.name_de}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">✕</button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Dropzone */}
          <div>
            <label className="label">الملف (صورة أو PDF)</label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-brand-500 bg-brand-50' : file ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-brand-300 hover:bg-brand-50'
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div>
                  <div className="text-3xl mb-2">{file.type === 'application/pdf' ? '📄' : '🖼️'}</div>
                  <p className="font-medium text-green-700 text-sm">{file.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{fileSizeMB} MB</p>
                  <p className="text-xs text-brand-600 mt-2">اضغط لاختيار ملف آخر</p>
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-3">📁</div>
                  <p className="font-medium text-gray-600 text-sm">اسحب الملف هنا أو اضغط للاختيار</p>
                  <p className="text-xs text-gray-400 mt-1">JPG · PNG · PDF · حتى 10MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          {doc.document_type?.has_expiry && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">
                  تاريخ الانتهاء <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className="input"
                  value={expiryDate}
                  onChange={e => setExpiryDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="label">تاريخ الإصدار</label>
                <input
                  type="date"
                  className="input"
                  value={issueDate}
                  onChange={e => setIssueDate(e.target.value)}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">
              ⚠️ {error}
            </div>
          )}

          {uploading && progress > 0 && (
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>جارٍ الرفع...</span>
                <span>{progress}%</span>
              </div>
              <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="bg-brand-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">إلغاء</button>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="btn-primary flex-1 justify-center"
          >
            {uploading ? 'جارٍ الرفع...' : '⬆️ رفع الوثيقة'}
          </button>
        </div>
      </div>
    </div>
  )
}
