'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreatePage() {
  const [form, setForm] = useState({
    title: '', imageUrl: '', tags: '',
    question: '', threshold: '', platform: 'twitter', deadline: '',
  })
  const [preview, setPreview] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    const res = await fetch('/api/memes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        threshold: parseInt(form.threshold),
      }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    router.push(`/market/${data.market.id}`)
  }

  const sectionStyle = {
    background: '#0d0d0d',
    border: '1px solid #1a1a1a',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '16px',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    fontWeight: 600,
    color: '#555',
    marginBottom: '8px',
    fontFamily: 'IBM Plex Mono',
    letterSpacing: '1px',
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
    fontFamily: 'Syne',
    boxSizing: 'border-box',
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>
          🚀 Lanzar Meme
        </h1>
        <p style={{ color: '#555', marginTop: '6px', fontSize: '14px' }}>
          Creá un mercado de predicción. La comunidad apuesta si va a ser viral.
        </p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(255,59,59,0.1)',
          border: '1px solid rgba(255,59,59,0.3)',
          color: '#ff3b3b',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '13px',
          marginBottom: '16px',
        }}>
          {error}
        </div>
      )}

      {/* Section 1: Meme */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#00ff88', letterSpacing: '1.5px', marginBottom: '20px', fontFamily: 'IBM Plex Mono' }}>
          01 / EL MEME
        </h2>

        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>TÍTULO</label>
          <input
            type="text"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="El meme más dank del año"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>URL DE LA IMAGEN</label>
          <input
            type="url"
            value={form.imageUrl}
            onChange={e => setForm({ ...form, imageUrl: e.target.value })}
            onBlur={() => form.imageUrl && setPreview(true)}
            placeholder="https://i.imgur.com/..."
            style={inputStyle}
          />
          <p style={{ fontSize: '11px', color: '#333', marginTop: '5px', fontFamily: 'IBM Plex Mono' }}>
            Subí tu imagen a imgur.com y pegá la URL directa
          </p>
        </div>

        {preview && form.imageUrl && (
          <div style={{ borderRadius: '8px', overflow: 'hidden', height: '200px', marginBottom: '14px', background: '#111' }}>
            <img
              src={form.imageUrl}
              alt="preview"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onError={() => setPreview(false)}
            />
          </div>
        )}

        <div>
          <label style={labelStyle}>TAGS (separados por coma)</label>
          <input
            type="text"
            value={form.tags}
            onChange={e => setForm({ ...form, tags: e.target.value })}
            placeholder="crypto, politics, gaming"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Section 2: Market */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#00ccff', letterSpacing: '1.5px', marginBottom: '20px', fontFamily: 'IBM Plex Mono' }}>
          02 / EL MERCADO
        </h2>

        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>PREGUNTA DE PREDICCIÓN</label>
          <input
            type="text"
            value={form.question}
            onChange={e => setForm({ ...form, question: e.target.value })}
            placeholder="¿Este meme llegará a 100K likes en 48hs?"
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
          <div>
            <label style={labelStyle}>PLATAFORMA</label>
            <select
              value={form.platform}
              onChange={e => setForm({ ...form, platform: e.target.value })}
              style={{ ...inputStyle, appearance: 'none' }}
            >
              <option value="twitter">Twitter / X</option>
              <option value="reddit">Reddit</option>
              <option value="tiktok">TikTok</option>
              <option value="instagram">Instagram</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>UMBRAL (interacciones)</label>
            <input
              type="number"
              value={form.threshold}
              onChange={e => setForm({ ...form, threshold: e.target.value })}
              placeholder="100000"
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>FECHA LÍMITE</label>
          <input
            type="datetime-local"
            value={form.deadline}
            onChange={e => setForm({ ...form, deadline: e.target.value })}
            min={new Date().toISOString().slice(0, 16)}
            style={inputStyle}
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: '100%',
          background: loading ? '#1a1a1a' : 'linear-gradient(135deg, #00ff88, #00ccff)',
          color: loading ? '#555' : '#000',
          fontWeight: 800,
          fontSize: '15px',
          padding: '16px',
          borderRadius: '10px',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'Syne',
          letterSpacing: '0.5px',
        }}
      >
        {loading ? '🚀 LANZANDO...' : '🚀 LANZAR AL MERCADO'}
      </button>
    </div>
  )
}