// pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import { serialize } from 'cookie'
import { getUserByEmail } from '@/lib/store'
import { signToken } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, password } = req.body

  if (!email || !password) return res.status(400).json({ error: 'Email and password required.' })

  const user = getUserByEmail(email)
  if (!user) return res.status(400).json({ error: 'No account found with that email.' })

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return res.status(400).json({ error: 'Incorrect password.' })

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
