'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
]

export default function EmployeePayslips() {
  const [payslips, setPayslips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const highlightId = searchParams.get('id')

  function getToken() {
    return localStorage.getItem('auth_token') || ''
  }

  async function load() {
    const res = await fetch('/api/payslips', {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
    const data = await res.json()
    setPayslips(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (highlightId && !loading) {
      setTimeout(() => {
        const el = document.getElementById(`payslip-${highlightId}`)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 300)
    }
  }, [highlightId, loading])

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <h1 className="page-title mb-6">Lohnabrechnungen</h1>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Wird geladen...</div>
      ) : payslips.length === 0 ? (
        <div className="card p-16 text-center text-gray-400">
          <p className="text-lg font-medium text-gray-600">Keine Lohnabrechnungen vorhanden</p>
        </div>
      ) : (
        <div className="card divide-y divide-gray-50">
          {payslips.map(p => (
            <div
              key={p.id}
              id={`payslip-${p.id}`}
              className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              style={highlightId === p.id ? {
                transform: 'scale(1.02)',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.18)',
                borderRadius: '12px',
                position: 'relative',
                zIndex: 10,
                transition: 'all 0.3s ease',
                background: '#fffbeb',
              } : {
                transition: 'all 0.3s ease',
              }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-900/10 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-brand-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{MONTHS[p.month - 1]} {p.year}</p>
                  <p className="text-xs text-gray-400">{new Date(p.uploaded_at).toLocaleDateString('de-DE')}</p>
                </div>
              </div>
              <a href={p.file_url} target="_blank" rel="noopener noreferrer" className="btn-secondary py-1.5 px-3 text-xs">
                Herunterladen
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}