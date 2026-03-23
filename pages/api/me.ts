// pages/api/me.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSessionUser } from '@/lib/auth'
import { getUserById } from '@/lib/store'
import { NextRequest } from 'next/server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSessionUser(req as unknown as NextRequest)
  if (!session) return res.status(200).json({ user: null })

  const user = getUserById(session.userId)
  if (!user) return res.status(200).json({ user: null })

  return res.status(200).json({
    user: {
      email: user.email,
      isSubscriber: user.isSubscriber,
      roastsUsed: user.roastsUsed,
    }
  })
}
