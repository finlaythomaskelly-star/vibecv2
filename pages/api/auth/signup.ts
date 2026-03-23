// pages/api/auth/signup.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import { serialize } from 'cookie'
import { getUserByEmail, createUser } from '@/lib/store'
import { signToken } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, password } = req.body

  if (!email || !password) return res.status(400).json({ error: 'Email and password required.' })
  if (typeof email !== 'string' || !email.includes('@')) return res.status(400).json({ error: 'Invalid email.' })
  if (typeof password !== 'string' || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' })

  const existing = getUserByEmail(email)
  if (existing) return res.status(400).json({ error: 'An account with this email already exists.' })

  const passwordHash = await bcrypt.hash(password, 10)
  const user = createUser({ email: email.toLowerCase(), passwordHash })

  const token = await signToken({ userId: user.id, email: user.email })

  res.setHeader('Set-Cookie', serialize('vibecv_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  }))

  return res.status(200).json({
    user: {
      email: user.email,
      isSubscriber: user.isSubscriber,
      roastsUsed: user.roastsUsed,
    }
  })
}
