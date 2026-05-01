'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { MARKET_CREATION_COST } from '@/lib/constants'

function extractTweetIdClient(url) {
  const m = (url || '').match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/)
  return m ? m[1] : null
}

export default function CrearPage() {
  const [form, setForm] = useState({
    tweetUrl: '', title: '', imageUrl: '', tags: '',
    question: '', threshold: '', platform: 'twitter', deadline: '',
  })
  const [preview, setPreview] = useState(false)
  const [fetchingTweet, setFetchingTweet] = useState(false)
  const [tweetOk, setTweetOk] = useState(false)
  const [tweetErr, setTweetErr] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)
  const router = useRouter()

  const onTweetUrlChange = (val) => {
    setForm(f => ({ ...f, tweetUrl: val }))
    setTweetOk(false); setTweetErr('')

    if (debounceRef.current) clearTimeout(debounceRef.current)
    const tweetId = extractTweetIdClient(val)
    if (!tweetId) return

    debounceRef.current = setTimeout(async () => {
      setFetchingTweet(true)
      try {
        const res = await fetch(`/api/tweet-preview?url=${encodeURIComponent(val)}`)
        const data = await res.json()
        if (!res.ok) { setTweetErr(data.error || 'No se pudo obtener el tweet'); return }

        setTweetOk(true)
        setForm(f => ({
          ...f,
          imageUrl: data.imageUrl || f.imageUrl,
          title: f.title || (data.text ? data.text.slice(0, 80).replace(/https?:\/\/\S+/g, '').trim() : ''),
        }))
        if (data.imageUrl) setPreview(true)
      } catch {
        setTweetErr('Error de conexión')
      } finally {
        setFetchingTweet(false)
      }
    }, 700)
  }

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
  const tweetId = extractTweetIdClient(form.tweetUrl)
  const tweetValid = tweetId && tweetOk

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 20px 40px' }}>
      <div style={{ padding: '40px 0 28px' }}>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--lime)', letterSpacing: '3px', marginBottom: '10px' }}>← DISRUPTÁ EL MERCADO</div>
        <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '52px', letterSpacing: '3px', lineHeight: 1, color: '#fff' }}>LANZAR UN MEME</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '8px' }}>Pegá el link del tweet. La plataforma hace el resto.</p>
      </div>

      <div style={{ background: 'rgba(181,255,0,0.05)', border: '1px solid rgba(181,255,0,0.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '16px', color: 'var(--lime)', fontWeight: 700 }}>◈ {MARKET_CREATION_COST}</span>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--muted)' }}>créditos se descuentan al lanzar</span>
      </div>

      {error && (
        <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(255,45,85,0.3)', color: 'var(--red)', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
          ⚠ {error}
        </div>
      )}

      {/* PASO 1: Tweet URL — LO PRIMERO */}
      <div style={{ ...panel, borderColor: tweetValid ? 'rgba(181,255,0,0.4)' : tweetErr ? 'rgba(255,45,85,0.3)' : 'var(--border)' }}>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--lime)', letterSpacing: '2px', marginBottom: '14px' }}>
          01 — LINK DEL TWEET EN X / TWITTER
        </div>
        <input
          type="url"
          value={form.tweetUrl}
          onChange={e => onTweetUrlChange(e.target.value)}
          placeholder="https://x.com/usuario/status/1234567890"
          className="inp"
          style={{ fontSize: '14px' }}
        />
        <div style={{ marginTop: '8px', fontFamily: 'JetBrains Mono', fontSize: '11px', minHeight: '18px' }}>
          {fetchingTweet && <span style={{ color: 'var(--muted)' }}>⏳ Obteniendo datos del tweet...</span>}
          {tweetValid && !fetchingTweet && <span style={{ color: 'var(--lime)' }}>✓ Tweet detectado — imagen y título cargados automáticamente</span>}
          {tweetErr && !fetchingTweet && <span style={{ color: 'var(--red)' }}>⚠ {tweetErr}</span>}
          {!form.tweetUrl && <span style={{ color: 'var(--muted2)' }}>Pegá el link y completamos el resto solos. La resolución también será automática.</span>}
        </div>
      </div>

      {/* PASO 2: Meme */}
      <div style={panel}>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--gold)', letterSpacing: '2px', marginBottom: '14px' }}>02 — EL MEME</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="field-label">TÍTULO</label>
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="El meme más dank del año" className="inp" />
          </div>
          <div>
            <label className="field-label">
              IMAGEN
              {tweetValid && form.imageUrl && <span style={{ color: 'var(--lime)', marginLeft: '8px', fontSize: '9px' }}>← AUTO-COMPLETADA DEL TWEET</span>}
            </label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={e => { setForm({ ...form, imageUrl: e.target.value }); setPreview(false) }}
              onBlur={() => form.imageUrl && setPreview(true)}
              placeholder={tweetValid ? 'Obtenida del tweet automáticamente' : 'https://i.imgur.com/... (si el tweet no tiene imagen)'}
              className="inp"
            />
            {!tweetValid && (
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--muted2)', marginTop: '5px' }}>
                Si el tweet tiene imagen, se completa solo. Si no, subí a imgur.com y pegá el link.
              </p>
            )}
          </div>
          {preview && form.imageUrl && (
            <div style={{ borderRadius: '8px', overflow: 'hidden', height: '220px', background: '#080808', border: '1px solid var(--border)' }}>
              <img src={form.imageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={() => setPreview(false)} />
            </div>
          )}
          <div>
            <label className="field-label">TAGS (separados por coma)</label>
            <input type="text" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="crypto, política, gaming" className="inp" />
          </div>
        </div>
      </div>

      {/* PASO 3: Mercado */}
      <div style={panel}>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--muted)', letterSpacing: '2px', marginBottom: '14px' }}>03 — EL MERCADO</div>
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
              <label className="field-label">UMBRAL (interacciones)</label>
              <input type="number" value={form.threshold} onChange={e => setForm({ ...form, threshold: e.target.value })} placeholder="100000" className="inp" />
            </div>
          </div>
          <div>
            <label className="field-label">FECHA LÍMITE</label>
            <input type="datetime-local" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} min={new Date().toISOString().slice(0, 16)} className="inp" />
          </div>
          {tweetValid && (
            <div style={{ background: 'rgba(29,155,240,0.07)', border: '1px solid rgba(29,155,240,0.25)', borderRadius: '8px', padding: '10px 14px', fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#1d9bf0' }}>
              🤖 Al vencer el plazo, la plataforma verificará automáticamente las interacciones en Twitter y resolverá el mercado sin intervención humana.
            </div>
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
