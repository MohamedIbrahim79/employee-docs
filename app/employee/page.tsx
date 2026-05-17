'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import DocumentCard from '@/components/DocumentCard'
import UploadModal from '@/components/UploadModal'

export default function EmployeeDocs() {
  const [docs, setDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadDoc, setUploadDoc] = useState<any>(null)
  const [userId, setUserId] = useState<string>('')
  const searchParams = useSearchParams()
  const highlightDocId = searchParams.get('doc')

  function getToken() {
    return localStorage.getItem('auth_token') || ''
  }

  async function load() {
    setLoading(true)
    const token = getToken()
    const meRes = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const me = await meRes.json()
    if (me?.id) {
      setUserId(me.id)
      const res = await fetch(`/api/documents?user_id=${me.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      setDocs(Array.isArray(data) ? data : [])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (highlightDocId && !loading) {
      setTimeout(() => {
        const el = document.getElementById(`doc-${highlightDocId}`)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 300)
    }
  }, [highlightDocId, loading])

  const today = new Date(); today.setHours(0,0,0,0)
  const uploaded = docs.filter(d => d.file_url).length
  const expiring = docs.filter(d => {
    if (!d.expiry_date || !d.file_url) return false
    const days = Math.ceil((new Date(d.expiry_date).getTime() - today.getTime()) / 86400000)
    return days >= 0 && days <= 30
  }).length
  const expired = docs.filter(d => d.expiry_date && d.file_url && new Date(d.expiry_date) < today).length
  const missing = docs.filter(d => !d.file_url).length

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="page-title">Meine Dokumente</h1>
        <p className="text-gray-500 text-sm mt-1">Laden Sie Ihre erforderlichen Dokumente hoch</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Hochgeladen', value: uploaded, color: 'text-green-700' },
          { label: 'Fehlend', value: missing, color: 'text-gray-600' },
          { label: 'Läuft bald ab', value: expiring, color: 'text-yellow-700' },
          { label: 'Abgelaufen', value: expired, color: 'text-red-700' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="text-sm font-semibold text-gray-500 mb-1">{s.label}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Wird geladen...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {docs.map(doc => (
            <div
              key={doc.id}
              id={`doc-${doc.id}`}
              style={highlightDocId === doc.id ? {
                transform: 'scale(1.03)',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.18)',
                borderRadius: '12px',
                position: 'relative',
                zIndex: 10,
                transition: 'all 0.3s ease',
              } : {
                transition: 'all 0.3s ease',
              }}
            >
              <DocumentCard
                doc={doc}
                isAdmin={false}
                onRefresh={load}
                onUpload={() => setUploadDoc(doc)}
              />
            </div>
          ))}
        </div>
      )}

      {uploadDoc && (
        <UploadModal
          doc={uploadDoc}
          userId={userId}
          onClose={() => setUploadDoc(null)}
          onDone={() => { setUploadDoc(null); load() }}
        />
      )}
    </div>
  )
}