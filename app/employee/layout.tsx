'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import EmployeeSidebar from '@/components/EmployeeSidebar'

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
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

        // لو الموظف محتاج يكمل بياناته ومش في صفحة الـ setup
        if (data.needs_profile_setup && pathname !== '/employee/setup') {
          router.push('/employee/setup')
        }
      })
      .catch(() => router.push('/login'))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Wird geladen...</div>

  // لو في صفحة الـ setup متعرضش الـ sidebar
  if (pathname === '/employee/setup') {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <EmployeeSidebar user={user} />
      <main className="flex-1 overflow-y-auto pt-14 pb-20 md:pt-0 md:pb-0">
        {children}
      </main>
    </div>
  )
}