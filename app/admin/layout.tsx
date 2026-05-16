import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import AdminSidebar from '@/components/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'admin') redirect('/employee')

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar user={session} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
