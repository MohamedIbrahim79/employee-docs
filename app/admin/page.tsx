import { supabaseAdmin } from '@/lib/supabase'
import { differenceInDays } from 'date-fns'
import Link from 'next/link'

async function getDashboardData() {
  const [{ data: employees }, { data: documents }] = await Promise.all([
    supabaseAdmin.from('users').select('id, full_name, is_active').eq('role', 'employee'),
    supabaseAdmin.from('documents').select(`
      id, expiry_date, status, file_url,
      user:user_id(id, full_name, email, is_active),
      document_type:document_type_id(name_ar, name_de)
    `).not('user_id', 'is', null),
  ])

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const activeEmployees = employees?.filter(e => e.is_active) || []

  const alerts = (documents || [])
    .filter(d => d.file_url && d.expiry_date && (d.user as any)?.is_active)
    .map(d => ({ ...d, daysLeft: differenceInDays(new Date(d.expiry_date), today) }))
    .filter(d => d.daysLeft <= 30)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 10)

  const uploaded = (documents || []).filter(d => d.file_url).length
  const expired = alerts.filter(a => a.daysLeft < 0).length
  const expiringSoon = alerts.filter(a => a.daysLeft >= 0).length

  return { activeEmployees, alerts, uploaded, total: documents?.length || 0, expired, expiringSoon }
}

export default async function AdminDashboard() {
  const { activeEmployees, alerts, uploaded, total, expired, expiringSoon } = await getDashboardData()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="page-title">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Übersicht über den Status der Mitarbeiterdokumente</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Mitarbeiter gesamt', value: activeEmployees.length, icon: '👥', color: 'text-brand-700' },
          { label: 'Dokumente hochgeladen', value: `${uploaded}/${total}`, icon: '📄', color: 'text-green-700' },
          { label: 'Läuft in 30 Tagen ab', value: expiringSoon, icon: '⏰', color: 'text-yellow-700' },
          { label: 'Abgelaufen', value: expired, icon: '🚨', color: 'text-red-700' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className={`text-3xl font-bold ${s.color} mb-1`}>{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="section-title">🔔 Dringende Benachrichtigungen</h2>
          <Link href="/admin/alerts" className="text-sm text-brand-700 hover:text-brand-900">Alle anzeigen →</Link>
        </div>
        {alerts.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <div className="text-4xl mb-3">✅</div>
            <p>Keine ablaufenden Dokumente</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {alerts.map(alert => {
              const isExpired = alert.daysLeft < 0
              return (
                <div key={alert.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${isExpired ? 'bg-red-500' : 'bg-yellow-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{(alert.user as any)?.full_name}</p>
                    <p className="text-xs text-gray-500">{(alert.document_type as any)?.name_de} — Läuft ab: {new Date(alert.expiry_date).toLocaleDateString('de-DE')}</p>
                  </div>
                  <span className={`badge ${isExpired ? 'badge-red' : 'badge-yellow'}`}>
                    {isExpired ? `Abgelaufen seit ${Math.abs(alert.daysLeft)} Tagen` : `Noch ${alert.daysLeft} Tage`}
                  </span>
                  <Link href={`/admin/employees/${(alert.user as any)?.id}`} className="text-xs text-brand-700 hover:underline">Anzeigen</Link>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="card mt-5">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="section-title">👥 Mitarbeiter</h2>
          <Link href="/admin/employees" className="text-sm text-brand-700 hover:text-brand-900">Alle verwalten →</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {activeEmployees.slice(0, 5).map(emp => (
            <div key={emp.id} className="flex items-center gap-4 px-5 py-3.5">
              <div className="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center text-brand-800 font-bold text-sm shrink-0">
                {emp.full_name.charAt(0)}
              </div>
              <p className="text-sm font-medium text-gray-900 flex-1">{emp.full_name}</p>
              <Link href={`/admin/employees/${emp.id}`} className="btn-secondary text-xs py-1.5 px-3">Dokumente anzeigen</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}