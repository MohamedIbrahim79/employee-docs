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
    .filter(d => d.user?.is_active)
    .map(d => ({ ...d, daysLeft: differenceInDays(new Date(d.expiry_date), today) }))
    .filter(d => d.daysLeft <= 30)
    .sort((a, b) => a.daysLeft - b.daysLeft)
}

export default async function AlertsPage() {
  const alerts = await getAlerts()
  const expired = alerts.filter(a => a.daysLeft < 0)
  const expiring = alerts.filter(a => a.daysLeft >= 0)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">🔔 التنبيهات</h1>
          <p className="text-gray-500 text-sm mt-1">{alerts.length} وثيقة تحتاج انتباه</p>
        </div>
        <SendAllButton />
      </div>

      {expired.length > 0 && (
        <div className="mb-6">
          <h2 className="section-title text-red-700 mb-3">🚨 منتهية الصلاحية ({expired.length})</h2>
          <div className="card divide-y divide-gray-50">
            {expired.map(a => <AlertRow key={a.id} alert={a} />)}
          </div>
        </div>
      )}

      {expiring.length > 0 && (
        <div>
          <h2 className="section-title text-yellow-700 mb-3">⏰ تنتهي خلال 30 يوم ({expiring.length})</h2>
          <div className="card divide-y divide-gray-50">
            {expiring.map(a => <AlertRow key={a.id} alert={a} />)}
          </div>
        </div>
      )}

      {alerts.length === 0 && (
        <div className="card p-16 text-center text-gray-400">
          <div className="text-5xl mb-4">✅</div>
          <p className="text-lg font-medium text-gray-600">كل الوثائق سارية</p>
          <p className="text-sm mt-1">لا توجد وثائق تنتهي خلال الـ 30 يوم القادمة</p>
        </div>
      )}
    </div>
  )
}

function AlertRow({ alert }: { alert: any }) {
  const isExpired = alert.daysLeft < 0
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${isExpired ? 'bg-red-500' : 'bg-yellow-400'}`} />
      <div className="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center text-brand-800 font-bold text-sm shrink-0">
        {alert.user?.full_name?.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900">{alert.user?.full_name}</p>
        <p className="text-sm text-gray-500">{alert.document_type?.name_ar} / {alert.document_type?.name_de}</p>
        <p className="text-xs text-gray-400">تاريخ الانتهاء: {new Date(alert.expiry_date).toLocaleDateString('de-DE')}</p>
      </div>
      <span className={`badge ${isExpired ? 'badge-red' : 'badge-yellow'}`}>
        {isExpired ? `منتهية منذ ${Math.abs(alert.daysLeft)} يوم` : `${alert.daysLeft} يوم متبقي`}
      </span>
      <Link href={`/admin/employees/${alert.user?.id}`} className="btn-secondary py-1.5 px-3 text-xs">عرض الملف</Link>
    </div>
  )
}
