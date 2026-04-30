import Link from 'next/link'
import { prisma } from '@/lib/db'

export const revalidate = 0

function getTimeLeft(deadline) {
  const diff = new Date(deadline) - new Date()
  if (diff <= 0) return 'Expirado'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h > 24) return `${Math.floor(h / 24)}d`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function MemeCard({ market }) {
  const total = market.totalYes + market.totalNo
  const yesP = total > 0 ? Math.round((market.totalYes / total) * 100) : 50
  const noP = 100 - yesP
  const isLive = market.status === 'OPEN' && new Date() < new Date(market.deadline)
  const isResolved = market.status === 'RESOLVED'

  return (
    <Link href={`/market/${market.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{
        background: '#0d0d0d',
        border: '1px solid #1a1a1a',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.2s, transform 0.2s',
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#00ff8844'; e.currentTarget.style.transform = 'translateY(-2px)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.transform = 'translateY(0)' }}
      >
        {/* Image */}
        <div style={{ height: '180px', overflow: 'hidden', position: 'relative', background: '#111' }}>
          <img
            src={market.meme.imageUrl}
            alt={market.meme.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.target.src = 'https://placehold.co/400x200/111/333?text=meme' }}
          />
          <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px' }}>
            {isLive && (
              <span style={{
                background: 'rgba(0,255,136,0.15)',
                border: '1px solid #00ff8866',
                color: '#00ff88',
                fontSize: '10px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '4px',
                letterSpacing: '1px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <span className="pulse" style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00ff88', display: 'inline-block' }} />
                LIVE
              </span>
            )}
            {isResolved && (
              <span style={{
                background: 'rgba(245,166,35,0.15)',
                border: '1px solid #f5a62366',
                color: '#f5a623',
                fontSize: '10px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '4px',
              }}>
                RESUELTO
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '14px' }}>
          <p style={{ color: '#444', fontSize: '11px', marginBottom: '4px', fontFamily: 'IBM Plex Mono' }}>
            @{market.meme.creator.username} · {market.meme.tags?.slice(0, 2).map(t => `#${t}`).join(' ')}
          </p>
          <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', lineHeight: 1.4, color: '#ddd' }}>
            {market.question}
          </p>

          {/* Bar */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '5px', fontFamily: 'IBM Plex Mono' }}>
              <span style={{ color: '#00ff88', fontWeight: 600 }}>SÍ {yesP}%</span>
              <span style={{ color: '#ff3b3b', fontWeight: 600 }}>{noP}% NO</span>
            </div>
            <div style={{ height: '3px', background: '#1e1e1e', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                width: `${yesP}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #00ff88, #00ccff)',
                borderRadius: '2px',
              }} />
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#444', fontFamily: 'IBM Plex Mono' }}>
            <span>◈ {total.toLocaleString()}</span>
            <span>{market._count.bets} apuestas</span>
            <span>⏱ {getTimeLeft(market.deadline)}</span>
          </div>
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

  const live = markets.filter(m => m.status === 'OPEN' && new Date() < new Date(m.deadline))
  const rest = markets.filter(m => !(m.status === 'OPEN' && new Date() < new Date(m.deadline)))

  return (
    <div>
      {/* Hero */}
      <div style={{ marginBottom: '48px', paddingTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span style={{ fontSize: '32px' }}>🔥</span>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 800,
            letterSpacing: '-1px',
            background: 'linear-gradient(135deg, #fff 40%, #555)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
          }}>
            MemeMarket
          </h1>
        </div>
        <p style={{ color: '#555', fontSize: '15px', margin: 0 }}>
          Predice qué memes van a ser virales. Apostá. Ganá.
        </p>
      </div>

      {markets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <p style={{ color: '#333', fontSize: '18px', marginBottom: '20px' }}>No hay mercados todavía</p>
          <Link href="/create" style={{
            background: 'linear-gradient(135deg, #00ff88, #00ccff)',
            color: '#000',
            fontWeight: 700,
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
          }}>
            Lanzar el primero
          </Link>
        </div>
      ) : (
        <>
          {live.length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '2px', color: '#00ff88', marginBottom: '16px', fontFamily: 'IBM Plex Mono' }}>
                ● EN VIVO — {live.length} mercados
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {live.map(m => <MemeCard key={m.id} market={m} />)}
              </div>
            </div>
          )}

          {rest.length > 0 && (
            <div>
              <h2 style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '2px', color: '#444', marginBottom: '16px', fontFamily: 'IBM Plex Mono' }}>
                CERRADOS / RESUELTOS
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {rest.map(m => <MemeCard key={m.id} market={m} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}