import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { comparePassword, signToken } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'E-Mail und Passwort sind erforderlich' }, { status: 400 })

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('is_active', true)
      .single()

    if (error || !user) return NextResponse.json({ error: 'E-Mail oder Passwort ist falsch' }, { status: 401 })

    const valid = await comparePassword(password, user.password_hash)
    if (!valid) return NextResponse.json({ error: 'E-Mail oder Passwort ist falsch' }, { status: 401 })

    const token = signToken({ id: user.id, email: user.email, role: user.role, full_name: user.full_name })

    const response = NextResponse.json({ token, role: user.role, name: user.full_name })

    response.cookies.set('auth_token', token, {
      httpOnly: false,
      secure: true,
      sameSite: 'none',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (e) {
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}