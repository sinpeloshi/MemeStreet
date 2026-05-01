'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MARKET_CREATION_COST } from '@/lib/constants'

export default function CrearPage() {
  const [form, setForm] = useState({ title: '', imageUrl: '', tags: '', question: '', threshold: '', platform: 'twitter', deadline: '', tweetUrl: '' })
  const [preview, setPreview] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const submit = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/memes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
          threshold: parseInt(form.threshold),
          tweetUrl: form.tweetUrl.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error al crear el mercado'); return }
      router.push(`/market/${data.market.id}`)
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const panel = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '14px' }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 20px 40px' }}>
      <div style={{ padding: '40px 0 32px' }}>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--lime)', letterSpacing: '3px', marginBottom: '10px' }}>← DISRUPTÁ EL MERCADO</div>
        <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '52px', letterSpacing: '3px', lineHeight: 1, color: '#fff' }}>LANZAR UN MEME</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '8px' }}>Creá un mercado de predicción. Que la comunidad apueste a la viralidad.</p>
      </div>

      {/* Credit cost notice */}
      <div style={{
        background: 'rgba(181,255,0,0.05)', border: '1px solid rgba(181,255,0,0.2)',
        borderRadius: '10px', padding: '12px 16px', marginBottom: '16px',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '16px', color: 'var(--lime)', fontWeight: 700 }}>◈ {MARKET_CREATION_COST}</span>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.3px' }}>
          créditos se descuentan al lanzar. Los créditos financian el mercado.
        </span>
      </div>

      {error && (
        <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(255,45,85,0.3)', color: 'var(--red)', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
          ⚠ {error}
        </div>
      )}

      <div style={panel}>
        <div className="section-head" style={{ color: 'var(--lime)', fontSize: '10px' }}>01 — EL MEME</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="field-label">TÍTULO</label>
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="El meme más dank del año" className="inp" />
          </div>
          <div>
            <label className="field-label">URL DE LA IMAGEN</label>
            <input type="url" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} onBlur={() => form.imageUrl && setPreview(true)} placeholder="https://i.imgur.com/..." className="inp" />
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--muted2)', marginTop: '5px' }}>
              Subí tu imagen a imgur.com → pegá el link directo acá
            </p>
          </div>
          {preview && form.imageUrl && (
            <div style={{ borderRadius: '8px', overflow: 'hidden', height: '200px', background: '#080808', border: '1px solid var(--border)' }}>
              <img src={form.imageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={() => setPreview(false)} />
            </div>
          )}
          <div>
            <label className="field-label">TAGS (separados por coma)</label>
            <input type="text" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="crypto, política, gaming" className="inp" />
          </div>
        </div>
      </div>

      <div style={panel}>
        <div className="section-head" style={{ color: 'var(--gold)', fontSize: '10px' }}>02 — EL MERCADO</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="field-label">PREGUNTA DE PREDICCIÓN</label>
            <input type="text" value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} placeholder="¿Este meme llegará a 100K interacciones en 48hs?" className="inp" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="field-label">PLATAFORMA</label>
              <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} className="inp">
                <option value="twitter">Twitter / X</option>
                <option value="reddit">Reddit</option>
                <option value="tiktok">TikTok</option>
                <option value="instagram">Instagram</option>
              </select>
            </div>
            <div>
              <label className="field-label">UMBRAL DE INTERACCIONES</label>
              <input type="number" value={form.threshold} onChange={e => setForm({ ...form, threshold: e.target.value })} placeholder="100000" className="inp" />
            </div>
          </div>
          <div>
            <label className="field-label">FECHA LÍMITE</label>
            <input type="datetime-local" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} min={new Date().toISOString().slice(0, 16)} className="inp" />
          </div>
        </div>
      </div>

      {/* Twitter auto-resolve section */}
      <div style={{ ...panel, borderColor: form.tweetUrl ? 'rgba(181,255,0,0.3)' : 'var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div className="section-head" style={{ color: 'var(--lime)', fontSize: '10px', margin: 0 }}>03 — AUTO-RESOLUCIÓN</div>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', background: 'var(--lime-dim)', color: 'var(--lime)', border: '1px solid rgba(181,255,0,0.3)', padding: '2px 7px', borderRadius: '4px', letterSpacing: '0.5px' }}>
            RECOMENDADO
          </span>
        </div>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '14px' }}>
          Pegá el link del tweet original. Cuando venza el tiempo, la plataforma verificará automáticamente las interacciones en Twitter y resolverá el mercado sin intervención humana.
        </p>
        <div>
          <label className="field-label">LINK DEL TWEET EN X / TWITTER (opcional)</label>
          <input
            type="url"
            value={form.tweetUrl}
            onChange={e => setForm({ ...form, tweetUrl: e.target.value })}
            placeholder="https://x.com/usuario/status/1234567890"
            className="inp"
          />
          {form.tweetUrl && !form.tweetUrl.match(/(?:twitter\.com|x\.com)\/\w+\/status\/\d+/) && (
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--red)', marginTop: '5px' }}>
              ⚠ URL inválida. Usá el formato: https://x.com/usuario/status/123...
            </p>
          )}
          {form.tweetUrl && form.tweetUrl.match(/(?:twitter\.com|x\.com)\/\w+\/status\/\d+/) && (
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--lime)', marginTop: '5px' }}>
              ✓ Tweet detectado — resolución automática activada
            </p>
          )}
          {!form.tweetUrl && (
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--muted2)', marginTop: '5px' }}>
              Sin link → el creador deberá resolver manualmente al vencer el plazo.
            </p>
          )}
        </div>
      </div>

      <button onClick={submit} disabled={loading} className="btn-lime" style={{ width: '100%', padding: '16px', borderRadius: '10px', fontSize: '16px', letterSpacing: '1px' }}>
        {loading ? '🚀 LANZANDO...' : `🚀 LANZAR AL MERCADO — ◈ ${MARKET_CREATION_COST}`}
      </button>
      <p style={{ textAlign: 'center', fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--muted2)', marginTop: '16px', letterSpacing: '1px' }}>
        EL MERCADO DECIDE. NO VOS. NO NOSOTROS. EL MERCADO.
      </p>
    </div>
  )
}
