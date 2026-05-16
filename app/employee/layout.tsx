import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import EmployeeSidebar from '@/components/EmployeeSidebar'

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role === 'admin') redirect('/admin')

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <EmployeeSidebar user={session} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
