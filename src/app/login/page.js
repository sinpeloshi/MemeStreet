'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    router.push('/')
    router.refresh()
  }

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto' }}>
      <div style={{
        background: '#0d0d0d',
        border: '1px solid #1e1e1e',
        borderRadius: '16px',
        padding: '36px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔥</div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Bienvenido de vuelta</h1>
          <p style={{ color: '#555', fontSize: '13px', marginTop: '4px' }}>Entrá a tu cuenta</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(255,59,59,0.1)',
            border: '1px solid rgba(255,59,59,0.3)',
            color: '#ff3b3b',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#555', marginBottom: '6px', fontFamily: 'IBM Plex Mono' }}>EMAIL</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="tu@email.com"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#555', marginBottom: '6px', fontFamily: 'IBM Plex Mono' }}>CONTRASEÑA</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={inputStyle}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              background: loading ? '#1a1a1a' : 'linear-gradient(135deg, #00ff88, #00ccff)',
              color: loading ? '#555' : '#000',
              fontWeight: 700,
              fontSize: '14px',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '4px',
              fontFamily: 'Syne',
              letterSpacing: '0.5px',
            }}
          >
            {loading ? 'ENTRANDO...' : 'ENTRAR'}
          </button>
        </div>

        <p style={{ textAlign: 'center', color: '#444', fontSize: '13px', marginTop: '20px' }}>
          ¿No tenés cuenta?{' '}
          <Link href="/register" style={{ color: '#00ff88', textDecoration: 'none' }}>Registrate</Link>
        </p>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  background: '#111',
  border: '1px solid #1e1e1e',
  borderRadius: '8px',
  padding: '10px 14px',
  color: '#e8e8e8',
  fontSize: '14px',
  outline: 'none',
  fontFamily: 'IBM Plex Mono',
  boxSizing: 'border-box',
}