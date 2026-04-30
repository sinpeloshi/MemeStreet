'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

function getTimeLeft(deadline) {
  const diff = new Date(deadline) - new Date()
  if (diff <= 0) return 'Expirado'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h > 24) return `${Math.floor(h / 24)}d restantes`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m restantes`
}

export default function MarketPage() {
  const { id } = useParams()
  const [market, setMarket] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [betAmount, setBetAmount] = useState(100)
  const [betPosition, setBetPosition] = useState(null)
  const [betting, setBetting] = useState(false)
  const [betMsg, setBetMsg] = useState({ type: '', text: '' })
  const router = useRouter()

  const loadData = () =>
    Promise.all([
      fetch(`/api/markets/${id}`).then(r => r.json()),
      fetch('/api/auth/me').then(r => r.json()),
    ]).then(([m, u]) => { setMarket(m); setUser(u.user); setLoading(false) })

  useEffect(() => { loadData() }, [id])

  const handleBet = async () => {
    if (!user) { router.push('/login'); return }
    if (!betPosition) { setBetMsg({ type: 'err', text: 'Seleccioná SÍ o NO primero' }); return }
    setBetting(true)
    setBetMsg({ type: '', text: '' })

    const res = await fetch(`/api/markets/${id}/bet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ position: betPosition === 'yes', amount: betAmount }),
    })
    const data = await res.json()

    if (!res.ok) {
      setBetMsg({ type: 'err', text: data.error })
      setBetting(false)
      return
    }

    setBetMsg({ type: 'ok', text: `✅ Apostaste ${betAmount} ◈ a ${betPosition === 'yes' ? 'SÍ' : 'NO'}!` })
    setUser(u => ({ ...u, credits: data.newCredits }))
    loadData()
    setBetting(false)
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px', color: '#00ff88', fontFamily: 'IBM Plex Mono', letterSpacing: '2px', fontSize: '12px' }}>
      CARGANDO MERCADO...
    </div>
  )

  if (!market || market.error) return (
    <div style={{ textAlign: 'center', padding: '80px', color: '#333' }}>Market no encontrado</div>
  )

  const total = market.totalYes + market.totalNo
  const yesP = total > 0 ? Math.round((market.totalYes / total) * 100) : 50
  const noP = 100 - yesP
  const isOpen = market.status === 'OPEN' && new Date() < new Date(market.deadline)
  const potentialPayout = betPosition === 'yes'
    ? Math.round(betAmount * (total + betAmount) / Math.max(market.totalYes + betAmount, 1))
    : Math.round(betAmount * (total + betAmount) / Math.max(market.totalNo + betAmount, 1))

  const cardStyle = {
    background: '#0d0d0d',
    border: '1px solid #1a1a1a',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
      {/* LEFT */}
      <div>
        {/* Meme image */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          <img
            src={market.meme.imageUrl}
            alt={market.meme.title}
            style={{ width: '100%', maxHeight: '420px', objectFit: 'contain', background: '#080808', display: 'block' }}
            onError={e => { e.target.src = 'https://placehold.co/600x400/111/333?text=meme' }}
          />
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              {isOpen && (
                <span style={{
                  background: 'rgba(0,255,136,0.1)',
                  border: '1px solid #00ff8844',
                  color: '#00ff88',
                  fontSize: '10px', fontWeight: 700,
                  padding: '3px 8px', borderRadius: '4px',
                  letterSpacing: '1px', fontFamily: 'IBM Plex Mono',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  <span className="pulse" style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00ff88', display: 'inline-block' }} />
                  LIVE
                </span>
              )}
              <span style={{ color: '#444', fontSize: '12px', fontFamily: 'IBM Plex Mono' }}>
                @{market.meme.creator.username}
              </span>
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.3px' }}>
              {market.meme.title}
            </h1>
            <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>{market.question}</p>
          </div>
        </div>

        {/* Stats */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '11px', color: '#444', letterSpacing: '1.5px', marginBottom: '16px', fontFamily: 'IBM Plex Mono' }}>
            ESTADO DEL MERCADO
          </h3>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#00ff88', fontWeight: 700, fontFamily: 'IBM Plex Mono', fontSize: '20px' }}>SÍ {yesP}%</span>
              <span style={{ color: '#ff3b3b', fontWeight: 700, fontFamily: 'IBM Plex Mono', fontSize: '20px' }}>{noP}% NO</span>
            </div>
            <div style={{ height: '6px', background: '#1a1a1a', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                width: `${yesP}%`, height: '100%',
                background: 'linear-gradient(90deg, #00ff88, #00ccff)',
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {[
              { label: 'TOTAL POOL', value: `◈ ${total.toLocaleString()}`, color: '#f5a623' },
              { label: 'APUESTAS', value: market.bets.length, color: '#e8e8e8' },
              { label: 'PLATAFORMA', value: market.platform.toUpperCase(), color: '#888' },
              { label: 'TIEMPO', value: getTimeLeft(market.deadline), color: '#888' },
            ].map(s => (
              <div key={s.label} style={{
                background: '#111', border: '1px solid #1a1a1a',
                borderRadius: '8px', padding: '12px', textAlign: 'center',
              }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: s.color, fontFamily: 'IBM Plex Mono', marginBottom: '2px' }}>{s.value}</div>
                <div style={{ fontSize: '9px', color: '#333', letterSpacing: '1px', fontFamily: 'IBM Plex Mono' }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '12px', fontSize: '12px', color: '#333', fontFamily: 'IBM Plex Mono' }}>
            🎯 Umbral: {market.threshold.toLocaleString()} interacciones en {market.platform}
          </div>
        </div>

        {/* Recent bets */}
        {market.bets.length > 0 && (
          <div style={cardStyle}>
            <h3 style={{ fontSize: '11px', color: '#444', letterSpacing: '1.5px', marginBottom: '14px', fontFamily: 'IBM Plex Mono' }}>
              ÚLTIMAS APUESTAS
            </h3>
            {market.bets.slice(0, 10).map(bet => (
              <div key={bet.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 0', borderBottom: '1px solid #111',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    background: bet.position ? 'rgba(0,255,136,0.1)' : 'rgba(255,59,59,0.1)',
                    color: bet.position ? '#00ff88' : '#ff3b3b',
                    border: `1px solid ${bet.position ? '#00ff8833' : '#ff3b3b33'}`,
                    fontSize: '10px', fontWeight: 700, fontFamily: 'IBM Plex Mono',
                    padding: '2px 8px', borderRadius: '4px',
                  }}>
                    {bet.position ? 'SÍ' : 'NO'}
                  </span>
                  <span style={{ fontSize: '13px', color: '#888' }}>@{bet.user.username}</span>
                </div>
                <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '13px', color: '#f5a623' }}>
                  ◈ {bet.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT: Bet panel */}
      <div style={{ position: 'sticky', top: '72px' }}>
        <div style={{
          background: '#0d0d0d',
          border: '1px solid #1a1a1a',
          borderRadius: '12px',
          padding: '20px',
        }}>
          {!isOpen ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>
                {market.status === 'RESOLVED' ? (market.result ? '✅' : '❌') : '⏰'}
              </div>
              <p style={{ fontWeight: 700, fontSize: '16px', margin: '0 0 6px' }}>
                {market.status === 'RESOLVED'
                  ? `Resultado: ${market.result ? 'SÍ viral' : 'NO viral'}`
                  : 'Mercado cerrado'}
              </p>
              <p style={{ color: '#444', fontSize: '13px', margin: 0 }}>
                {market.status === 'RESOLVED' ? 'Los ganadores cobraron' : 'Esperando resolución'}
              </p>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: '12px', letterSpacing: '1.5px', color: '#444', fontFamily: 'IBM Plex Mono', marginBottom: '16px', textAlign: 'center' }}>
                ⚡ APOSTAR
              </h2>

              {betMsg.text && (
                <div style={{
                  background: betMsg.type === 'ok' ? 'rgba(0,255,136,0.1)' : 'rgba(255,59,59,0.1)',
                  border: `1px solid ${betMsg.type === 'ok' ? '#00ff8833' : '#ff3b3b33'}`,
                  color: betMsg.type === 'ok' ? '#00ff88' : '#ff3b3b',
                  padding: '10px 14px', borderRadius: '8px',
                  fontSize: '13px', marginBottom: '14px', textAlign: 'center',
                }}>
                  {betMsg.text}
                </div>
              )}

              {/* YES / NO buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                {[
                  { key: 'yes', label: 'SÍ VIRAL', pct: yesP, color: '#00ff88', bg: 'rgba(0,255,136,0.1)', border: '#00ff88' },
                  { key: 'no', label: 'NO VIRAL', pct: noP, color: '#ff3b3b', bg: 'rgba(255,59,59,0.1)', border: '#ff3b3b' },
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setBetPosition(opt.key)}
                    style={{
                      background: betPosition === opt.key ? opt.bg : '#111',
                      border: `1px solid ${betPosition === opt.key ? opt.border : '#1e1e1e'}`,
                      color: betPosition === opt.key ? opt.color : '#555',
                      padding: '14px 8px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      fontFamily: 'IBM Plex Mono',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '12px', letterSpacing: '1px', marginBottom: '2px' }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 700 }}>{opt.pct}%</div>
                  </button>
                ))}
              </div>

              {/* Amount */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#444', fontFamily: 'IBM Plex Mono', letterSpacing: '1px', marginBottom: '8px' }}>
                  CRÉDITOS A APOSTAR
                </label>
                <input
                  type="number"
                  value={betAmount}
                  onChange={e => setBetAmount(Math.max(10, parseInt(e.target.value) || 10))}
                  style={{
                    width: '100%', background: '#111', border: '1px solid #1e1e1e',
                    borderRadius: '8px', padding: '10px', color: '#f5a623',
                    fontSize: '22px', fontWeight: 700, textAlign: 'center',
                    outline: 'none', fontFamily: 'IBM Plex Mono', boxSizing: 'border-box',
                  }}
                  min="10"
                />
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  {[50, 100, 250, 500].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setBetAmount(amt)}
                      style={{
                        flex: 1, background: '#111', border: '1px solid #1e1e1e',
                        color: '#555', fontSize: '11px', padding: '6px',
                        borderRadius: '6px', cursor: 'pointer',
                        fontFamily: 'IBM Plex Mono',
                        transition: 'color 0.15s, border-color 0.15s',
                      }}
                      onMouseEnter={e => { e.target.style.color = '#f5a623'; e.target.style.borderColor = '#f5a62333' }}
                      onMouseLeave={e => { e.target.style.color = '#555'; e.target.style.borderColor = '#1e1e1e' }}
                    >
                      {amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payout preview */}
              {betPosition && (
                <div style={{
                  background: '#111', border: '1px solid #1a1a1a',
                  borderRadius: '8px', padding: '12px',
                  textAlign: 'center', marginBottom: '12px',
                }}>
                  <div style={{ fontSize: '11px', color: '#333', fontFamily: 'IBM Plex Mono', letterSpacing: '1px' }}>PAGO ESTIMADO SI ACERTÁS</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#f5a623', fontFamily: 'IBM Plex Mono', marginTop: '2px' }}>
                    ◈ {potentialPayout.toLocaleString()}
                  </div>
                </div>
              )}

              {user && (
                <div style={{ fontSize: '11px', color: '#333', fontFamily: 'IBM Plex Mono', textAlign: 'center', marginBottom: '10px' }}>
                  Tu saldo: ◈ {user.credits.toLocaleString()}
                </div>
              )}

              <button
                onClick={handleBet}
                disabled={betting}
                style={{
                  width: '100%',
                  background: betting ? '#1a1a1a' : 'linear-gradient(135deg, #00ff88, #00ccff)',
                  color: betting ? '#555' : '#000',
                  fontWeight: 800, fontSize: '14px', padding: '13px',
                  borderRadius: '8px', border: 'none',
                  cursor: betting ? 'not-allowed' : 'pointer',
                  fontFamily: 'Syne', letterSpacing: '0.5px',
                }}
              >
                {betting ? 'APOSTANDO...' : user ? 'APOSTAR' : 'LOGIN PARA APOSTAR'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}