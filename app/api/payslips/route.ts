import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

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
    return NextResponse.json(data, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Serverfehler' }, { status: 500 })
  }
}