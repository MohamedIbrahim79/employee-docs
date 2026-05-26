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
  const [filter, setFilter] = useState<'all' | 'uploaded' | 'missing' | 'expiring' | 'expired'>('all')
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

  const filteredDocs = docs.filter(d => {
    if (filter === 'all') return true
    if (filter === 'uploaded') return d.file_url
    if (filter === 'missing') return !d.file_url
    if (filter === 'expiring') {
      if (!d.expiry_date || !d.file_url) return false
      const days = Math.ceil((new Date(d.expiry_date).getTime() - today.getTime()) / 86400000)
      return days >= 0 && days <= 30
    }
    if (filter === 'expired') return d.expiry_date && d.file_url && new Date(d.expiry_date) < today
    return true
  })

  const stats = [
    {
      label: 'Hochgeladen',
      value: uploaded,
      color: 'text-green-700',
      bg: 'bg-green-50',
      border: 'border-green-100',
      active: 'ring-2 ring-green-400',
      filterKey: 'uploaded' as const,
      icon: <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    {
      label: 'Fehlend',
      value: missing,
      color: 'text-gray-600',
      bg: 'bg-gray-50',
      border: 'border-gray-100',
      active: 'ring-2 ring-gray-400',
      filterKey: 'missing' as const,
      icon: <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    },
    {
      label: 'Läuft bald ab',
      value: expiring,
      color: 'text-yellow-700',
      bg: 'bg-yellow-50',
      border: 'border-yellow-100',
      active: 'ring-2 ring-yellow-400',
      filterKey: 'expiring' as const,
      icon: <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    {
      label: 'Abgelaufen',
      value: expired,
      color: 'text-red-700',
      bg: 'bg-red-50',
      border: 'border-red-100',
      active: 'ring-2 ring-red-400',
      filterKey: 'expired' as const,
      icon: <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
    },
  ]

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="page-title">Meine Dokumente</h1>
        <p className="text-gray-500 text-sm mt-1">Laden Sie Ihre erforderlichen Dokumente hoch</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map(s => (
          <button
            key={s.label}
            onClick={() => setFilter(filter === s.filterKey ? 'all' : s.filterKey)}
            className={`card p-4 border ${s.border} ${s.bg} flex items-center gap-3 text-left transition-all duration-200 hover:-translate-y-0.5 ${filter === s.filterKey ? s.active : ''}`}>
            <div className="shrink-0">{s.icon}</div>
            <div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          </button>
        ))}
      </div>

      {filter !== 'all' && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-gray-500">Filter aktiv:</span>
          <span className="text-sm font-medium text-brand-800">{stats.find(s => s.filterKey === filter)?.label}</span>
          <button onClick={() => setFilter('all')} className="text-xs text-red-500 hover:underline">✕ Zurücksetzen</button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-gray-400">Wird geladen...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.length === 0 ? (
            <div className="col-span-2 text-center py-10 text-gray-400">Keine Dokumente gefunden</div>
          ) : filteredDocs.map(doc => (
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