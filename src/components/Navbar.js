'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => { setUser(d.user); setLoaded(true) })
  }, [pathname])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/')
    router.refresh()
  }

  return (
    <nav style={{
      borderBottom: '1px solid #1e1e1e',
      background: 'rgba(8,8,8,0.95)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '0 1rem',
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '56px',
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🔥</span>
          <span style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800,
            fontSize: '18px',
            letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, #00ff88, #00ccff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            MemeMarket
          </span>
        </Link>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {loaded && (
            <>
              {user ? (
                <>
                  <Link href="/create" style={{
                    background: 'linear-gradient(135deg, #00ff88, #00ccff)',
                    color: '#000',
                    fontWeight: 700,
                    fontSize: '13px',
                    padding: '7px 14px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    letterSpacing: '0.3px',
                  }}>
                    + LANZAR
                  </Link>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#111',
                    border: '1px solid #1e1e1e',
                    padding: '6px 12px',
                    borderRadius: '6px',
                  }}>
                    <span style={{ color: '#f5a623', fontSize: '13px' }}>◈</span>
                    <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '13px', fontWeight: 600, color: '#f5a623' }}>
                      {user.credits.toLocaleString()}
                    </span>
                  </div>

                  <span style={{ color: '#555', fontSize: '13px' }}>@{user.username}</span>

                  <button onClick={logout} style={{
                    background: 'none',
                    border: '1px solid #222',
                    color: '#555',
                    fontSize: '12px',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}>
                    salir
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" style={{
                    color: '#888',
                    fontSize: '13px',
                    textDecoration: 'none',
                    padding: '7px 12px',
                  }}>
                    entrar
                  </Link>
                  <Link href="/register" style={{
                    background: '#111',
                    border: '1px solid #00ff88',
                    color: '#00ff88',
                    fontSize: '13px',
                    fontWeight: 600,
                    padding: '7px 14px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                  }}>
                    registrarse
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  )
}