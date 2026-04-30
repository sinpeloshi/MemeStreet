'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function tiempoRestante(d) {
  const ms = new Date(d) - new Date()
  if (ms <= 0) return 'EXPIRADO'
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000)
  if (h > 24) return `${Math.floor(h / 24)}d restantes`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function fechaCorta(d) {
  return new Date(d).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: '2-digit' })
}

// ── Bet card ─────────────────────────────────────────────────────────────────
function BetCard({ bet }) {
  const isActive = bet.market.status === 'OPEN' && new Date() < new Date(bet.market.deadline)
  const isResolved = bet.market.status === 'RESOLVED'
  const won = isResolved && bet.position === bet.market.result

  return (
    <Link href={`/market/${bet.market.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        background: 'var(--surface)',
        border: `1px solid ${won ? 'rgba(181,255,0,0.25)' : (!isActive && isResolved) ? 'rgba(255,45,85,0.15)' : 'var(--border)'}`,
        borderRadius: '12px', padding: '16px', marginBottom: '10px',
        transition: 'border-color 0.2s, transform 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'none'}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
          <p style={{ fontSize: '13px', fontWeight: 500, color: '#ccc', lineHeight: 1.4, flex: 1, margin: 0 }}>
            {bet.market.question}
          </p>
          <span style={{
            fontFamily: 'JetBrains Mono', fontSize: '10px', fontWeight: 700,
            background: bet.position ? 'var(--lime-dim)' : 'var(--red-dim)',
            color: bet.position ? 'var(--lime)' : 'var(--red)',
            border: `1px solid ${bet.position ? 'rgba(181,255,0,0.3)' : 'rgba(255,45,85,0.3)'}`,
            padding: '3px 8px', borderRadius: '5px', whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {bet.position ? 'SÍ' : 'NO'}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--gold)', fontWeight: 700 }}>
              ◈ {bet.amount.toLocaleString()}
            </span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--muted)' }}>
              {isActive ? tiempoRestante(bet.market.deadline) : fechaCorta(bet.createdAt)}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isActive && (
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--lime)', letterSpacing: '0.5px' }}>
                ● ACTIVA
              </span>
            )}
            {won && (
              <>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--lime)' }}>✅ GANADA</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', fontWeight: 700, color: 'var(--lime)' }}>
                  +◈ {(bet.payout || 0).toLocaleString()}
                </span>
              </>
            )}
            {!isActive && isResolved && !won && (
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--red)' }}>❌ PERDIDA</span>
            )}
            {bet.market.status === 'CANCELLED' && (
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--muted)' }}>CANCELADA</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

// ── Market card (mis mercados) ────────────────────────────────────────────────
function MarketCard({ market, onResolve }) {
  const isOpen = market.status === 'OPEN' && new Date() < new Date(market.deadline)
  const isExpired = market.status === 'OPEN' && new Date() >= new Date(market.deadline)
  const isResolved = market.status === 'RESOLVED'
  const total = market.totalYes + market.totalNo

  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${isOpen || isExpired ? 'rgba(181,255,0,0.18)' : 'var(--border)'}`,
      borderRadius: '12px', padding: '16px', marginBottom: '10px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px', lineHeight: 1.4 }}>{market.question}</p>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--muted)' }}>{market.meme.title}</p>
        </div>
        <span style={{
          fontFamily: 'JetBrains Mono', fontSize: '9px', fontWeight: 700, letterSpacing: '1px',
          padding: '3px 8px', borderRadius: '5px', whiteSpace: 'nowrap', flexShrink: 0,
          background: isOpen ? 'var(--lime-dim)' : isExpired ? 'rgba(255,100,0,0.1)' : isResolved ? 'rgba(255,214,10,0.1)' : 'var(--surface2)',
          color: isOpen ? 'var(--lime)' : isExpired ? '#ff6600' : isResolved ? 'var(--gold)' : 'var(--muted)',
          border: `1px solid ${isOpen ? 'rgba(181,255,0,0.3)' : isExpired ? 'rgba(255,100,0,0.3)' : isResolved ? 'rgba(255,214,10,0.3)' : 'var(--border)'}`,
        }}>
          {isOpen ? '● EN VIVO' : isExpired ? '⏰ PENDIENTE' : isResolved ? `${market.result ? 'SÍ' : 'NO'} GANÓ` : 'CANCELADO'}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--gold)' }}>
            ◈ {total.toLocaleString()} en pozo
          </span>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--muted)' }}>
            {market._count.bets} apuesta{market._count.bets !== 1 ? 's' : ''}
          </span>
          {isOpen && (
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--lime)' }}>
              {tiempoRestante(market.deadline)}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href={`/market/${market.id}`} style={{
            fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--muted)',
            border: '1px solid var(--border)', borderRadius: '6px', padding: '6px 12px',
            letterSpacing: '0.3px',
          }}>VER →</Link>
          {(isOpen || isExpired) && (
            <button onClick={onResolve} style={{
              fontFamily: 'JetBrains Mono', fontSize: '10px', fontWeight: 700,
              background: 'var(--lime-dim)', color: 'var(--lime)',
              border: '1px solid rgba(181,255,0,0.4)', borderRadius: '6px',
              padding: '6px 14px', cursor: 'crosshair', letterSpacing: '0.3px',
            }}>
              RESOLVER ⚡
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Resolve modal ──────────────────────────────────────────────────────────────
function ResolveModal({ market, onClose, onResolve, loading }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--surface)', border: '1px solid var(--border2)',
        borderRadius: '16px', padding: '32px', maxWidth: '440px', width: '100%',
      }}>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--lime)', letterSpacing: '2px', marginBottom: '12px' }}>
          ⚡ RESOLVER MERCADO
        </div>
        <p style={{ fontSize: '15px', fontWeight: 600, lineHeight: 1.5, marginBottom: '8px' }}>
          {market.question}
        </p>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--muted)', marginBottom: '28px', lineHeight: 1.6 }}>
          Esta acción distribuye los créditos a los ganadores y no se puede deshacer.
          Solo resolvé cuando tengas certeza del resultado.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
          <button onClick={() => onResolve(true)} disabled={loading} style={{
            background: 'var(--lime-dim)', border: '2px solid rgba(181,255,0,0.5)',
            color: 'var(--lime)', fontFamily: 'Bebas Neue', fontSize: '30px',
            letterSpacing: '2px', padding: '20px', borderRadius: '10px',
            cursor: loading ? 'not-allowed' : 'crosshair', opacity: loading ? 0.4 : 1,
            transition: 'opacity 0.15s',
          }}>
            SÍ GANÓ
          </button>
          <button onClick={() => onResolve(false)} disabled={loading} style={{
            background: 'var(--red-dim)', border: '2px solid rgba(255,45,85,0.5)',
            color: 'var(--red)', fontFamily: 'Bebas Neue', fontSize: '30px',
            letterSpacing: '2px', padding: '20px', borderRadius: '10px',
            cursor: loading ? 'not-allowed' : 'crosshair', opacity: loading ? 0.4 : 1,
            transition: 'opacity 0.15s',
          }}>
            NO GANÓ
          </button>
        </div>
        <button onClick={onClose} style={{
          width: '100%', background: 'none', border: '1px solid var(--border)',
          color: 'var(--muted)', fontFamily: 'JetBrains Mono', fontSize: '11px',
          padding: '10px', borderRadius: '8px', cursor: 'crosshair',
        }}>
          CANCELAR
        </button>
      </div>
    </div>
  )
}

