// pages/api/subscribe.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { getSessionUser } from '@/lib/auth'
import { getUserById } from '@/lib/store'
import { NextRequest } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10',
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const session = await getSessionUser(req as unknown as NextRequest)
  if (!session) return res.status(401).json({ error: 'Please log in first.' })

  const user = getUserById(session.userId)
  if (!user) return res.status(401).json({ error: 'User not found.' })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    // Create or retrieve Stripe customer
    let customerId = user.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      })
      customerId = customer.id
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${appUrl}/?subscribed=1`,
      cancel_url: `${appUrl}/`,
      metadata: { userId: user.id },
    })

    return res.status(200).json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Stripe error:', error)
    return res.status(500).json({ error: 'Payment setup failed. Please try again.' })
  }
}
