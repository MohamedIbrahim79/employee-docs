import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { comparePassword, signToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'البريد وكلمة المرور مطلوبان' }, { status: 400 })

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('is_active', true)
      .single()

    if (error || !user) return NextResponse.json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, { status: 401 })

    const valid = await comparePassword(password, user.password_hash)
    if (!valid) return NextResponse.json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, { status: 401 })

    const token = signToken({ id: user.id, email: user.email, role: user.role, full_name: user.full_name })

    const cookieStore = cookies()
    cookieStore.set('auth_token', token, {
     httpOnly: false,
     secure: false,
     sameSite: 'lax',
     maxAge: 60 * 60 * 24 * 7,
     path: '/',
   })

    return NextResponse.json({ role: user.role, name: user.full_name })
  } catch (e) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