// ── Buy credits modal ──────────────────────────────────────────────────────────
const PACKS = [
  { label: 'STARTER', credits: 500, price: 'USD $1', bonus: null, color: 'var(--muted)' },
  { label: 'PRO', credits: 3000, price: 'USD $5', bonus: '+20% BONUS', color: 'var(--lime)' },
  { label: 'WHALE', credits: 15000, price: 'USD $20', bonus: '+50% BONUS', color: 'var(--gold)' },
  { label: 'SHARK', credits: 50000, price: 'USD $60', bonus: '+100% BONUS', color: '#ff6600' },
]

function BuyCreditsModal({ onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--surface)', border: '1px solid var(--border2)',
        borderRadius: '16px', padding: '32px', maxWidth: '500px', width: '100%',
      }}>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--gold)', letterSpacing: '2px', marginBottom: '8px' }}>
          ◈ COMPRAR CRÉDITOS
        </div>
        <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '36px', letterSpacing: '2px', marginBottom: '4px' }}>
          CARGÁ TU CUENTA
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '24px' }}>
          Los créditos nunca expiran. Apostá cuando quieras.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }}>
          {PACKS.map(p => (
            <div key={p.label} style={{
              background: 'var(--surface2)', border: '1px solid var(--border2)',
              borderRadius: '10px', padding: '16px', textAlign: 'center',
              opacity: 0.75, position: 'relative',
            }}>
              {p.bonus && (
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: p.color, fontWeight: 700, marginBottom: '6px', letterSpacing: '1px' }}>
                  {p.bonus}
                </div>
              )}
              <div style={{ fontFamily: 'Bebas Neue', fontSize: '20px', letterSpacing: '1px', color: p.color }}>
                {p.label}
              </div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '18px', fontWeight: 700, color: '#fff', margin: '4px 0' }}>
                ◈ {p.credits.toLocaleString()}
              </div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--muted)' }}>
                {p.price}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          background: 'rgba(255,214,10,0.07)', border: '1px solid rgba(255,214,10,0.2)',
          borderRadius: '10px', padding: '16px', textAlign: 'center', marginBottom: '16px',
        }}>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--gold)', fontWeight: 700, marginBottom: '6px' }}>
            🚀 PRÓXIMAMENTE
          </div>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--muted)', lineHeight: 1.6 }}>
            Integración con Mercado Pago, Stripe y PayPal en camino.
            <br />Escribinos a <span style={{ color: 'var(--lime)' }}>hola@memeo.gg</span> para acceso anticipado.
          </p>
        </div>

        <button onClick={onClose} style={{
          width: '100%', background: 'none', border: '1px solid var(--border)',
          color: 'var(--muted)', fontFamily: 'JetBrains Mono', fontSize: '11px',
          padding: '10px', borderRadius: '8px', cursor: 'crosshair',
        }}>
          CERRAR
        </button>
      </div>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
