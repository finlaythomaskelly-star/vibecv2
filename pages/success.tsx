// pages/success.tsx — shown after successful payment (optional redirect)
// The main page handles ?subscribed=1 param, but this is a cleaner alternative
import Head from 'next/head'
import Link from 'next/link'

export default function Success() {
  return (
    <>
      <Head><title>You're Pro — VibeCV</title></Head>
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '1.5rem', textAlign: 'center', padding: '2rem',
        fontFamily: 'var(--font-display)'
      }}>
        <div style={{ fontSize: '4rem' }}>🎉</div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--white)' }}>
          You're Pro now.
        </h1>
        <p style={{ color: 'var(--muted)', maxWidth: 360 }}>
          All 6 vibes unlocked. Unlimited roasts. Go build that career.
        </p>
        <Link href="/" style={{
          background: 'var(--accent)', color: 'white', padding: '0.75rem 2rem',
          borderRadius: '8px', fontWeight: 700, fontFamily: 'var(--font-body)'
        }}>
          Start roasting →
        </Link>
      </div>
    </>
  )
}
