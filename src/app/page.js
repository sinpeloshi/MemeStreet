import Link from 'next/link'
import { prisma } from '@/lib/db'

export const revalidate = 0

function timeLeft(d) {
  const ms = new Date(d) - new Date()
  if (ms <= 0) return 'EXPIRED'
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  if (h > 24) return `${Math.floor(h / 24)}D LEFT`
  if (h > 0) return `${h}H ${m}M`
  return `${m}M LEFT`
}

function MemeCard({ market }) {
  const total = market.totalYes + market.totalNo
  const yesP = total > 0 ? Math.round((market.totalYes / total) * 100) : 50
  const noP = 100 - yesP
  const isLive = market.status === 'OPEN' && new Date() < new Date(market.deadline)
  const isResolved = market.status === 'RESOLVED'

  return (
    <Link href={`/market/${market.id}`} className="mcard">
      {/* Image */}
      <div style={{ height: '190px', background: '#080808', overflow: 'hidden', position: 'relative' }}>
        <img
          src={market.meme.imageUrl}
          alt={market.meme.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
          onError={e => { e.target.src = 'https://placehold.co/400x200/0a0a0a/1a1a1a?text=MEME' }}
        />
        {/* Overlay gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)',
        }} />
        {/* Status badge */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: '6px', alignItems: 'center' }}>
          {isLive && (
            <div style={{
              background: 'rgba(0,0,0,0.7)',
              border: '1px solid rgba(181,255,0,0.4)',
              borderRadius: '5px',
              padding: '3px 8px',
              display: 'flex', alignItems: 'center', gap: '5px',
            }}>
              <span className="live-dot" />
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', fontWeight: 700, color: 'var(--lime)', letterSpacing: '1px' }}>LIVE</span>
            </div>
          )}
          {isResolved && (
            <div style={{
              background: 'rgba(0,0,0,0.7)',
              border: '1px solid rgba(255,214,10,0.4)',
              borderRadius: '5px',
              padding: '3px 8px',
            }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', fontWeight: 700, color: 'var(--gold)', letterSpacing: '1px' }}>RESOLVED</span>
            </div>
          )}
        </div>
        {/* Creator */}
        <div style={{ position: 'absolute', bottom: 10, left: 12 }}>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
            @{market.meme.creator.username}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '14px' }}>
        <p style={{
          fontSize: '13px',
          fontWeight: 500,
          lineHeight: 1.45,
          color: '#ccc',
          marginBottom: '14px',
          minHeight: '38px',
        }}>
          {market.question}
        </p>

        {/* Probability bar */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{
              fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: '13px',
              color: 'var(--lime)',
            }}>
              YES {yesP}%
            </span>
            <span style={{
              fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: '13px',
              color: 'var(--red)',
            }}>
              {noP}% NO
            </span>
          </div>
          <div style={{ height: '4px', background: 'var(--border2)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              width: `${yesP}%`, height: '100%',
              background: `linear-gradient(90deg, var(--lime), #7fff00)`,
              borderRadius: '2px',
              transition: 'width 0.6s ease',
            }} />
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '6px',
        }}>
          {[
            { label: 'POOL', value: `◈${total.toLocaleString()}` },
            { label: 'BETS', value: market._count.bets },
            { label: 'TIME', value: timeLeft(market.deadline) },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '7px',
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', fontWeight: 700, color: '#bbb', marginBottom: '1px' }}>
                {s.value}
              </div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color: 'var(--muted)', letterSpacing: '0.5px' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Link>
  )
}

