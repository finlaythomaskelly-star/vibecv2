// pages/api/webhook.ts
// This receives events from Stripe when someone subscribes, cancels, etc.

import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { getUserById, updateUser, getUsers, saveUsers } from '@/lib/store'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10',
})

export const config = {
  api: { bodyParser: false },
}

async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const rawBody = await getRawBody(req)
  const sig = req.headers['stripe-signature'] as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err) {
    console.error('Webhook signature error:', err)
    return res.status(400).json({ error: 'Webhook signature verification failed.' })
  }

  const getUserByStripeId = (customerId: string) => {
    return getUsers().find(u => u.stripeCustomerId === customerId)
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      if (userId) {
        updateUser(userId, {
          isSubscriber: true,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
        })
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const user = getUserByStripeId(sub.customer as string)
      if (user) {
        const active = sub.status === 'active' || sub.status === 'trialing'
        updateUser(user.id, { isSubscriber: active })
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const user = getUserByStripeId(sub.customer as string)
      if (user) {
        updateUser(user.id, { isSubscriber: false, stripeSubscriptionId: undefined })
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const user = getUserByStripeId(invoice.customer as string)
      if (user) {
        updateUser(user.id, { isSubscriber: false })
      }
      break
    }
  }

  return res.status(200).json({ received: true })
}
