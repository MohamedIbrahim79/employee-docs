'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { UserPayload } from '@/lib/auth'
import clsx from 'clsx'
import { useState, useEffect } from 'react'

function PyramidLogo({ size = 9 }: { size?: number }) {
  return (
    <div className={`w-${size} h-${size} bg-brand-800 rounded-xl flex items-center justify-center overflow-hidden`}>
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <polygon points="20,4 36,32 4,32" fill="#c9a84c" opacity="0.9"/>
        <polygon points="20,10 32,32 8,32" fill="#1a2744"/>
        <polygon points="20,16 28,32 12,32" fill="#c9a84c" opacity="0.6"/>
      </svg>
    </div>
  )
}

export default function EmployeeSidebar({ user }: { user: UserPayload }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)

  function getToken() {
    return localStorage.getItem('auth_token') ||
      document.cookie.split('; ').find(r => r.startsWith('auth_token='))?.split('=')[1] || ''
  }

  async function loadUnread() {
    const res = await fetch('/api/in-app-notifications', {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
    const data = await res.json()
    setUnread((data || []).filter((n: any) => !n.is_read).length)
  }

  useEffect(() => {
    loadUnread()
    const interval = setInterval(loadUnread, 30000)
    return () => clearInterval(interval)
  }, [])

  const links = [
    { href: '/employee', label: 'Meine Dokumente', icon: '📄', exact: true },
    { href: '/employee/payslips', label: 'Meine Lohnabrechnung', icon: '💰' },
    { href: '/employee/notifications', label: 'Benachrichtigungen', icon: '🔔' },
    { href: '/employee/profile', label: 'Mein Profil', icon: '👤' },
  ]

  async function logout() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_role')
    router.push('/login')
    router.refresh()
  }

  function handleBellClick() {
    if (pathname === '/employee/notifications') {
      router.push('/employee')
    } else {
      router.push('/employee/notifications')
    }
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-brand-900 flex-col shadow-xl shrink-0">
        <div className="p-5 border-b border-brand-800">
          <div className="flex items-center gap-3">
            <PyramidLogo />
            <div>
              <p className="font-bold text-white text-sm leading-tight">Schmeuser GmbH</p>
              <p className="text-[#c9a84c] font-medium" style={{ fontSize: '10px' }}>Security Services</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {links.map(l => {
            const active = l.exact ? pathname === l.href : pathname.startsWith(l.href)
            return (
              <Link key={l.href} href={l.href} className={clsx('sidebar-link', active && 'active')}>
                <span>{l.icon}</span>
                <span className="flex-1">{l.label}</span>
                {l.href === '/employee/notifications' && unread > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {unread}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-brand-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 bg-brand-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user.full_name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.full_name}</p>
              <p className="text-xs text-brand-400">Mitarbeiter</p>
            </div>
          </div>
          <button onClick={logout} className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-900/20">
            <span>🚪</span><span>Abmelden</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-brand-900 shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => setOpen(true)} className="text-white p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <PyramidLogo size={8} />
            <div className="text-center">
              <p className="font-bold text-white text-sm leading-tight">Schmeuser GmbH</p>
              <p className="text-[#c9a84c] font-medium" style={{ fontSize: '11px' }}>Security Services</p>
            </div>
          </div>
          <button onClick={handleBellClick} className="relative text-white p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {unread}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="relative w-72 bg-brand-900 flex flex-col shadow-2xl h-full">
            <div className="p-5 border-b border-brand-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <PyramidLogo />
                <div>
                  <p className="font-bold text-white text-sm leading-tight">Schmeuser GmbH</p>
                  <p className="text-[#c9a84c] font-medium" style={{ fontSize: '10px' }}>Security Services</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-brand-400 hover:text-white p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-0.5">
              {links.map(l => {
                const active = l.exact ? pathname === l.href : pathname.startsWith(l.href)
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={clsx('sidebar-link', active && 'active')}>
                    <span>{l.icon}</span>
                    <span className="flex-1">{l.label}</span>
                    {l.href === '/employee/notifications' && unread > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {unread}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>

            <div className="p-3 border-t border-brand-800">
              <div className="flex items-center gap-3 px-3 py-2 mb-1">
                <div className="w-8 h-8 bg-brand-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user.full_name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.full_name}</p>
                  <p className="text-xs text-brand-400">Mitarbeiter</p>
                </div>
              </div>
              <button onClick={logout} className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-900/20">
                <span>🚪</span><span>Abmelden</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}