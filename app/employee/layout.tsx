'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import EmployeeSidebar from '@/components/EmployeeSidebar'

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const role = localStorage.getItem('user_role')
    if (!token) { router.push('/login'); return }
    if (role === 'admin') { router.push('/admin'); return }

    fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) { router.push('/login'); return }
        setUser(data)
        setLoading(false)
      })
      .catch(() => router.push('/login'))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Wird geladen...</div>

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <EmployeeSidebar user={user} />
      <main className="flex-1 overflow-y-auto pt-14 pb-20 md:pt-0 md:pb-0">
        {children}
      </main>
    </div>
  )
}