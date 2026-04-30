'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const submit = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error al iniciar sesión'); return }
      router.push('/'); router.refresh()
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 80px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div className="anim-1" style={{ width: '100%', maxWidth: '400px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            fontFamily: 'Bebas Neue',
            fontSize: '64px',
            letterSpacing: '4px',
            color: 'var(--lime)',
            lineHeight: 1,
            textShadow: '0 0 40px rgba(181,255,0,0.3)',
            marginBottom: '4px',
          }}>
            MEMEO
          </div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--muted)', letterSpacing: '2px' }}>
            MEME ECONOMY™
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '32px',
        }}>
          <h1 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>Welcome back, anon</h1>
          <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '24px' }}>
            Your meme portfolio awaits
          </p>

          {error && (
            <div style={{
              background: 'var(--red-dim)',
              border: '1px solid rgba(255,45,85,0.3)',
              color: 'var(--red)',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px',
            }}>
              ⚠ {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label className="field-label">EMAIL</label>
              <input type="email" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="anon@memeo.gg" className="inp" />
            </div>
            <div>
              <label className="field-label">PASSWORD</label>
              <input type="password" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && submit()}
                placeholder="••••••••" className="inp" />
            </div>

            <button onClick={submit} disabled={loading} className="btn-lime"
              style={{ padding: '13px', borderRadius: '8px', marginTop: '4px', width: '100%', letterSpacing: '0.5px' }}>
              {loading ? 'LOGGING IN...' : '→ LOG IN'}
            </button>
          </div>

          <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '13px', marginTop: '20px' }}>
            No account?{' '}
            <Link href="/register" style={{ color: 'var(--lime)', fontWeight: 600 }}>
              Join the economy →
            </Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--muted2)', marginTop: '20px', letterSpacing: '1px' }}>
          NOT FINANCIAL ADVICE. JUST MEMES.
        </p>
      </div>
    </div>
  )
}