# VibeCV — Your Complete Deployment Guide
### Your 1% of work. Everything else is already done.

---

## What you're deploying

A subscription SaaS app that:
- Lets users paste their CV and get it roasted / rewritten by AI
- Offers 1 free roast, then $9/month for all vibes + unlimited
- Handles payments via Stripe
- Runs entirely on free/cheap tiers

**Monthly cost estimate:** ~$5–15 (Anthropic API usage-based, Vercel free tier, Stripe 2.9% per transaction)

---

## Step 1 — Get the code on GitHub (5 min)

1. Go to **github.com** → sign up or log in (free)
2. Click the **+** button → "New repository"
3. Name it `vibecv`, set to **Private**, click Create
4. On your computer, open a terminal in the project folder and run:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/vibecv.git
git push -u origin main
```

---

## Step 2 — Get your Anthropic API key (3 min)

1. Go to **console.anthropic.com** → sign up
2. Click **API Keys** in the left sidebar
3. Click **Create Key** → copy it somewhere safe
4. Add $10 of credit (Settings → Billing) — this powers ~2,000 roasts

---

## Step 3 — Set up Stripe (10 min)

1. Go to **stripe.com** → create account
2. In the dashboard, go to **Products** → **Add product**
   - Name: `VibeCV Pro`
   - Price: `$9.00` / month (recurring)
   - Click **Save product**
3. Copy the **Price ID** (starts with `price_...`)
4. Go to **Developers** → **API keys**
   - Copy your **Publishable key** (`pk_live_...`)
   - Copy your **Secret key** (`sk_live_...`)
5. Keep these — you'll need them in Step 5

**For webhooks (do this AFTER deploying to Vercel):**
- Go to **Developers** → **Webhooks** → **Add endpoint**
- URL: `https://YOUR-VERCEL-URL.vercel.app/api/webhook`
- Events to listen for:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
- Copy the **Signing secret** (`whsec_...`)

---

## Step 4 — Deploy to Vercel (5 min)

1. Go to **vercel.com** → sign up with GitHub
2. Click **Add New Project**
3. Import your `vibecv` repository
4. Click **Deploy** (it will fail — that's fine, we need env vars next)

---

## Step 5 — Add environment variables to Vercel (5 min)

In your Vercel project → **Settings** → **Environment Variables**, add these one by one:

| Variable | Value |
|---|---|
| `ANTHROPIC_API_KEY` | Your key from Step 2 |
| `STRIPE_SECRET_KEY` | `sk_live_...` from Step 3 |
| `STRIPE_PUBLISHABLE_KEY` | `pk_live_...` from Step 3 |
| `STRIPE_PRICE_ID` | `price_...` from Step 3 |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` from Step 3 webhooks |
| `JWT_SECRET` | Any random 40-character string (e.g. mash your keyboard) |
| `NEXT_PUBLIC_APP_URL` | `https://your-project-name.vercel.app` |

After adding all variables → go to **Deployments** → click **Redeploy**

---

## Step 6 — Add webhook URL to Stripe (2 min)

Now that your app is live:
1. Copy your Vercel URL (e.g. `https://vibecv-xyz.vercel.app`)
2. Go back to Stripe → **Developers** → **Webhooks** → **Add endpoint**
3. Paste: `https://vibecv-xyz.vercel.app/api/webhook`
4. Select all 4 events from Step 3
5. Save and copy the webhook signing secret → update `STRIPE_WEBHOOK_SECRET` in Vercel → Redeploy

---

## Step 7 — Test it (5 min)

1. Visit your live URL
2. Paste any CV text → click "🔥 Brutal Roast my CV"
3. It should return an AI-generated roast
4. Try signing up for an account
5. Test the Pro upgrade flow (use Stripe test card `4242 4242 4242 4242` in test mode first)

**To use test mode:** In Stripe, toggle "Test mode" on → get test keys → use those in Vercel env vars → test → then switch to live keys when ready

---

## Your custom domain (optional, ~$12/year)

1. Buy a domain at **namecheap.com** (e.g. `vibecv.app`)
2. In Vercel → **Settings** → **Domains** → add your domain
3. Follow Vercel's DNS instructions
4. Update `NEXT_PUBLIC_APP_URL` to your custom domain → Redeploy

---

## How to go viral on social media

**The core loop:** People get roasted → screenshot it → post it → their followers try it → repeat.

**Your job:**
1. Post YOUR OWN roast first. Be vulnerable and funny about it.
2. Caption: "I asked AI to roast my CV and I need a moment 💀 [screenshot] try yours: vibecv.app"
3. Post on: TikTok, Instagram Reels, X, LinkedIn (LinkedIn goes especially viral for CV content)
4. Reply to every comment in the first hour — this boosts the algorithm
5. DM 5–10 people in your network to try it and post their results

**Content ideas:**
- "Rating CVs in different vibes" (screen record the app)
- "POV: You let AI rewrite your CV as Gen Z"
- Duet/stitch other people's reactions
- "What recruiters ACTUALLY see vs what you think they see"

---

## How subscriptions work

- Users get **1 free roast** (Brutal Roast vibe only)
- After that, they're prompted to sign up for **$9/month**
- Subscribers get **all 6 vibes + unlimited roasts**
- Stripe handles all billing, renewals, and cancellations automatically
- When someone subscribes, Stripe sends a webhook → your app marks them as Pro

---

## Revenue projections

| Subscribers | Monthly Revenue |
|---|---|
| 10 | $90/mo |
| 50 | $450/mo |
| 100 | $900/mo |
| 500 | $4,500/mo |

**Break-even:** ~2 subscribers covers your API costs

---

## Troubleshooting

**"AI is temporarily unavailable"** → Check your Anthropic API key in Vercel env vars

**Stripe webhook not working** → Make sure the webhook URL is exactly `/api/webhook` and you've selected all 4 events

**Users not getting Pro after payment** → Check the webhook secret is correct in Vercel

**App not building** → Check Vercel build logs — usually a missing env var

---

## Support

If you get stuck on any step, the most common issues are:
- Wrong env variable names (copy-paste exactly as shown)
- Stripe webhook URL missing `/api/webhook` at the end  
- Forgetting to redeploy after changing env vars in Vercel

Total setup time: **~30 minutes**
