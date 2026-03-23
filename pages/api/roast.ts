// pages/api/roast.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import Anthropic from '@anthropic-ai/sdk'
import { getSessionUser } from '@/lib/auth'
import { getUserById, updateUser } from '@/lib/store'
import { NextRequest } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const FREE_LIMIT = parseInt(process.env.FREE_ROAST_LIMIT || '1')

const VIBE_PROMPTS: Record<string, string> = {
  roast: `You are the world's most brutally honest (but secretly kind-hearted) CV critic. Your job is to ROAST this CV with sharp, specific wit. Point out every cliché ("passionate", "results-driven", "synergy"), vague claim, and overinflated job title. Be specific — quote their actual words back at them with commentary. End with ONE genuine piece of advice. Keep it punchy and funny. Max 400 words.`,

  corporate: `You are a McKinsey consultant who rewrites CVs to sound like billion-dollar executive profiles. Transform this CV into polished, corporate-speak brilliance. Use power verbs, quantify everything (make up plausible percentages if needed), add "strategic" and "cross-functional" liberally. Make them sound like they single-handedly saved every company they've touched. Max 400 words.`,

  genz: `You are a Gen Z recruiter who communicates entirely in current internet speak. Rewrite this CV in the most chaotic, unhinged Gen Z way possible. Use "no cap", "lowkey", "bestie", "slay", "it's giving", "understood the assignment", "main character energy", etc. Keep the actual facts but make it sound like a TikTok. Max 400 words.`,

  luxury: `You are a headhunter for Hermès, LVMH and private family offices. Rewrite this CV as if it were a rare, limited-edition item — understated, refined, exclusive. Avoid saying too much. Imply excellence. Use sparse, precise language. Make the reader feel privileged to read it. Max 400 words.`,

  honest: `You are a brutally honest but genuinely helpful career coach. Give an honest, fair assessment of this CV: what's working, what's not, what's missing, and what concrete changes would make the biggest difference. No fluff, no cruelty — just the truth most recruiters won't say. Max 400 words.`,

  hype: `You are the world's most enthusiastic hype person. This CV is the GREATEST THING YOU HAVE EVER READ. React to it like they're announcing it at Madison Square Garden. Point out every single thing as if it's earth-shattering. Use caps, exclamation marks, and pure unbridled enthusiasm. Make them feel like a legend. Max 400 words.`,
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { cv, vibe } = req.body

  if (!cv || typeof cv !== 'string' || cv.trim().length < 10) {
    return res.status(400).json({ error: 'Please paste your CV first.' })
  }

  if (!VIBE_PROMPTS[vibe]) {
    return res.status(400).json({ error: 'Invalid vibe selected.' })
  }

  // Check auth / limits
  const session = await getSessionUser(req as unknown as NextRequest)
  let dbUser = session ? getUserById(session.userId) : null

  const isSubscriber = dbUser?.isSubscriber || false
  const roastsUsed = dbUser?.roastsUsed || 0

  // Non-subscribers can only use 'roast' vibe
  if (!isSubscriber && vibe !== 'roast') {
    return res.status(403).json({ error: 'Pro vibe — upgrade to unlock.', code: 'LIMIT_REACHED' })
  }

  // Free limit check (only for non-subscribers without account, or free accounts)
  if (!isSubscriber) {
    if (!dbUser && roastsUsed >= FREE_LIMIT) {
      return res.status(403).json({ error: 'Free limit reached.', code: 'LIMIT_REACHED' })
    }
    if (dbUser && roastsUsed >= FREE_LIMIT) {
      return res.status(403).json({ error: 'Free limit reached. Go Pro!', code: 'LIMIT_REACHED' })
    }
  }

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `${VIBE_PROMPTS[vibe]}\n\nHere is the CV to work with:\n\n${cv.slice(0, 3000)}`,
        },
      ],
    })

    const result = message.content[0].type === 'text' ? message.content[0].text : ''

    // Update usage count
    if (dbUser) {
      dbUser = updateUser(dbUser.id, { roastsUsed: (dbUser.roastsUsed || 0) + 1 })
    }

    return res.status(200).json({
      result,
      user: dbUser ? {
        email: dbUser.email,
        isSubscriber: dbUser.isSubscriber,
        roastsUsed: dbUser.roastsUsed,
      } : null,
    })
  } catch (error) {
    console.error('Anthropic error:', error)
    return res.status(500).json({ error: 'AI is temporarily unavailable. Try again in a moment.' })
  }
}
