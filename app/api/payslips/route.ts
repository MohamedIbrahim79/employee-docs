import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import nodemailer from 'nodemailer'

const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
]

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function GET(req: Request) {
  const token = getTokenFromRequest(req)
  const session = token ? verifyToken(token) : null
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('user_id') || session.id

  if (session.role === 'employee' && userId !== session.id)
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })

  const { data, error } = await supabaseAdmin
    .from('payslips')
    .select('*')
    .eq('user_id', userId)
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const token = getTokenFromRequest(req)
  const session = token ? verifyToken(token) : null
  if (!session || !['admin', 'hr', 'owner'].includes(session.role))
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const userId = formData.get('user_id') as string
    const month = parseInt(formData.get('month') as string)
    const year = parseInt(formData.get('year') as string)

    if (!file || !userId || !month || !year)
      return NextResponse.json({ error: 'Fehlende Felder' }, { status: 400 })

    const ext = file.name.split('.').pop()
    const path = `payslips/${userId}/${year}-${month}.${ext}`
    const buffer = await file.arrayBuffer()

    const { error: uploadError } = await supabaseAdmin.storage
      .from('documents')
      .upload(path, buffer, { contentType: file.type, upsert: true })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabaseAdmin.storage.from('documents').getPublicUrl(path)

    const { data, error } = await supabaseAdmin
      .from('payslips')
      .upsert({
        user_id: userId,
        month,
        year,
        file_url: publicUrl,
        file_name: file.name,
      }, { onConflict: 'user_id,month,year' })
      .select()
      .single()

    if (error) throw error

    // جيب بيانات الموظف
    const { data: employee } = await supabaseAdmin
      .from('users')
      .select('email, full_name')
      .eq('id', userId)
      .single()

    // إشعار داخلي
    await supabaseAdmin.from('in_app_notifications').insert({
      user_id: userId,
      title: 'Neue Lohnabrechnung verfügbar',
      message: `Ihre Lohnabrechnung für ${MONTHS[month - 1]} ${year} ist jetzt verfügbar`,
      metadata: { payslip_id: data.id }
    })

    // إيميل للموظف
    if (employee?.email) {
      try {
        await transporter.sendMail({
          from: `"Schmeuser GmbH" <${process.env.GMAIL_USER}>`,
          to: employee.email,
          subject: `Ihre Lohnabrechnung für ${MONTHS[month - 1]} ${year}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #1a2744; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: #c9a84c; margin: 0; font-size: 24px;">Schmeuser GmbH</h1>
                <p style="color: white; margin: 5px 0 0;">Security Services</p>
              </div>
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
                <p style="color: #333;">Sehr geehrte/r ${employee.full_name},</p>
                <p style="color: #333;">Ihre Lohnabrechnung für <strong>${MONTHS[month - 1]} ${year}</strong> ist jetzt verfügbar.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${publicUrl}" 
                     style="background: #1a2744; color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                    Lohnabrechnung herunterladen
                  </a>
                </div>
                <p style="color: #333;">Sie können Ihre Lohnabrechnung auch jederzeit in Ihrem persönlichen Portal einsehen:</p>
                <div style="text-align: center; margin: 15px 0;">
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL}/employee/payslips"
                     style="color: #1a2744; text-decoration: underline;">
                    Zum Mitarbeiterportal
                  </a>
                </div>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px; text-align: center;">
                  Schmeuser GmbH — Security Services
                </p>
              </div>
            </div>
          `
        })
      } catch (emailError) {
        console.error('Email error:', emailError)
      }
    }

    return NextResponse.json(data, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Serverfehler' }, { status: 500 })
  }
}