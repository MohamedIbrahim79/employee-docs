import { NextResponse } from 'next/server'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function GET(req: Request) {
  const token = getTokenFromRequest(req)
  if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const user = verifyToken(token)
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  return NextResponse.json(user)
}