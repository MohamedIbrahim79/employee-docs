'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { UserPayload } from '@/lib/auth'
import clsx from 'clsx'

export default function AdminSidebar({ user }: { user: UserPayload }) {
  const pathname = usePathname()
  const router = useRouter()

  const links = [
    { href: '/admin', label: 'Dashboard', icon: '📊', exact: true },
    { href: '/admin/employees', label: 'Mitarbeiter', icon: '👥' },
    { href: '/admin/alerts', label: 'Benachrichtigungen', icon: '🔔' },
    { href: '/admin/settings', label: 'Einstellungen', icon: '⚙️' },
  ]

  async function logout() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_role')
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-100 flex-col shadow-sm shrink-0">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-800 rounded-xl flex items-center justify-center text-white text-lg">🏢</div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">Dokumentensystem</p>
              <p className="text-xs text-gray-400">Verwaltungspanel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {links.map(l => {
            const active = l.exact ? pathname === l.href : pathname.startsWith(l.href)
            return (
              <Link key={l.href} href={l.href} className={clsx('sidebar-link', active && 'active')}>
                <span>{l.icon}</span>
                <span>{l.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-800 font-bold text-sm">
              {user.full_name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.full_name}</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
          <button onClick={logout} className="sidebar-link w-full text-red-500 hover:text-red-700 hover:bg-red-50">
            <span>🚪</span><span>Abmelden</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-800 rounded-lg flex items-center justify-center text-white">🏢</div>
            <p className="font-bold text-gray-900 text-sm">Dokumentensystem</p>
          </div>
          <button onClick={logout} className="text-red-500 text-sm px-2 py-1">🚪</button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-lg">
        <div className="flex justify-around items-center py-2">
          {links.map(l => {
            const active = l.exact ? pathname === l.href : pathname.startsWith(l.href)
            return (
              <Link key={l.href} href={l.href}
                className={clsx(
                  'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors',
                  active ? 'text-brand-800' : 'text-gray-400'
                )}>
                <span className="text-xl">{l.icon}</span>
                <span className="text-xs font-medium">{l.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}