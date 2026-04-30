'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

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
  const router = useRouter()

  const load = () => Promise.all([
    fetch(`/api/markets/${id}`).then(r => r.json()),
    fetch('/api/auth/me').then(r => r.json()),
  ]).then(([m, u]) => { setMarket(m); setUser(u.user); setLoading(false) })

  useEffect(() => { load() }, [id])

  const apostar = async () => {
    if (!user) { router.push('/login'); return }
    if (!pos) { setMsg({ t: 'err', v: 'Seleccioná SÍ o NO primero' }); return }
    setBetting(true); setMsg({ t: '', v: '' })
    const res = await fetch(`/api/markets/${id}/bet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ position: pos === 'si', amount }),
    })
    const data = await res.json()
    if (!res.ok) { setMsg({ t: 'err', v: data.error }); setBetting(false); return }
    setMsg({ t: 'ok', v: `✅ APUESTA REGISTRADA — ${amount} ◈ en ${pos === 'si' ? 'SÍ' : 'NO'}` })
    setUser(u => ({ ...u, credits: data.newCredits }))
    load(); setBetting(false)
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
  const payout = pos === 'si'
    ? Math.round(amount * (total + amount) / Math.max(market.totalYes + amount, 1))
    : Math.round(amount * (total + amount) / Math.max(market.totalNo + amount, 1))

  return (
    <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '32px 20px' }}>
      <Link href="/" style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--muted)', letterSpacing: '1px', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '28px' }}>
        ← VOLVER A MERCADOS
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>

        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ background: '#050505' }}>
              <img src={market.meme.imageUrl} alt={market.meme.title}
                style={{ width: '100%', maxHeight: '460px', objectFit: 'contain', display: 'block' }}
                onError={e => { e.target.src = 'https://placehold.co/800x460/050505/1a1a1a?text=MEME' }} />
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
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
              </div>
              <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>{market.meme.title}</h1>
              <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.5 }}>{market.question}</p>
            </div>
          </div>

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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
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
              🎯 Umbral: {market.threshold.toLocaleString()} interacciones en {market.platform}
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

        {/* RIGHT */}
        <div style={{ position: 'sticky', top: '90px' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            {!isOpen ? (
              <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                  {market.status === 'RESOLVED' ? (market.result ? '✅' : '❌') : '⏰'}
                </div>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: '28px', letterSpacing: '2px', color: '#fff', marginBottom: '8px' }}>
                  {market.status === 'RESOLVED' ? `${market.result ? 'SÍ' : 'NO'} GANÓ` : 'MERCADO CERRADO'}
                </div>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.5px' }}>
                  {market.status === 'RESOLVED' ? 'Los ganadores fueron pagados' : 'Esperando resolución'}
                </p>
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