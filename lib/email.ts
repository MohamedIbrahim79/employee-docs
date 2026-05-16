import nodemailer from 'nodemailer'

const COMPANY = process.env.COMPANY_NAME || 'شركتنا'
const SITE_URL = 'https://employee-docs.vercel.app'

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

function emailTemplate(title: string, body: string): string {
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar"><head><meta charset="UTF-8">
<style>
  body{font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px;direction:rtl}
  .c{max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1)}
  .h{background:#3b3aa8;color:white;padding:24px 32px}.h h1{margin:0;font-size:20px}.h p{margin:4px 0 0;opacity:.8;font-size:13px}
  .b{padding:32px;color:#333}.b p{line-height:1.8;margin:0 0 14px}
  .box{background:#f8f8ff;border:1px solid #e0e0ff;border-radius:8px;padding:18px;margin:16px 0}
  .lbl{font-size:11px;color:#888;margin-bottom:3px}.val{font-size:15px;font-weight:bold;color:#3b3aa8}
  .badge{display:inline-block;padding:5px 14px;border-radius:20px;font-size:12px;font-weight:bold}
  .red{background:#fee2e2;color:#991b1b}.orange{background:#fef3c7;color:#92400e}.green{background:#dcfce7;color:#166534}
  .cta{background:#3b3aa8;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin:14px 0;font-size:14px}
  .f{background:#f9f9f9;padding:16px 32px;text-align:center;font-size:11px;color:#999;border-top:1px solid #eee}
</style></head>
<body><div class="c">
  <div class="h"><h1>🏢 ${COMPANY}</h1><p>نظام إدارة وثائق الموظفين</p></div>
  <div class="b"><h2 style="margin-top:0;color:#1e1d6b">${title}</h2>${body}
    <a href="${SITE_URL}/employee" class="cta">تسجيل الدخول ورفع الوثيقة</a>
  </div>
  <div class="f">${COMPANY} · نظام إدارة الوثائق<br>هذه رسالة تلقائية، لا ترد عليها.</div>
</div></body></html>`
}

async function send(to: string, subject: string, html: string) {
  const t = getTransporter()
  await t.sendMail({ from: `"${COMPANY}" <${process.env.GMAIL_USER}>`, to, subject, html })
}

export async function sendExpiryWarning(
  email: string, employeeName: string,
  docNameAr: string, docNameDe: string,
  expiryDate: string, daysLeft: number
) {
  const isExpired = daysLeft < 0
  const subject = isExpired ? `🚨 انتهت صلاحية: ${docNameAr}` : `⚠️ وثيقة تنتهي قريباً: ${docNameAr}`
  const body = `
    <p>عزيزي/عزيزتي <strong>${employeeName}</strong>،</p>
    <p>${isExpired ? 'وثيقتك التالية <strong>انتهت صلاحيتها</strong>:' : 'وثيقتك التالية ستنتهي قريباً:'}</p>
    <div class="box">
      <div class="lbl">الوثيقة</div><div class="val">${docNameAr} / ${docNameDe}</div>
      <br><div class="lbl">تاريخ الانتهاء</div><div class="val">${new Date(expiryDate).toLocaleDateString('de-DE')}</div>
      <br><span class="badge ${isExpired ? 'red' : 'orange'}">${isExpired ? `انتهت منذ ${Math.abs(daysLeft)} يوم` : `تبقى ${daysLeft} يوم`}</span>
    </div>`
  await send(email, subject, emailTemplate(subject, body))
}

export async function sendDocumentUploaded(adminEmail: string, employeeName: string, docNameAr: string) {
  const body = `<p>قام <strong>${employeeName}</strong> برفع وثيقة <strong>${docNameAr}</strong> وتحتاج مراجعتك.</p>
    <a href="${SITE_URL}/admin" class="cta">الذهاب للوحة التحكم</a>`
  await send(adminEmail, `📄 وثيقة جديدة: ${employeeName}`, emailTemplate('وثيقة جديدة مرفوعة', body))
}

export async function sendDocumentStatus(
  email: string, employeeName: string, docNameAr: string, approved: boolean, notes?: string
) {
  const subject = approved ? `✅ تم قبول: ${docNameAr}` : `❌ تم رفض: ${docNameAr}`
  const body = `
    <p>عزيزي/عزيزتي <strong>${employeeName}</strong>، بخصوص <strong>${docNameAr}</strong>:</p>
    <div class="box">
      <span class="badge ${approved ? 'green' : 'red'}">${approved ? '✅ مقبولة' : '❌ مرفوضة'}</span>
      ${notes ? `<br><br><div class="lbl">ملاحظات</div><div>${notes}</div>` : ''}
    </div>`
  await send(email, subject, emailTemplate(subject, body))
}

export async function sendWelcomeEmail(email: string, employeeName: string, password: string) {
  const body = `
    <p>أهلاً <strong>${employeeName}</strong>! تم إنشاء حسابك في نظام وثائق ${COMPANY}.</p>
    <div class="box">
      <div class="lbl">البريد الإلكتروني</div><div class="val">${email}</div>
      <br><div class="lbl">كلمة المرور المؤقتة</div>
      <div style="font-family:monospace;font-size:20px;font-weight:bold;color:#3b3aa8;letter-spacing:3px;margin-top:4px">${password}</div>
    </div>
    <p style="color:#991b1b;font-size:13px">⚠️ يرجى تغيير كلمة المرور بعد تسجيل الدخول الأول.</p>`
  await send(email, `مرحباً ${employeeName} - بيانات الدخول`, emailTemplate('مرحباً بك!', body))
}
