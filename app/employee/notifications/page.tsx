'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function EmployeeNotifications() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  function getToken() {
    return localStorage.getItem('auth_token') ||
      document.cookie.split('; ').find(r => r.startsWith('auth_token='))?.split('=')[1] || ''
  }

  async function load() {
    const res = await fetch('/api/in-app-notifications', {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
    const data = await res.json()
    setNotifications(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function markAsRead(id: string) {
    await fetch(`/api/in-app-notifications/${id}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  useEffect(() => { load() }, [])

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <h1 className="page-title mb-6">Benachrichtigungen</h1>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Wird geladen...</div>
      ) : notifications.length === 0 ? (
        <div className="card p-16 text-center text-gray-400">
          <p className="text-lg font-medium text-gray-600">Keine Benachrichtigungen</p>
        </div>
      ) : (
        <div className="card divide-y divide-gray-50">
          {notifications.map(n => (
            <div key={n.id} className={`p-4 ${!n.is_read ? 'bg-blue-50' : ''}`}>
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.is_read ? 'bg-blue-500' : 'bg-gray-300'}`} />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{n.title}</p>
                  <p className="text-gray-600 text-sm mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.created_at).toLocaleDateString('de-DE')} — {new Date(n.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {n.metadata?.document_id && (
                  <Link
                    href={`/employee?doc=${n.metadata.document_id}`}
                    onClick={() => markAsRead(n.id)}
                    className="btn-secondary py-1.5 px-3 text-xs shrink-0">
                    Öffnen
                  </Link>
                )}
                {n.metadata?.payslip_id && (
                  <Link
                    href={`/employee/payslips?id=${n.metadata.payslip_id}`}
                    onClick={() => markAsRead(n.id)}
                    className="btn-secondary py-1.5 px-3 text-xs shrink-0">
                    Öffnen
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}