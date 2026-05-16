'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { UserPayload } from '@/lib/auth'
import { useLang } from './LangProvider'
import LangSwitcher from './LangSwitcher'
import clsx from 'clsx'

export default function AdminSidebar({ user }: { user: UserPayload }) {
  const pathname = usePathname()
  const router = useRouter()
  const { t, lang } = useLang()

  const links = [
    { href: '/admin', label: t('dashboard'), icon: '📊', exact: true },
    { href: '/admin/employees', label: t('employees'), icon: '👥' },
    { href: '/admin/alerts', label: t('alerts'), icon: '🔔' },
    { href: '/admin/settings', label: t('settings'), icon: '⚙️' },
  ]

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shadow-sm shrink-0">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-brand-800 rounded-xl flex items-center justify-center text-white text-lg">🏢</div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">Dokumentensystem</p>
            <p className="text-xs text-gray-400">{t('adminPanel')}</p>
          </div>
        </div>
        <LangSwitcher />
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {links.map(l => {
          const active = l.exact ? pathname === l.href : pathname.startsWith(l.href)
          return (
            <Link key={l.href} href={l.href}
              className={clsx('sidebar-link', active && 'active')}>
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
          <span>🚪</span><span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  )
}
