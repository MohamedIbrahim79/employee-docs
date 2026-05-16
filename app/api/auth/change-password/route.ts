import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { comparePassword, hashPassword, getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function POST(req: Request) {
  const token = getTokenFromRequest(req)
  const session = token ? verifyToken(token) : null
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { current_password, new_password } = await req.json()
  if (!current_password || !new_password) return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 })
  if (new_password.length < 8) return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }, { status: 400 })

  const { data: user } = await supabaseAdmin.from('users').select('password_hash').eq('id', session.id).single()
  if (!user) return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })

  const valid = await comparePassword(current_password, user.password_hash)
  if (!valid) return NextResponse.json({ error: 'كلمة المرور الحالية غير صحيحة' }, { status: 400 })

  const hash = await hashPassword(new_password)
  await supabaseAdmin.from('users').update({ password_hash: hash }).eq('id', session.id)

  return NextResponse.json({ ok: true })
}