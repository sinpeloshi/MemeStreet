'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const METRIC_LABELS = {
  total: 'ENGAGEMENT TOTAL',
  likes: 'LIKES',
  retweets: 'RETWEETS',
  replies: 'RESPUESTAS',
  impressions: 'IMPRESIONES',
}

function tiempoRestante(d) {
  const ms = new Date(d) - new Date()
  if (ms <= 0) return 'EXPIRADO'
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000)
  if (h > 24) return `${Math.floor(h / 24)}D RESTANTES`
  if (h > 0) return `${h}H ${m}M`
  return `${m}M RESTANTES`
}

export default function MarketPage() {
  const { id } = useParams()
  const [market, setMarket] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState(100)
  const [pos, setPos] = useState(null)
  const [betting, setBetting] = useState(false)
  const [msg, setMsg] = useState({ t: '', v: '' })
  const [autoResolving, setAutoResolving] = useState(false)
  const [autoResolveError, setAutoResolveError] = useState('')
  const [tweetMetrics, setTweetMetrics] = useState(null)
  const autoResolveTried = useRef(false)
  const router = useRouter()

  const load = () => Promise.all([
    fetch(`/api/markets/${id}`).then(r => r.json()),
    fetch('/api/auth/me').then(r => r.json()),
  ]).then(([m, u]) => { setMarket(m); setUser(u.user); setLoading(false) })

  useEffect(() => { load() }, [id])

  // Auto-resolve trigger: fires once when market is expired+open with a tweetId
  useEffect(() => {
    if (!market || market.error || autoResolveTried.current) return
    if (market.status !== 'OPEN') return
    if (new Date() <= new Date(market.deadline)) return
    if (!market.tweetId) return

    autoResolveTried.current = true
    setAutoResolving(true)
    setAutoResolveError('')

    fetch(`/api/markets/${id}/auto-resolve`, { method: 'POST' })
      .then(r => r.json())
      .then(data => {
        if (data.metrics) setTweetMetrics(data.metrics)
        if (data.error) {
          setAutoResolveError(data.error)
        } else {
          load()
        }
      })
      .catch(() => setAutoResolveError('Error de conexión al intentar auto-resolver.'))
      .finally(() => setAutoResolving(false))
  }, [market?.id, market?.status, market?.tweetId])

  const apostar = async () => {
    if (!user) { router.push('/login'); return }
    if (!pos) { setMsg({ t: 'err', v: 'Seleccioná SÍ o NO primero' }); return }
    setBetting(true); setMsg({ t: '', v: '' })
    try {
      const res = await fetch(`/api/markets/${id}/bet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position: pos === 'si', amount }),
      })
      const data = await res.json()
      if (!res.ok) { setMsg({ t: 'err', v: data.error }); return }
      setMsg({ t: 'ok', v: `✅ APUESTA REGISTRADA — ${amount} ◈ en ${pos === 'si' ? 'SÍ' : 'NO'}` })
      setUser(u => ({ ...u, credits: data.newCredits }))
      load()
    } catch {
      setMsg({ t: 'err', v: 'Error de conexión. Intentá de nuevo.' })
    } finally {
      setBetting(false)
    }
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <div style={{ fontFamily: 'Bebas Neue', fontSize: '32px', letterSpacing: '4px', color: 'var(--lime)' }}>CARGANDO MERCADO...</div>
    </div>
  )

  if (!market || market.error) return (
    <div style={{ textAlign: 'center', padding: '80px' }}>
      <div style={{ fontFamily: 'Bebas Neue', fontSize: '48px', color: 'var(--muted2)', letterSpacing: '3px' }}>404 — MEME NO ENCONTRADO</div>
    </div>
  )

  const total = market.totalYes + market.totalNo
  const yesP = total > 0 ? Math.round((market.totalYes / total) * 100) : 50
  const noP = 100 - yesP
  const isOpen = market.status === 'OPEN' && new Date() < new Date(market.deadline)
  const isExpiredOpen = market.status === 'OPEN' && new Date() >= new Date(market.deadline)
  const payout = pos === 'si'
    ? Math.round(amount * (total + amount) / Math.max(market.totalYes + amount, 1))
    : Math.round(amount * (total + amount) / Math.max(market.totalNo + amount, 1))

  const tweetUrlForDisplay = market.tweetUrl || (market.tweetId ? `https://x.com/i/web/status/${market.tweetId}` : null)

  return (
    <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '32px 20px' }}>
      <Link href="/" style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--muted)', letterSpacing: '1px', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '28px' }}>
        ← VOLVER A MERCADOS
      </Link>

      {/* Auto-resolve status banner */}
      {autoResolving && (
        <div style={{
          background: 'rgba(181,255,0,0.05)', border: '1px solid rgba(181,255,0,0.3)',
          borderRadius: '10px', padding: '14px 18px', marginBottom: '16px',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--lime)', letterSpacing: '0.5px' }}>
            ⏳ Verificando métricas en Twitter/X...
          </span>
        </div>
      )}
      {autoResolveError && !autoResolving && (
        <div style={{
          background: 'rgba(255,100,0,0.07)', border: '1px solid rgba(255,100,0,0.3)',
          borderRadius: '10px', padding: '14px 18px', marginBottom: '16px',
        }}>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#ff6600', marginBottom: '4px', fontWeight: 700 }}>
            AUTO-RESOLUCIÓN NO DISPONIBLE
          </div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--muted)', lineHeight: 1.5 }}>
            {autoResolveError}
          </div>
        </div>
      )}

      <div className="market-layout">

        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ background: '#050505' }}>
              <img src={market.meme.imageUrl} alt={market.meme.title}
                style={{ width: '100%', maxHeight: '460px', objectFit: 'contain', display: 'block' }}
                onError={e => { e.target.src = 'https://placehold.co/800x460/050505/1a1a1a?text=MEME' }} />
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                {isOpen ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--lime-dim)', border: '1px solid rgba(181,255,0,0.3)', borderRadius: '5px', padding: '3px 10px' }}>
                    <span className="live-dot" />
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', fontWeight: 700, color: 'var(--lime)', letterSpacing: '1.5px' }}>EN VIVO</span>
                  </div>
                ) : (
                  <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '5px', padding: '3px 10px' }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: 'var(--muted)', letterSpacing: '1.5px' }}>
                      {market.status === 'RESOLVED' ? 'RESUELTO' : 'CERRADO'}
                    </span>
                  </div>
                )}
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--muted)' }}>@{market.meme.creator.username}</span>

                {/* Tweet link */}
                {tweetUrlForDisplay && (
                  <a href={tweetUrlForDisplay} target="_blank" rel="noopener noreferrer" style={{
                    fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#1d9bf0',
                    border: '1px solid rgba(29,155,240,0.3)', borderRadius: '5px', padding: '3px 9px',
                    letterSpacing: '0.3px', display: 'flex', alignItems: 'center', gap: '5px',
                  }}>
                    𝕏 VER TWEET ↗
                  </a>
                )}

                {/* Resolution method badge */}
                {market.status === 'RESOLVED' && (
                  <div style={{
                    fontFamily: 'JetBrains Mono', fontSize: '9px', letterSpacing: '0.5px',
                    padding: '3px 9px', borderRadius: '5px',
                    background: market.resolvedBy === 'auto' ? 'rgba(29,155,240,0.1)' : 'rgba(255,214,10,0.1)',
                    color: market.resolvedBy === 'auto' ? '#1d9bf0' : 'var(--gold)',
                    border: `1px solid ${market.resolvedBy === 'auto' ? 'rgba(29,155,240,0.3)' : 'rgba(255,214,10,0.3)'}`,
                  }}>
                    {market.resolvedBy === 'auto' ? '🤖 AUTO VÍA TWITTER' : '👤 MANUAL'}
                  </div>
                )}
              </div>
              <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>{market.meme.title}</h1>
              <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.5 }}>{market.question}</p>
            </div>
          </div>

          {/* Tweet metrics panel — shown when auto-resolved or after auto-resolve attempt */}
          {tweetMetrics && (
            <div style={{ background: 'var(--surface)', border: '1px solid rgba(29,155,240,0.25)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#1d9bf0', letterSpacing: '2px', marginBottom: '16px' }}>
                𝕏 MÉTRICAS AL MOMENTO DE RESOLUCIÓN
              </div>
              {(() => {
                const metricKey = market.metric || 'total'
                const metricVal = tweetMetrics[metricKey] ?? tweetMetrics.total
                const rows = [
                  { k: 'likes', l: 'LIKES', v: tweetMetrics.likes },
                  { k: 'retweets', l: 'RETWEETS', v: tweetMetrics.retweets },
                  { k: 'replies', l: 'RESPUESTAS', v: tweetMetrics.replies },
                  { k: 'quotes', l: 'QUOTES', v: tweetMetrics.quotes },
                  { k: 'total', l: 'TOTAL', v: tweetMetrics.total },
                ]
                return (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px' }}>
                      {rows.map(m => {
                        const isTracked = m.k === metricKey
                        return (
                          <div key={m.l} style={{
                            background: isTracked ? 'rgba(29,155,240,0.12)' : 'var(--surface2)',
                            border: `1px solid ${isTracked ? 'rgba(29,155,240,0.5)' : 'var(--border)'}`,
                            borderRadius: '8px', padding: '12px', textAlign: 'center',
                          }}>
                            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '16px', fontWeight: 700, color: isTracked ? '#1d9bf0' : 'var(--muted)', marginBottom: '4px' }}>{m.v.toLocaleString()}</div>
                            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color: isTracked ? '#1d9bf0' : 'var(--muted)', letterSpacing: '0.5px' }}>
                              {m.l}{isTracked && ' ◄'}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div style={{ marginTop: '12px', fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--muted2)' }}>
                      Umbral: {market.threshold.toLocaleString()} {METRIC_LABELS[metricKey] || 'INTERACCIONES'} —{' '}
                      <span style={{ color: metricVal >= market.threshold ? 'var(--lime)' : 'var(--red)', fontWeight: 700 }}>
                        {metricVal >= market.threshold
                          ? `✓ SUPERADO (${((metricVal / market.threshold) * 100).toFixed(0)}%)`
                          : `✗ NO ALCANZÓ (${((metricVal / market.threshold) * 100).toFixed(0)}%)`}
                      </span>
                    </div>
                  </>
                )
              })()}
            </div>
          )}

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
            <div className="section-head" style={{ color: 'var(--muted)', marginBottom: '20px' }}>ESTADO DEL MERCADO</div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontFamily: 'Bebas Neue', fontSize: '48px', color: 'var(--lime)', letterSpacing: '2px', lineHeight: 1, textShadow: '0 0 30px rgba(181,255,0,0.25)' }}>SÍ {yesP}%</div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--muted)', letterSpacing: '1px', marginTop: '2px' }}>◈ {market.totalYes.toLocaleString()} en el pozo</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Bebas Neue', fontSize: '48px', color: 'var(--red)', letterSpacing: '2px', lineHeight: 1 }}>{noP}% NO</div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--muted)', letterSpacing: '1px', marginTop: '2px' }}>◈ {market.totalNo.toLocaleString()} en el pozo</div>
                </div>
              </div>
              <div style={{ height: '8px', background: 'var(--border2)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${yesP}%`, height: '100%', background: 'linear-gradient(90deg, var(--lime), #7fff00)', borderRadius: '4px', boxShadow: '0 0 12px rgba(181,255,0,0.4)' }} />
              </div>
            </div>
            <div className="market-stats-grid">
              {[
                { l: 'POZO TOTAL', v: `◈${total.toLocaleString()}`, c: 'var(--gold)' },
                { l: 'APUESTAS', v: market.bets.length, c: '#fff' },
                { l: 'PLATAFORMA', v: market.platform.toUpperCase(), c: 'var(--muted)' },
                { l: 'TIEMPO', v: tiempoRestante(market.deadline), c: isOpen ? 'var(--lime)' : 'var(--red)' },
              ].map(s => (
                <div key={s.l} className="stat-pill">
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', fontWeight: 700, color: s.c, marginBottom: '2px' }}>{s.v}</div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color: 'var(--muted)', letterSpacing: '0.5px' }}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '12px', fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--muted2)' }}>
              🎯 Umbral: {market.threshold.toLocaleString()} {METRIC_LABELS[market.metric] || 'INTERACCIONES'} en {market.platform.toUpperCase()}
              {market.tweetId && (
                <span style={{ marginLeft: '10px', color: '#1d9bf0' }}>· 🤖 Auto-resolución activa</span>
              )}
            </div>
          </div>

          {market.bets.length > 0 && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
              <div className="section-head" style={{ color: 'var(--muted)', marginBottom: '14px' }}>ACTIVIDAD RECIENTE</div>
              {market.bets.slice(0, 10).map((b, i) => (
                <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 9 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', fontWeight: 700, background: b.position ? 'var(--lime-dim)' : 'var(--red-dim)', color: b.position ? 'var(--lime)' : 'var(--red)', border: `1px solid ${b.position ? 'rgba(181,255,0,0.3)' : 'rgba(255,45,85,0.3)'}`, padding: '2px 8px', borderRadius: '4px', letterSpacing: '1px' }}>
                      {b.position ? 'SÍ' : 'NO'}
                    </span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#888' }}>@{b.user.username}</span>
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', fontWeight: 700, color: 'var(--gold)' }}>◈ {b.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Bet panel */}
        <div className="market-bet-sticky">
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            {autoResolving ? (
              <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: '22px', letterSpacing: '2px', color: '#1d9bf0', marginBottom: '10px' }}>
                  VERIFICANDO EN 𝕏
                </div>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.5px', lineHeight: 1.6 }}>
                  Consultando las métricas del tweet en Twitter API...
                </p>
              </div>
            ) : !isOpen ? (
              <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                  {market.status === 'RESOLVED' ? (market.result ? '✅' : '❌') : isExpiredOpen ? '⏳' : '⏰'}
                </div>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: '28px', letterSpacing: '2px', color: '#fff', marginBottom: '8px' }}>
                  {market.status === 'RESOLVED'
                    ? `${market.result ? 'SÍ' : 'NO'} GANÓ`
                    : isExpiredOpen ? 'RESOLVIENDO...' : 'MERCADO CERRADO'}
                </div>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.5px', lineHeight: 1.6 }}>
                  {market.status === 'RESOLVED'
                    ? `Los ganadores fueron pagados · ${market.resolvedBy === 'auto' ? 'Resuelto automáticamente vía Twitter' : 'Resuelto manualmente'}`
                    : isExpiredOpen && market.tweetId
                      ? 'Consultando Twitter API para auto-resolver...'
                      : 'Esperando resolución manual'}
                </p>
                {/* Manual resolve fallback: shown when expired, has no tweetId or auto-resolve failed */}
                {isExpiredOpen && autoResolveError && user && (
                  <Link href="/dashboard" style={{
                    display: 'inline-block', marginTop: '16px',
                    fontFamily: 'JetBrains Mono', fontSize: '11px',
                    background: 'var(--lime-dim)', color: 'var(--lime)',
                    border: '1px solid rgba(181,255,0,0.4)', borderRadius: '8px',
                    padding: '10px 18px', letterSpacing: '0.5px',
                  }}>
                    RESOLVER MANUALMENTE →
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: 'var(--lime)' }}>⚡ APOSTAR</div>
                  {user && <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--gold)' }}>◈ {user.credits.toLocaleString()}</div>}
                </div>

                <div style={{ padding: '20px' }}>
                  {msg.v && (
                    <div style={{ background: msg.t === 'ok' ? 'var(--lime-dim)' : 'var(--red-dim)', border: `1px solid ${msg.t === 'ok' ? 'rgba(181,255,0,0.3)' : 'rgba(255,45,85,0.3)'}`, color: msg.t === 'ok' ? 'var(--lime)' : 'var(--red)', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', fontFamily: 'JetBrains Mono', letterSpacing: '0.5px', marginBottom: '16px' }}>
                      {msg.v}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
                    {[
                      { k: 'si',  label: 'SÍ', pct: yesP, c: 'var(--lime)', bg: 'var(--lime-dim)', border: 'rgba(181,255,0,0.5)' },
                      { k: 'no', label: 'NO', pct: noP,  c: 'var(--red)',  bg: 'var(--red-dim)',  border: 'rgba(255,45,85,0.5)' },
                    ].map(o => (
                      <button key={o.k} onClick={() => setPos(o.k)} style={{ background: pos === o.k ? o.bg : 'var(--surface2)', border: `1px solid ${pos === o.k ? o.border : 'var(--border2)'}`, borderRadius: '10px', padding: '18px 10px', cursor: 'crosshair', transition: 'all 0.15s', boxShadow: pos === o.k ? `0 0 20px ${o.bg}` : 'none' }}>
                        <div style={{ fontFamily: 'Bebas Neue', fontSize: '32px', letterSpacing: '2px', color: pos === o.k ? o.c : 'var(--muted)', lineHeight: 1 }}>{o.label}</div>
                        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '18px', fontWeight: 700, color: pos === o.k ? o.c : '#555', marginTop: '2px' }}>{o.pct}%</div>
                      </button>
                    ))}
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label className="field-label">CRÉDITOS A APOSTAR</label>
                    <input type="number" value={amount} onChange={e => setAmount(Math.max(10, parseInt(e.target.value) || 10))}
                      style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: '8px', padding: '12px', color: 'var(--gold)', fontFamily: 'JetBrains Mono', fontSize: '28px', fontWeight: 700, textAlign: 'center', outline: 'none', boxSizing: 'border-box' }} min="10" />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginTop: '8px' }}>
                      {[50, 100, 250, 500].map(a => (
                        <button key={a} onClick={() => setAmount(a)} style={{ background: amount === a ? 'var(--border2)' : 'var(--surface2)', border: `1px solid ${amount === a ? 'var(--border2)' : 'var(--border)'}`, color: amount === a ? '#fff' : 'var(--muted)', fontFamily: 'JetBrains Mono', fontSize: '11px', fontWeight: 600, padding: '7px', borderRadius: '6px', cursor: 'crosshair' }}>
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>

                  {pos && (
                    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px', textAlign: 'center', marginBottom: '14px' }}>
                      <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: 'var(--muted)', letterSpacing: '1.5px', marginBottom: '4px' }}>PAGO ESTIMADO SI ACERTÁS</div>
                      <div style={{ fontFamily: 'JetBrains Mono', fontSize: '28px', fontWeight: 700, color: 'var(--gold)', letterSpacing: '-0.5px', textShadow: '0 0 20px rgba(255,214,10,0.3)' }}>◈ {payout.toLocaleString()}</div>
                      <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: 'var(--muted2)', marginTop: '2px' }}>
                        {payout > amount ? `+${(((payout - amount) / amount) * 100).toFixed(0)}% ROI` : 'CHANCES BAJAS — CONSIDERÁ EL OTRO LADO'}
                      </div>
                    </div>
                  )}

                  <button onClick={apostar} disabled={betting || !pos} className="btn-lime"
                    style={{ width: '100%', padding: '14px', borderRadius: '8px', fontSize: '14px', letterSpacing: '0.5px', opacity: (!pos || betting) ? 0.3 : 1 }}>
                    {betting ? 'EJECUTANDO...' : user ? `APOSTAR ${amount} ◈ A ${pos ? (pos === 'si' ? 'SÍ' : 'NO') : '?'}` : 'ENTRÁ PARA APOSTAR'}
                  </button>

                  <p style={{ textAlign: 'center', fontFamily: 'JetBrains Mono', fontSize: '9px', color: 'var(--muted2)', marginTop: '10px', letterSpacing: '1px' }}>
                    2% DE FEE DE PLATAFORMA SOBRE GANANCIAS
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