export default async function HomePage() {
  const markets = await prisma.market.findMany({
    include: {
      meme: { include: { creator: { select: { username: true } } } },
      _count: { select: { bets: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  const totalPool = markets.reduce((s, m) => s + m.totalYes + m.totalNo, 0)
  const totalBets = markets.reduce((s, m) => s + m._count.bets, 0)
  const live = markets.filter(m => m.status === 'OPEN' && new Date() < new Date(m.deadline))
  const rest = markets.filter(m => !(m.status === 'OPEN' && new Date() < new Date(m.deadline)))

  return (
    <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 20px' }}>

      {/* HERO */}
      <div style={{ padding: '56px 0 48px', borderBottom: '1px solid var(--border)' }}>
        <div className="anim-1" style={{
          fontFamily: 'JetBrains Mono',
          fontSize: '10px',
          color: 'var(--lime)',
          letterSpacing: '3px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span className="live-dot" />
          DISRUPTING VIRALITY AT SCALE™
        </div>

        <h1 className="anim-2" style={{
          fontFamily: 'Bebas Neue',
          fontSize: 'clamp(52px, 8vw, 96px)',
          letterSpacing: '3px',
          lineHeight: 0.95,
          marginBottom: '20px',
          color: '#fff',
        }}>
          THE MEME<br />
          <span style={{ color: 'var(--lime)', textShadow: '0 0 40px rgba(181,255,0,0.3)' }}>
            ECONOMY
          </span><br />
          IS HERE
        </h1>

        <p className="anim-3" style={{
          fontSize: '15px',
          color: 'var(--muted)',
          maxWidth: '460px',
          lineHeight: 1.6,
          marginBottom: '32px',
        }}>
          We're making the world a better place — through meme prediction markets.
          Apostá a qué va a ser viral. Ganá créditos. Repetí.
        </p>

        <div className="anim-4" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link href="/register" className="btn-lime" style={{
            padding: '12px 28px',
            borderRadius: '8px',
            fontSize: '14px',
            letterSpacing: '0.5px',
            display: 'inline-flex', alignItems: 'center', gap: '8px',
          }}>
            🚀 START TRADING MEMES
          </Link>
          <Link href="/create" style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: '1px solid var(--border2)',
            color: '#888',
            fontSize: '14px',
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            transition: 'color 0.15s, border-color 0.15s',
          }}>
            + LAUNCH A MEME
          </Link>
        </div>
      </div>

      {/* STATS BAR */}
      <div className="anim-5" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '10px',
        padding: '24px 0',
        borderBottom: '1px solid var(--border)',
        marginBottom: '40px',
      }}>
        {[
          { label: 'TOTAL POOL LOCKED', value: `◈ ${totalPool.toLocaleString()}`, color: 'var(--gold)' },
          { label: 'ACTIVE MARKETS', value: live.length, color: 'var(--lime)' },
          { label: 'TOTAL BETS', value: totalBets.toLocaleString(), color: '#fff' },
          { label: 'MEMES LAUNCHED', value: markets.length, color: '#fff' },
        ].map(s => (
          <div key={s.label} className="stat-pill">
            <div style={{
              fontFamily: 'JetBrains Mono',
              fontSize: '20px',
              fontWeight: 700,
              color: s.color,
              marginBottom: '3px',
              letterSpacing: '-0.5px',
            }}>
              {s.value}
            </div>
            <div style={{
              fontFamily: 'JetBrains Mono',
              fontSize: '9px',
              color: 'var(--muted)',
              letterSpacing: '1.5px',
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* MARKETS */}
      {markets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: '48px', color: 'var(--border2)', letterSpacing: '3px', marginBottom: '16px' }}>
            NO MEMES YET
          </div>
          <p style={{ color: 'var(--muted)', marginBottom: '24px', fontSize: '14px' }}>
            Be the visionary that disrupts the meme economy
          </p>
          <Link href="/create" className="btn-lime" style={{ padding: '12px 28px', borderRadius: '8px', display: 'inline-block' }}>
            LAUNCH FIRST MEME
          </Link>
        </div>
      ) : (
        <>
          {live.length > 0 && (
            <section style={{ marginBottom: '48px' }}>
              <div className="section-head" style={{ color: 'var(--lime)' }}>
                <span className="live-dot" />
                LIVE MARKETS — {live.length}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
                {live.map(m => <MemeCard key={m.id} market={m} />)}
              </div>
            </section>
          )}

          {rest.length > 0 && (
            <section style={{ marginBottom: '48px' }}>
              <div className="section-head" style={{ color: 'var(--muted)' }}>
                CLOSED / RESOLVED — {rest.length}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px', opacity: 0.6 }}>
                {rest.map(m => <MemeCard key={m.id} market={m} />)}
              </div>
            </section>
          )}
        </>
      )}

      {/* FOOTER */}
      <div style={{
        borderTop: '1px solid var(--border)',
        padding: '32px 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--muted)', letterSpacing: '1px' }}>
          MEMEO™ — MAKING THE WORLD A BETTER PLACE
        </span>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--muted2)' }}>
          NOT FINANCIAL ADVICE. JUST MEMES.
        </span>
      </div>
    </div>
  )
}