function Empty({ text, cta }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontFamily: 'Bebas Neue', fontSize: '40px', color: 'var(--border2)', letterSpacing: '3px', marginBottom: '12px' }}>
        VACÍO
      </div>
      <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: cta ? '20px' : 0 }}>{text}</p>
      {cta && (
        <Link href={cta.href} className="btn-lime" style={{
          padding: '10px 24px', borderRadius: '8px', display: 'inline-block', fontSize: '13px',
        }}>
          {cta.label}
        </Link>
      )}
    </div>
  )
}

// ── Main dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [data, setData] = useState(null)
  const [tab, setTab] = useState('apuestas')
  const [resolveTarget, setResolveTarget] = useState(null)
  const [resolving, setResolving] = useState(false)
  const [showBuy, setShowBuy] = useState(false)
  const [msg, setMsg] = useState('')
  const router = useRouter()

  const cargar = () =>
    fetch('/api/user/stats')
      .then(r => { if (r.status === 401) { router.push('/login'); return null } return r.json() })
      .then(d => d && setData(d))

  useEffect(() => { cargar() }, [])

  const resolver = async (result) => {
    if (!resolveTarget) return
    setResolving(true)
    try {
      const res = await fetch(`/api/markets/${resolveTarget.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result }),
      })
      const data = await res.json()
      if (res.ok) {
        setResolveTarget(null)
        setMsg(`✅ Mercado resuelto — ${data.winners} ganadores pagados`)
        cargar()
        setTimeout(() => setMsg(''), 4000)
      } else {
        setMsg(`⚠ ${data.error}`)
        setTimeout(() => setMsg(''), 4000)
      }
    } catch {
      setMsg('⚠ Error de conexión')
      setTimeout(() => setMsg(''), 4000)
    } finally {
      setResolving(false)
    }
  }

  if (!data) return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <div style={{ fontFamily: 'Bebas Neue', fontSize: '28px', letterSpacing: '4px', color: 'var(--lime)' }}>
        CARGANDO...
      </div>
    </div>
  )

  const { user, stats, activeBets, resolvedBets, myMarkets } = data

  const statCards = [
    { l: 'CRÉDITOS', v: `◈ ${user.credits.toLocaleString()}`, c: 'var(--gold)', s: 'disponibles' },
    { l: 'APUESTAS ACTIVAS', v: stats.activeBets, c: 'var(--lime)', s: `de ${stats.totalBets} totales` },
    {
      l: 'WIN RATE',
      v: stats.winRate !== null ? `${stats.winRate}%` : '—',
      c: stats.winRate === null ? 'var(--muted)' : stats.winRate >= 50 ? 'var(--lime)' : 'var(--red)',
      s: `${stats.wonBets}G / ${stats.lostBets}P`,
    },
    {
      l: 'P&L NETO',
      v: stats.netPL === 0 ? '◈ 0' : `${stats.netPL > 0 ? '+' : ''}◈ ${stats.netPL.toLocaleString()}`,
      c: stats.netPL > 0 ? 'var(--lime)' : stats.netPL < 0 ? 'var(--red)' : 'var(--muted)',
      s: 'en créditos',
    },
  ]

  const tabs = [
    { id: 'apuestas', label: 'APUESTAS ACTIVAS', count: stats.activeBets },
    { id: 'historial', label: 'HISTORIAL', count: resolvedBets.length },
    { id: 'mercados', label: 'MIS MERCADOS', count: myMarkets.length },
  ]

  return (
    <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '32px 20px 80px' }}>

      {/* Toast */}
      {msg && (
        <div style={{
          position: 'fixed', top: '90px', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--surface)', border: '1px solid var(--border2)',
          borderRadius: '10px', padding: '12px 20px',
          fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#fff',
          zIndex: 500, boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          whiteSpace: 'nowrap',
        }}>
          {msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--lime)', letterSpacing: '3px', marginBottom: '10px' }}>
            ◈ MI CUENTA
          </div>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 900, fontSize: 'clamp(28px, 5vw, 40px)', letterSpacing: '-1px', color: '#fff', marginBottom: '6px' }}>
            @{user.username}
          </h1>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--muted)' }}>
            Miembro desde {new Date(user.createdAt).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
            {' · '}{stats.totalBets} apuesta{stats.totalBets !== 1 ? 's' : ''} realizadas
          </p>
        </div>
        <button onClick={() => setShowBuy(true)} style={{
          background: 'linear-gradient(135deg, #ffd60a, #ff9500)',
          color: '#000', fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: '12px',
          padding: '12px 20px', borderRadius: '10px', border: 'none', cursor: 'crosshair',
          letterSpacing: '0.5px', boxShadow: '0 4px 20px rgba(255,214,10,0.25)', whiteSpace: 'nowrap',
        }}>
          + COMPRAR CRÉDITOS
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '32px' }}>
        {statCards.map(s => (
          <div key={s.l} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 20px' }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: 'var(--muted)', letterSpacing: '2px', marginBottom: '10px' }}>
              {s.l}
            </div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '22px', fontWeight: 700, color: s.c, letterSpacing: '-0.5px', marginBottom: '4px' }}>
              {s.v}
            </div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--muted2)' }}>
              {s.s}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '20px', overflowX: 'auto' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: 'none', border: 'none',
            borderBottom: tab === t.id ? '2px solid var(--lime)' : '2px solid transparent',
            color: tab === t.id ? '#fff' : 'var(--muted)',
            fontFamily: 'JetBrains Mono', fontSize: '10px', fontWeight: 700,
            letterSpacing: '1px', padding: '12px 16px', cursor: 'crosshair',
            transition: 'color 0.15s', whiteSpace: 'nowrap',
          }}>
            {t.label}
            {t.count > 0 && (
              <span style={{
                marginLeft: '8px',
                background: tab === t.id ? 'var(--lime)' : 'var(--surface2)',
                color: tab === t.id ? '#000' : 'var(--muted)',
                fontFamily: 'JetBrains Mono', fontSize: '10px', fontWeight: 700,
                padding: '1px 6px', borderRadius: '4px',
              }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'apuestas' && (
        activeBets.length === 0
          ? <Empty text="No tenés apuestas activas en este momento." cta={{ href: '/', label: '→ EXPLORAR MERCADOS' }} />
          : activeBets.map(b => <BetCard key={b.id} bet={b} />)
      )}

      {tab === 'historial' && (
        resolvedBets.length === 0
          ? <Empty text="Todavía no hay apuestas resueltas en tu historial." />
          : resolvedBets.map(b => <BetCard key={b.id} bet={b} />)
      )}

      {tab === 'mercados' && (
        myMarkets.length === 0
          ? <Empty text="No creaste ningún mercado todavía." cta={{ href: '/crear', label: '→ CREAR MERCADO' }} />
          : myMarkets.map(m => (
              <MarketCard
                key={m.id}
                market={m}
                onResolve={() => setResolveTarget({ id: m.id, question: m.question })}
              />
            ))
      )}

      {/* Resolve modal */}
      {resolveTarget && (
        <ResolveModal
          market={resolveTarget}
          onClose={() => !resolving && setResolveTarget(null)}
          onResolve={resolver}
          loading={resolving}
        />
      )}

      {/* Buy credits modal */}
      {showBuy && <BuyCreditsModal onClose={() => setShowBuy(false)} />}

    </div>
  )
}
