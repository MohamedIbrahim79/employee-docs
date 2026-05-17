'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // حالة فتح وغلق القائمة في الموبايل
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const role = localStorage.getItem('user_role')

    if (!token) {
      router.push('/login')
      return
    }

    if (role === 'employee') {
      router.push('/employee')
      return
    }

    fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          router.push('/login')
          return
        }

        setUser(data)
        setLoading(false)
      })
      .catch(() => router.push('/login'))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        Wird geladen...
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* زر القائمة للموبايل */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-white shadow-lg border border-gray-200 rounded-xl px-3 py-2 text-xl"
      >
        ☰
      </button>

      {/* الخلفية السوداء */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 z-50 h-full
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static
        `}
      >
        <div className="relative h-full">

          {/* زر الإغلاق */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden absolute top-4 right-4 z-50 text-white text-2xl"
          >
            ✕
          </button>

          <AdminSidebar user={user} />
        </div>
      </div>

      {/* المحتوى */}
      <main className="flex-1 overflow-y-auto pt-16 pb-20 md:pt-0 md:pb-0 md:ml-0">
        <div className="p-3 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}