import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from './supabase'

const JWT_SECRET = process.env.JWT_SECRET!

export type UserPayload = {
  id: string
  email: string
  role: 'admin' | 'employee'
  full_name: string
}

export function signToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload
  } catch {
    return null
  }
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function getSession(): Promise<UserPayload | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function requireAuth(role?: 'admin' | 'employee'): Promise<UserPayload> {
  const session = await getSession()
  if (!session) throw new Error('UNAUTHORIZED')
  if (role && session.role !== role && session.role !== 'admin') throw new Error('FORBIDDEN')
  return session
}

export async function getUserById(id: string) {
  const { data } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', id)
    .single()
  return data
}
