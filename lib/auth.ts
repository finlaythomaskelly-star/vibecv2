// lib/auth.ts
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-change-in-production-please'
)

export async function signToken(payload: { userId: string; email: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(SECRET)
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as { userId: string; email: string }
  } catch {
    return null
  }
}

export async function getSessionUser(req?: NextRequest) {
  let token: string | undefined

  if (req) {
    token = req.cookies.get('vibecv_session')?.value
  } else {
    const cookieStore = cookies()
    token = cookieStore.get('vibecv_session')?.value
  }

  if (!token) return null
  return verifyToken(token)
}
