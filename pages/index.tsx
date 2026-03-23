// pages/index.tsx
import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import styles from './index.module.css'

const VIBES = [
  { id: 'roast', emoji: '🔥', label: 'Brutal Roast', desc: 'Get destroyed (lovingly)', free: true },
  { id: 'corporate', emoji: '🏢', label: 'Corporate Polish', desc: 'McKinsey-ready rewrite', free: false },
  { id: 'genz', emoji: '✨', label: 'Gen Z Energy', desc: 'No cap, this slaps', free: false },
  { id: 'luxury', emoji: '💎', label: 'Luxury Brand', desc: 'Hermès if it hired people', free: false },
  { id: 'honest', emoji: '🪞', label: 'Honest Mirror', desc: 'Constructive, no fluff', free: false },
  { id: 'hype', emoji: '🚀', label: 'Hype Machine', desc: 'You ARE the product', free: false },
]

export default function Home() {
  const [cv, setCv] = useState('')
  const [vibe, setVibe] = useState('roast')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<{ email: string; isSubscriber: boolean; roastsUsed: number } | null>(null)
  const [showAuth, setShowAuth] = useState<'login' | 'signup' | null>(null)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (d.user) setUser(d.user)
    })
  }, [])

  const selectedVibe = VIBES.find(v => v.id === vibe)!
  const canUseVibe = user?.isSubscriber || selectedVibe.free
  const roastsLeft = user ? Math.max(0, 1 - (user.roastsUsed || 0)) : 1
  const limitReached = !user?.isSubscriber && (user?.roastsUsed || 0) >= 1

  async function handleRoast() {
    if (!cv.trim()) return
    if (!canUseVibe) { setShowAuth('signup'); return }
    if (limitReached && !user?.isSubscriber) { setShowAuth('signup'); return }

    setLoading(true)
    setResult('')
    try {
      const res = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv, vibe }),
      })
      const data = await res.json()
      if (data.error) {
        if (data.code === 'LIMIT_REACHED') { setShowAuth('signup'); setLoading(false); return }
        setResult('Error: ' + data.error)
      } else {
        setResult(data.result)
        if (data.user) setUser(data.user)
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    } catch {
      setResult('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  async function handleAuth(type: 'login' | 'signup') {
    setAuthError('')
    setAuthLoading(true)
    try {
      const res = await fetch(`/api/auth/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword }),
      })
      const data = await res.json()
      if (data.error) { setAuthError(data.error) }
      else { setUser(data.user); setShowAuth(null); setAuthEmail(''); setAuthPassword('') }
    } catch { setAuthError('Something went wrong') }
    setAuthLoading(false)
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }

  async function handleSubscribe() {
    if (!user) { setShowAuth('signup'); return }
    const res = await fetch('/api/subscribe', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
  }

  function copyResult() {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Head>
        <title>VibeCV — Your CV, Roasted & Rewritten by AI</title>
        <meta name="description" content="Paste your CV and get it roasted, rewritten, or remixed by AI. Choose your vibe: brutal roast, corporate polish, Gen Z energy, and more." />
        <meta property="og:title" content="VibeCV — Your CV, Roasted by AI 🔥" />
        <meta property="og:description" content="I pasted my CV and got absolutely destroyed. Try it." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔥</text></svg>" />
      </Head>

      <div className={styles.page}>
        {/* Nav */}
        <nav className={styles.nav}>
          <span className={styles.logo}>VibeCV<span className={styles.logoDot}>.</span></span>
          <div className={styles.navRight}>
            {user ? (
              <>
                {!user.isSubscriber && (
                  <button className={styles.btnAccent} onClick={handleSubscribe}>
                    Go Pro ✦
                  </button>
                )}
                <span className={styles.navUser}>{user.email.split('@')[0]}</span>
                <button className={styles.btnGhost} onClick={handleLogout}>Out</button>
              </>
            ) : (
              <>
                <button className={styles.btnGhost} onClick={() => setShowAuth('login')}>Log in</button>
                <button className={styles.btnAccent} onClick={() => setShowAuth('signup')}>Sign up</button>
              </>
            )}
          </div>
        </nav>

        {/* Hero */}
        <header className={styles.hero}>
          <div className={styles.heroBadge}>AI-Powered • Viral-Ready • Free to Try</div>
          <h1 className={styles.heroTitle}>
            Your CV,<br />
            <span className={styles.heroAccent}>Roasted.</span>
          </h1>
          <p className={styles.heroSub}>
            Paste your résumé. Pick a vibe. Get destroyed — or transformed — by AI.
            <br />People are posting their roasts. You should too.
          </p>
          <div className={styles.heroStats}>
            <div className={styles.stat}><strong>6</strong> vibes</div>
            <div className={styles.statDivider}>/</div>
            <div className={styles.stat}><strong>Free</strong> first roast</div>
            <div className={styles.statDivider}>/</div>
            <div className={styles.stat}><strong>$9</strong>/mo unlimited</div>
          </div>
        </header>

        {/* Main tool */}
        <main className={styles.main}>
          {/* Vibe selector */}
          <section className={styles.vibeSection}>
            <h2 className={styles.sectionLabel}>01 — Pick your vibe</h2>
            <div className={styles.vibeGrid}>
              {VIBES.map(v => (
                <button
                  key={v.id}
                  className={`${styles.vibeCard} ${vibe === v.id ? styles.vibeCardActive : ''} ${!v.free && !user?.isSubscriber ? styles.vibeCardLocked : ''}`}
                  onClick={() => setVibe(v.id)}
                >
                  <span className={styles.vibeEmoji}>{v.emoji}</span>
                  <span className={styles.vibeLabel}>{v.label}</span>
                  <span className={styles.vibeDesc}>{v.desc}</span>
                  {!v.free && !user?.isSubscriber && (
                    <span className={styles.vibeLock}>PRO</span>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* CV Input */}
          <section className={styles.inputSection}>
            <h2 className={styles.sectionLabel}>
              02 — Paste your CV
              {!user?.isSubscriber && (
                <span className={styles.freeTag}>
                  {limitReached ? '0 free roasts left' : `${roastsLeft} free roast left`}
                </span>
              )}
            </h2>
            <textarea
              className={styles.cvInput}
              placeholder="Paste your CV / résumé text here...

Name, experience, skills, education — dump it all in. The more you give the AI, the better the roast.

(Don't include sensitive info like your address or phone number)"
              value={cv}
              onChange={e => setCv(e.target.value)}
              rows={12}
            />
            <div className={styles.inputMeta}>
              <span className={styles.charCount}>{cv.length} chars</span>
              {cv.length > 50 && <span className={styles.charGood}>✓ Enough to work with</span>}
            </div>
          </section>

          {/* CTA */}
          <div className={styles.ctaRow}>
            <button
              className={`${styles.btnBig} ${loading ? styles.btnBigLoading : ''}`}
              onClick={handleRoast}
              disabled={loading || !cv.trim()}
            >
              {loading ? (
                <span className={styles.loadingDots}>
                  <span>AI is judging you</span>
                  <span className={styles.dot}>.</span>
                  <span className={styles.dot}>.</span>
                  <span className={styles.dot}>.</span>
                </span>
              ) : (
                <>
                  {selectedVibe.emoji} {selectedVibe.label} my CV
                </>
              )}
            </button>
            {limitReached && !user?.isSubscriber && (
              <p className={styles.limitNote}>
                You've used your free roast.{' '}
                <button className={styles.inlineLink} onClick={handleSubscribe}>Go Pro for $9/mo</button>{' '}
                to unlock all vibes + unlimited roasts.
              </p>
            )}
          </div>

          {/* Result */}
          {result && (
            <section className={styles.resultSection} ref={resultRef}>
              <div className={styles.resultHeader}>
                <h2 className={styles.sectionLabel}>03 — The verdict {selectedVibe.emoji}</h2>
                <div className={styles.resultActions}>
                  <button className={styles.btnGhost} onClick={copyResult}>
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                  <button className={styles.btnGhost} onClick={() => {
                    const text = `I asked AI to roast my CV and... ${result.slice(0, 200)}...\n\nTry yours at vibecv.app 🔥`
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
                  }}>
                    Post on X 𝕏
                  </button>
                </div>
              </div>
              <div className={styles.resultBox}>
                <div className={styles.resultVibeBadge}>{selectedVibe.emoji} {selectedVibe.label}</div>
                <div className={styles.resultText}>{result}</div>
              </div>
              <p className={styles.shareNudge}>
                Screenshot this and post it. The comments will be worth it. 👀
              </p>
            </section>
          )}
        </main>

        {/* Pricing */}
        {!user?.isSubscriber && (
          <section className={styles.pricing}>
            <div className={styles.pricingInner}>
              <h2 className={styles.pricingTitle}>One price.<br />All the vibes.</h2>
              <div className={styles.pricingCard}>
                <div className={styles.pricingAmount}>$9<span>/mo</span></div>
                <ul className={styles.pricingFeatures}>
                  <li>✦ All 6 vibes unlocked</li>
                  <li>✦ Unlimited roasts & rewrites</li>
                  <li>✦ New vibes added monthly</li>
                  <li>✦ Cancel anytime</li>
                </ul>
                <button className={styles.btnAccentBig} onClick={handleSubscribe}>
                  Start for $9/mo
                </button>
                <p className={styles.pricingNote}>Free roast first. No card required to try.</p>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className={styles.footer}>
          <span>VibeCV © {new Date().getFullYear()}</span>
          <span>Made with 🔥 and AI</span>
        </footer>
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <div className={styles.modalOverlay} onClick={() => setShowAuth(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowAuth(null)}>✕</button>
            <h2 className={styles.modalTitle}>
              {showAuth === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className={styles.modalSub}>
              {showAuth === 'signup'
                ? 'Sign up to unlock all 6 vibes + unlimited roasts.'
                : 'Log back in to your account.'}
            </p>
            <input
              className={styles.authInput}
              type="email"
              placeholder="Email"
              value={authEmail}
              onChange={e => setAuthEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAuth(showAuth)}
            />
            <input
              className={styles.authInput}
              type="password"
              placeholder="Password"
              value={authPassword}
              onChange={e => setAuthPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAuth(showAuth)}
            />
            {authError && <p className={styles.authError}>{authError}</p>}
            <button
              className={styles.btnAccentBig}
              onClick={() => handleAuth(showAuth)}
              disabled={authLoading}
            >
              {authLoading ? 'Loading...' : showAuth === 'login' ? 'Log in' : 'Create account'}
            </button>
            <p className={styles.authSwitch}>
              {showAuth === 'login' ? (
                <>No account? <button className={styles.inlineLink} onClick={() => setShowAuth('signup')}>Sign up</button></>
              ) : (
                <>Have an account? <button className={styles.inlineLink} onClick={() => setShowAuth('login')}>Log in</button></>
              )}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
