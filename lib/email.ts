import nodemailer from 'nodemailer'

const COMPANY = process.env.COMPANY_NAME || 'Schmeuser GmbH'
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
<html dir="ltr" lang="de"><head><meta charset="UTF-8">
<style>
  body{font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px;direction:ltr}
  .c{max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1)}
  .h{background:#1a2744;color:white;padding:24px 32px}.h h1{margin:0;font-size:20px}.h p{margin:4px 0 0;opacity:.8;font-size:13px}
  .b{padding:32px;color:#333}.b p{line-height:1.8;margin:0 0 14px}
  .box{background:#f8f9ff;border:1px solid #e0e4ff;border-radius:8px;padding:18px;margin:16px 0}
  .lbl{font-size:11px;color:#888;margin-bottom:3px}.val{font-size:15px;font-weight:bold;color:#1a2744}
  .badge{display:inline-block;padding:5px 14px;border-radius:20px;font-size:12px;font-weight:bold}
  .red{background:#fee2e2;color:#991b1b}.orange{background:#fef3c7;color:#92400e}.green{background:#dcfce7;color:#166534}
  .cta{background:#1a2744;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin:14px 0;font-size:14px}
  .f{background:#f9f9f9;padding:16px 32px;text-align:center;font-size:11px;color:#999;border-top:1px solid #eee}
</style></head>
<body><div class="c">
  <div class="h"><h1>🏢 ${COMPANY}</h1><p>Mitarbeiter-Dokumentenverwaltung</p></div>
  <div class="b"><h2 style="margin-top:0;color:#1a2744">${title}</h2>${body}
    <a href="${SITE_URL}/employee" class="cta">Anmelden und Dokument hochladen</a>
  </div>
  <div class="f">${COMPANY} · Dokumentenverwaltung<br>Dies ist eine automatische Nachricht, bitte nicht antworten.</div>
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
  const subject = isExpired
    ? `🚨 Dokument abgelaufen: ${docNameDe}`
    : `⚠️ Dokument läuft bald ab: ${docNameDe}`
  const body = `
    <p>Sehr geehrte/r <strong>${employeeName}</strong>,</p>
    <p>${isExpired ? 'Ihr folgendes Dokument ist <strong>abgelaufen</strong>:' : 'Ihr folgendes Dokument läuft bald ab:'}</p>
    <div class="box">
      <div class="lbl">Dokument</div><div class="val">${docNameDe}</div>
      <br><div class="lbl">Ablaufdatum</div><div class="val">${new Date(expiryDate).toLocaleDateString('de-DE')}</div>
      <br><span class="badge ${isExpired ? 'red' : 'orange'}">${isExpired ? `Abgelaufen seit ${Math.abs(daysLeft)} Tagen` : `Noch ${daysLeft} Tage`}</span>
    </div>`
  await send(email, subject, emailTemplate(subject, body))
}

export async function sendDocumentUploaded(adminEmail: string, employeeName: string, docNameAr: string) {
  const body = `
    <p><strong>${employeeName}</strong> hat ein neues Dokument hochgeladen und wartet auf Ihre Überprüfung.</p>
    <a href="${SITE_URL}/admin" class="cta">Zur Verwaltung</a>`
  await send(adminEmail, `📄 Neues Dokument: ${employeeName}`, emailTemplate('Neues Dokument hochgeladen', body))
}

export async function sendDocumentStatus(
  email: string, employeeName: string, docNameAr: string, approved: boolean, notes?: string
) {
  const docName = docNameAr
  const subject = approved
    ? `✅ Dokument genehmigt: ${docName}`
    : `❌ Dokument abgelehnt: ${docName}`
  const body = `
    <p>Sehr geehrte/r <strong>${employeeName}</strong>, bezüglich Ihres Dokuments <strong>${docName}</strong>:</p>
    <div class="box">
      <span class="badge ${approved ? 'green' : 'red'}">${approved ? '✅ Genehmigt' : '❌ Abgelehnt'}</span>
      ${notes ? `<br><br><div class="lbl">Anmerkungen</div><div>${notes}</div>` : ''}
    </div>`
  await send(email, subject, emailTemplate(subject, body))
}

export async function sendWelcomeEmail(email: string, employeeName: string, password: string) {
  const body = `
    <p>Willkommen, <strong>${employeeName}</strong>! Ihr Konto im Dokumentenverwaltungssystem von ${COMPANY} wurde erstellt.</p>
    <div class="box">
      <div class="lbl">E-Mail-Adresse</div><div class="val">${email}</div>
      <br><div class="lbl">Temporäres Passwort</div>
      <div style="font-family:monospace;font-size:20px;font-weight:bold;color:#1a2744;letter-spacing:3px;margin-top:4px">${password}</div>
    </div>
    <p style="color:#991b1b;font-size:13px">⚠️ Bitte ändern Sie Ihr Passwort nach der ersten Anmeldung.</p>`
  await send(email, `Willkommen ${employeeName} - Ihre Zugangsdaten`, emailTemplate('Willkommen!', body))
}