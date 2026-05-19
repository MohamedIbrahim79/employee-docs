import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { comparePassword, hashPassword, getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function POST(req: Request) {
  const token = getTokenFromRequest(req)
  const session = token ? verifyToken(token) : null
  if (!session) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  const { current_password, new_password, skip_current } = await req.json()

  if (!new_password)
    return NextResponse.json({ error: 'Alle Felder sind erforderlich' }, { status: 400 })

  if (new_password.length < 8)
    return NextResponse.json({ error: 'Passwort muss mindestens 8 Zeichen haben' }, { status: 400 })

  const { data: user } = await supabaseAdmin.from('users').select('password_hash').eq('id', session.id).single()
  if (!user) return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 })

  // لو مش في setup mode، تحقق من الباسورد الحالي
  if (!skip_current) {
    if (!current_password)
      return NextResponse.json({ error: 'Alle Felder sind erforderlich' }, { status: 400 })
    const valid = await comparePassword(current_password, user.password_hash)
    if (!valid) return NextResponse.json({ error: 'Aktuelles Passwort ist falsch' }, { status: 400 })
  }

  const hash = await hashPassword(new_password)
  await supabaseAdmin.from('users').update({ password_hash: hash }).eq('id', session.id)

  return NextResponse.json({ ok: true })
}