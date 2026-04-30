'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

const TICKER = [
  '🔥 HARAMBE +∞%', '🐸 PEPE +420.0%', '🚀 DOGE +69.4%', '💀 LUNA -99.9%',
  '🦍 APE +200%', '🌕 WOW +88%', '📉 RUGPULL -100%', '💎 DIAMANTE +314%',
  '🤡 PAYASO +42%', '🧠 GALAXY-BRAIN +999%', '📈 MEMEO DISRUPTING A ESCALA™',
  '🏆 Y COMBINATOR DE LOS MEMES', '⚡ MOVERSE RÁPIDO ROMPER MEMES',
  '🇦🇷 ARGENTINA MEME ECONOMY', '🇲🇽 MEXICO MEME TRADING', '🇨🇴 COLOMBIA MEME MARKET',
]

export default function Navbar() {
  const [user, setUser] = useState(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user))
  }, [pathname])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/')
    router.refresh()
  }

  const tickerText = TICKER.join('   ·   ') + '   ·   ' + TICKER.join('   ·   ')

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      {/* Ticker */}
      <div style={{ background: 'var(--lime)', color: '#000', height: '26px', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <div className="ticker-track" style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap', fontFamily: 'JetBrains Mono', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>
          {tickerText}
        </div>
      </div>

      {/* Main nav */}
      <nav style={{ background: 'rgba(3,3,3,0.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)' }}>
        <div className="nav-inner">

          {/* Logo bicolor */}
          <Link href="/" className="nav-logo">
            <span className="logo-me">ME</span>
            <span className="logo-meo">MEO</span>
          </Link>

          {/* Right */}
          <div className="nav-right">
            {user ? (
              <>
                <Link href="/crear" className="btn-lime nav-launch">
                  <span className="nav-launch-full">+ LANZAR MEME</span>
                  <span className="nav-launch-short">+</span>
                </Link>

                <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                  <div className="nav-credits">
                    <span style={{ color: 'var(--gold)', fontSize: '13px' }}>◈</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', fontWeight: 700, color: 'var(--gold)' }}>
                      {user.credits.toLocaleString()}
                    </span>
                  </div>
                  <span className="nav-username">@{user.username}</span>
                </Link>

                <button onClick={logout} className="nav-exit">SALIR</button>
              </>
            ) : (
              <>
                <Link href="/login" className="nav-login">ENTRAR</Link>
                <Link href="/registro" className="nav-register">REGISTRARSE</Link>
              </>
            )}
          </div>

        </div>
      </nav>
    </div>
  )
}
