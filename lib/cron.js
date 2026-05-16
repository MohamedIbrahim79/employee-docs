// lib/cron.js
// شغّله يومياً عن طريق: node lib/cron.js
// أو ارفعه على Vercel Cron / GitHub Actions

const { createClient } = require('@supabase/supabase-js')
const { Resend } = require('resend')
const { differenceInDays } = require('date-fns')

require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.FROM_EMAIL
const COMPANY = process.env.COMPANY_NAME
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL

async function runNotifications() {
  console.log('🔔 Running daily notification check...')
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // جلب كل الوثائق اللي ليها تاريخ انتهاء
  const { data: documents, error } = await supabase
    .from('documents')
    .select(`
      id, expiry_date, status,
      user:user_id(id, email, full_name, is_active),
      document_type:document_type_id(name_ar, name_de)
    `)
    .not('expiry_date', 'is', null)
    .eq('user.is_active', true)

  if (error) { console.error('DB error:', error); return }

  let sent = 0
  for (const doc of documents || []) {
    if (!doc.user || !doc.expiry_date) continue
    const expiry = new Date(doc.expiry_date)
    const daysLeft = differenceInDays(expiry, today)

    // بنبعت: قبل 30 يوم، قبل 7 أيام، في يوم الانتهاء، وكل 7 أيام بعده
    const shouldNotify = daysLeft === 30 || daysLeft === 7 || daysLeft === 0 || (daysLeft < 0 && daysLeft % 7 === 0)
    if (!shouldNotify) continue

    // تحقق مما لو بعتنا إشعار النهارده
    const { data: existing } = await supabase
      .from('notifications')
      .select('id')
      .eq('document_id', doc.id)
      .gte('sent_at', new Date().toISOString().split('T')[0])
      .limit(1)

    if (existing?.length) continue

    try {
      const isExpired = daysLeft < 0
      const subject = isExpired
        ? `🚨 انتهت صلاحية وثيقة: ${doc.document_type.name_ar}`
        : `⚠️ وثيقة تنتهي قريباً: ${doc.document_type.name_ar}`

      const html = buildEmail(doc.user.full_name, doc.document_type.name_ar, doc.document_type.name_de, doc.expiry_date, daysLeft)

      await resend.emails.send({ from: FROM, to: doc.user.email, subject, html })

      await supabase.from('notifications').insert({
        user_id: doc.user.id,
        document_id: doc.id,
        type: daysLeft < 0 ? 'expiry_overdue' : daysLeft === 0 ? 'expiry_today' : 'expiry_30days',
        email_sent: true,
      })

      console.log(`✅ Sent to ${doc.user.email} for ${doc.document_type.name_ar} (${daysLeft} days)`)
      sent++
    } catch (e) {
      console.error(`❌ Failed for ${doc.user.email}:`, e.message)
    }
  }

  console.log(`✅ Done. Sent ${sent} notifications.`)
}

function buildEmail(name, nameAr, nameDe, expiry, daysLeft) {
  const isExpired = daysLeft < 0
  return `<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8"></head><body style="font-family:Arial;background:#f5f5f5;padding:20px;direction:rtl">
  <div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden">
    <div style="background:#3b3aa8;color:white;padding:24px 32px"><h2 style="margin:0">${COMPANY}</h2></div>
    <div style="padding:32px">
      <p>عزيزي <strong>${name}</strong>،</p>
      <p>وثيقة <strong>${nameAr} / ${nameDe}</strong> ${isExpired ? `انتهت منذ ${Math.abs(daysLeft)} يوم` : `ستنتهي خلال ${daysLeft} يوم`}.</p>
      <p>تاريخ الانتهاء: <strong>${new Date(expiry).toLocaleDateString('de-DE')}</strong></p>
      <a href="${SITE_URL}/employee" style="background:#3b3aa8;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px">رفع الوثيقة الجديدة</a>
    </div>
  </div></body></html>`
}

runNotifications().catch(console.error)
