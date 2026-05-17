import { supabaseAdmin } from '@/lib/supabase'
import { differenceInDays } from 'date-fns'
import Link from 'next/link'
import SendAllButton from '@/components/SendAllButton'

async function getAlerts() {
  const { data } = await supabaseAdmin
    .from('documents')
    .select(`
      id, expiry_date, file_url,
      user:user_id(id, full_name, email, is_active),
      document_type:document_type_id(name_ar, name_de)
    `)
    .not('expiry_date', 'is', null)
    .not('file_url', 'is', null)
  const today = new Date(); today.setHours(0,0,0,0)
  return (data || [])
    .filter(d => (d.user as any)?.is_active)
    .map(d => ({ ...d, daysLeft: differenceInDays(new Date(d.expiry_date), today) }))
    .filter(d => d.daysLeft <= 30)
    .sort((a, b) => a.daysLeft - b.daysLeft)
}

export default async function AlertsPage() {
  const alerts = await getAlerts()
  const expired = alerts.filter(a => a.daysLeft < 0)
  const expiring = alerts.filter(a => a.daysLeft >= 0)

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="page-title">Benachrichtigungen</h1>
        <p className="text-gray-500 text-sm mt-1 mb-4">{alerts.length} Dokumente benötigen  Aufmerksamkeit</p>
        <SendAllButton />
      </div>

      {expired.length > 0 && (
        <div className="mb-6">
          <h2 className="section-title text-red-700 mb-3">Abgelaufen ({expired.length})</h2>
          <div className="card divide-y divide-gray-50">
            {expired.map(a => <AlertRow key={a.id} alert={a} />)}
          </div>
        </div>
      )}

      {expiring.length > 0 && (
        <div>
          <h2 className="section-title text-yellow-700 mb-3">Läuft in 30 Tagen ab ({expiring.length})</h2>
          <div className="card divide-y divide-gray-50">
            {expiring.map(a => <AlertRow key={a.id} alert={a} />)}
          </div>
        </div>
      )}

      {alerts.length === 0 && (
        <div className="card p-16 text-center text-gray-400">
          <p className="text-lg font-medium text-gray-600">Alle Dokumente sind gültig</p>
          <p className="text-sm mt-1">Keine Dokumente laufen in den nächsten 30 Tagen ab</p>
        </div>
      )}
    </div>
  )
}

function AlertRow({ alert }: { alert: any }) {
  const isExpired = alert.daysLeft < 0
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className={`w-2 h-2 rounded-full shrink-0 ${isExpired ? 'bg-red-500' : 'bg-yellow-400'}`} />
      <div className="w-8 h-8 bg-brand-800 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
        {(alert.user as any)?.full_name?.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm">{(alert.user as any)?.full_name}</p>
        <p className="text-xs text-gray-500">{(alert.document_type as any)?.name_de}</p>
        <p className="text-xs text-gray-400">Ablaufdatum: {new Date(alert.expiry_date).toLocaleDateString('de-DE')}</p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <Link href={`/admin/employees/${(alert.user as any)?.id}?tab=docs`} className="btn-secondary py-1.5 px-3 text-xs">
          Anzeigen
        </Link>
        <span className={`text-xs font-medium ${isExpired ? 'text-red-600' : 'text-yellow-700'}`}>
          {isExpired ? `Seit ${Math.abs(alert.daysLeft)} Tagen` : `Noch ${alert.daysLeft} Tage`}
        </span>
      </div>
    </div>
  )
}