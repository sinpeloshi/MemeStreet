'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegistroPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const submit = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error al registrarse'); return }
      router.push('/'); router.refresh()
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="anim-1" style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: '64px', letterSpacing: '4px', color: 'var(--lime)', lineHeight: 1, textShadow: '0 0 40px rgba(181,255,0,0.3)', marginBottom: '4px' }}>MEMEO</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--muted)', letterSpacing: '2px' }}>UNITE A LA ECONOMÍA DEL MEME™</div>
        </div>

        <div style={{ background: 'rgba(255,214,10,0.08)', border: '1px solid rgba(255,214,10,0.25)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🎁</span>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', fontWeight: 700, color: 'var(--gold)' }}>1.000 CRÉDITOS GRATIS</div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '1px' }}>al registrarte. Sin tarjeta. Sin VC. Sin drama.</div>
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '32px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>Crear cuenta</h1>
          <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '24px' }}>Unite a miles de traders del meme en LATAM</p>

          {error && (
            <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(255,45,85,0.3)', color: 'var(--red)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
              ⚠ {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { key: 'username', label: 'USUARIO', type: 'text', placeholder: 'memegod420' },
              { key: 'email', label: 'EMAIL', type: 'email', placeholder: 'anon@memeo.gg' },
              { key: 'password', label: 'CONTRASEÑA', type: 'password', placeholder: '••••••••' },
            ].map(f => (
              <div key={f.key}>
                <label className="field-label">{f.label}</label>
                <input type={f.type} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} onKeyDown={e => e.key === 'Enter' && submit()} placeholder={f.placeholder} className="inp" />
              </div>
            ))}
            <button onClick={submit} disabled={loading} className="btn-lime" style={{ padding: '13px', borderRadius: '8px', marginTop: '4px', width: '100%', letterSpacing: '0.5px' }}>
              {loading ? 'CREANDO CUENTA...' : '🚀 UNIRME A LA ECONOMÍA'}
            </button>
          </div>

          <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '13px', marginTop: '20px' }}>
            ¿Ya tenés cuenta?{' '}
            <Link href="/login" style={{ color: 'var(--lime)', fontWeight: 600 }}>Entrar →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}