'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

const TICKER = [
  '🔥 HARAMBE +∞%', '🐸 PEPE +420.0%', '🚀 DOGE +69.4%', '💀 LUNA -99.9%',
  '🦍 APE +200%', '🌕 WOW +88%', '📉 RUGPULL -100%', '💎 DIAMOND +314%',
  '🤡 CLOWN +42%', '🧠 GALAXY-BRAIN +999%', '📈 MEMEO DISRUPTING AT SCALE™',
  '🏆 Y COMBINATOR FOR MEMES', '⚡ MOVE FAST BREAK MEMES',
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
      <div style={{
        background: 'var(--lime)',
        color: '#000',
        height: '26px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}>
        <div className="ticker-track" style={{
          display: 'inline-flex',
          alignItems: 'center',
          whiteSpace: 'nowrap',
          fontFamily: 'JetBrains Mono',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.5px',
          gap: 0,
        }}>
          {tickerText}
        </div>
      </div>

      {/* Main nav */}
      <nav style={{
        background: 'rgba(3,3,3,0.96)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 20px',
      }}>
        <div style={{
          maxWidth: '1140px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '54px',
        }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>🔥</span>
            <div>
              <div style={{
                fontFamily: 'Bebas Neue',
                fontSize: '26px',
                letterSpacing: '2px',
                color: 'var(--lime)',
                lineHeight: 1,
                textShadow: '0 0 20px rgba(181,255,0,0.35)',
              }}>
                MEMEO
              </div>
              <div style={{
                fontFamily: 'JetBrains Mono',
                fontSize: '8px',
                color: 'var(--muted)',
                letterSpacing: '1.5px',
                lineHeight: 1,
              }}>
                MEME ECONOMY™
              </div>
            </div>
          </Link>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {user ? (
              <>
                <Link href="/create" className="btn-lime" style={{
                  padding: '8px 16px',
                  borderRadius: '7px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                }}>
                  <span>+</span> LAUNCH MEME
                </Link>

                <div style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border2)',
                  borderRadius: '7px',
                  padding: '7px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <span style={{ color: 'var(--gold)', fontSize: '13px' }}>◈</span>
                  <span style={{
                    fontFamily: 'JetBrains Mono',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--gold)',
                  }}>
                    {user.credits.toLocaleString()}
                  </span>
                </div>

                <span style={{
                  fontFamily: 'JetBrains Mono',
                  fontSize: '11px',
                  color: 'var(--muted)',
                }}>
                  @{user.username}
                </span>

                <button onClick={logout} style={{
                  background: 'none',
                  border: '1px solid var(--border2)',
                  color: 'var(--muted)',
                  fontSize: '11px',
                  fontFamily: 'JetBrains Mono',
                  padding: '7px 10px',
                  borderRadius: '7px',
                  cursor: 'crosshair',
                  transition: 'color 0.15s',
                }}>
                  EXIT
                </button>
              </>
            ) : (
              <>
                <Link href="/login" style={{
                  fontFamily: 'JetBrains Mono',
                  fontSize: '12px',
                  color: 'var(--muted)',
                  padding: '8px 12px',
                  letterSpacing: '0.5px',
                  transition: 'color 0.15s',
                }}>
                  LOGIN
                </Link>
                <Link href="/register" style={{
                  background: 'transparent',
                  border: '1px solid var(--lime)',
                  color: 'var(--lime)',
                  fontFamily: 'JetBrains Mono',
                  fontWeight: 600,
                  fontSize: '12px',
                  padding: '8px 14px',
                  borderRadius: '7px',
                  letterSpacing: '0.5px',
                  transition: 'background 0.15s',
                }}>
                  REGISTER
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </div>
  )
}