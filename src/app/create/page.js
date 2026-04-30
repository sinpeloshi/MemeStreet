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

  const submit = async () => {
    setLoading(true); setError('')
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

  const panel = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '14px',
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 20px 40px' }}>
      {/* Header */}
      <div style={{ padding: '40px 0 32px' }}>
        <div style={{
          fontFamily: 'JetBrains Mono',
          fontSize: '10px',
          color: 'var(--lime)',
          letterSpacing: '3px',
          marginBottom: '10px',
        }}>
          ← DISRUPT THE MARKET
        </div>
        <h1 style={{
          fontFamily: 'Bebas Neue',
          fontSize: '52px',
          letterSpacing: '3px',
          lineHeight: 1,
          color: '#fff',
        }}>
          LAUNCH A MEME
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '8px' }}>
          Create a prediction market. Let the crowd bet on virality.
        </p>
      </div>

      {error && (
        <div style={{
          background: 'var(--red-dim)',
          border: '1px solid rgba(255,45,85,0.3)',
          color: 'var(--red)',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '13px',
          marginBottom: '16px',
        }}>
          ⚠ {error}
        </div>
      )}

      {/* Panel 1 */}
      <div style={panel}>
        <div className="section-head" style={{ color: 'var(--lime)', fontSize: '10px' }}>
          01 — THE MEME
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="field-label">TITLE</label>
            <input type="text" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="The most dank meme of the year" className="inp" />
          </div>

          <div>
            <label className="field-label">IMAGE URL</label>
            <input type="url" value={form.imageUrl}
              onChange={e => setForm({ ...form, imageUrl: e.target.value })}
              onBlur={() => form.imageUrl && setPreview(true)}
              placeholder="https://i.imgur.com/..." className="inp" />
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--muted2)', marginTop: '5px' }}>
              Upload to imgur.com → paste direct link here
            </p>
          </div>

          {preview && form.imageUrl && (
            <div style={{
              borderRadius: '8px',
              overflow: 'hidden',
              height: '200px',
              background: '#080808',
              border: '1px solid var(--border)',
            }}>
              <img src={form.imageUrl} alt="preview"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={() => setPreview(false)} />
            </div>
          )}

          <div>
            <label className="field-label">TAGS (comma separated)</label>
            <input type="text" value={form.tags}
              onChange={e => setForm({ ...form, tags: e.target.value })}
              placeholder="crypto, gaming, politics" className="inp" />
          </div>
        </div>
      </div>

      {/* Panel 2 */}
      <div style={panel}>
        <div className="section-head" style={{ color: 'var(--gold)', fontSize: '10px' }}>
          02 — THE MARKET
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="field-label">PREDICTION QUESTION</label>
            <input type="text" value={form.question}
              onChange={e => setForm({ ...form, question: e.target.value })}
              placeholder="Will this meme reach 100K likes in 48hrs?" className="inp" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="field-label">PLATFORM</label>
              <select value={form.platform}
                onChange={e => setForm({ ...form, platform: e.target.value })}
                className="inp">
                <option value="twitter">Twitter / X</option>
                <option value="reddit">Reddit</option>
                <option value="tiktok">TikTok</option>
                <option value="instagram">Instagram</option>
              </select>
            </div>
            <div>
              <label className="field-label">VIRALITY THRESHOLD</label>
              <input type="number" value={form.threshold}
                onChange={e => setForm({ ...form, threshold: e.target.value })}
                placeholder="100000" className="inp" />
            </div>
          </div>

          <div>
            <label className="field-label">DEADLINE</label>
            <input type="datetime-local" value={form.deadline}
              onChange={e => setForm({ ...form, deadline: e.target.value })}
              min={new Date().toISOString().slice(0, 16)}
              className="inp" />
          </div>
        </div>
      </div>

      {/* Submit */}
      <button onClick={submit} disabled={loading} className="btn-lime"
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: '10px',
          fontSize: '16px',
          letterSpacing: '1px',
        }}>
        {loading ? '🚀 LAUNCHING...' : '🚀 LAUNCH TO THE MARKET'}
      </button>

      <p style={{
        textAlign: 'center',
        fontFamily: 'JetBrains Mono',
        fontSize: '10px',
        color: 'var(--muted2)',
        marginTop: '16px',
        letterSpacing: '1px',
      }}>
        THE MARKET DECIDES. NOT YOU. NOT US. THE MARKET.
      </p>
    </div>
  )
}