import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'
import { differenceInDays } from 'date-fns'

async function getAllDocuments() {
  const { data } = await supabaseAdmin
    .from('documents')
    .select(`
      id, file_url, expiry_date, status, uploaded_at,
      user:user_id(id, full_name, email),
      document_type:document_type_id(name_ar, name_de, has_expiry)
    `)
    .order('uploaded_at', { ascending: false })
  return data || []
}

export default async function AdminDocuments() {
  const docs = await getAllDocuments()
  const today = new Date(); today.setHours(0,0,0,0)

  const pending = docs.filter(d => d.file_url && d.status === 'pending')
  const missing = docs.filter(d => !d.file_url)

  function getStatus(doc: any) {
    if (!doc.file_url) return { label: 'مفقودة', cls: 'badge-gray' }
    if (doc.status === 'rejected') return { label: 'مرفوضة', cls: 'badge-red' }
    if (doc.expiry_date) {
      const d = differenceInDays(new Date(doc.expiry_date), today)
      if (d < 0) return { label: 'منتهية', cls: 'badge-red' }
      if (d <= 30) return { label: 'تنتهي قريباً', cls: 'badge-yellow' }
    }
    if (doc.status === 'active') return { label: 'سارية', cls: 'badge-green' }
    return { label: 'بانتظار المراجعة', cls: 'badge-blue' }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="page-title">📄 الوثائق</h1>
        <p className="text-gray-500 text-sm mt-1">{docs.length} وثيقة إجمالاً · {pending.length} بانتظار المراجعة</p>
      </div>

      {pending.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <span className="text-blue-600 text-xl">📋</span>
          <div className="flex-1">
            <p className="font-medium text-blue-800">{pending.length} وثيقة بانتظار مراجعتك</p>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <p className="text-sm text-gray-500">جميع الوثائق</p>
        </div>
        <table className="w-full">
          <thead className="table-head">
            <tr>
              <th className="px-4 py-3 text-right font-semibold">الموظف</th>
              <th className="px-4 py-3 text-right font-semibold">الوثيقة</th>
              <th className="px-4 py-3 text-right font-semibold">الانتهاء</th>
              <th className="px-4 py-3 text-right font-semibold">الحالة</th>
              <th className="px-4 py-3 text-right font-semibold">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {docs.map(doc => {
              const status = getStatus(doc)
              return (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="table-cell">
                    <p className="font-medium text-gray-900">{doc.user?.full_name}</p>
                    <p className="text-xs text-gray-400">{doc.user?.email}</p>
                  </td>
                  <td className="table-cell">
                    <p className="text-gray-700">{doc.document_type?.name_ar}</p>
                    <p className="text-xs text-gray-400">{doc.document_type?.name_de}</p>
                  </td>
                  <td className="table-cell text-gray-600">
                    {doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString('de-DE') : '—'}
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${status.cls}`}>{status.label}</span>
                  </td>
                  <td className="table-cell">
                    <Link href={`/admin/employees/${doc.user?.id}`} className="text-xs text-brand-700 hover:underline">
                      عرض الملف
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
