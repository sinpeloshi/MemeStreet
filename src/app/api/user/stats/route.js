import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const auth = getAuthUser()
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const [user, bets, markets] = await Promise.all([
    prisma.user.findUnique({
      where: { id: auth.id },
      select: { id: true, username: true, email: true, credits: true, createdAt: true },
    }),
    prisma.bet.findMany({
      where: { userId: auth.id },
      include: {
        market: {
          include: { meme: { select: { title: true, imageUrl: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.market.findMany({
      where: { meme: { creatorId: auth.id } },
      include: {
        meme: { select: { title: true, imageUrl: true } },
        _count: { select: { bets: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  if (!user) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  const activeBets = bets.filter(
    b => b.market.status === 'OPEN' && new Date() < new Date(b.market.deadline)
  )
  const resolvedBets = bets.filter(b => b.market.status === 'RESOLVED')
  const wonBets = resolvedBets.filter(b => b.position === b.market.result)
  const lostBets = resolvedBets.filter(b => b.position !== b.market.result)

  const totalBetAmount = bets.reduce((s, b) => s + b.amount, 0)
  const totalWon = wonBets.reduce((s, b) => s + (b.payout || 0), 0)
  const totalInvested = resolvedBets.reduce((s, b) => s + b.amount, 0)
  const netPL = totalWon - totalInvested

  return NextResponse.json({
    user,
    stats: {
      totalBets: bets.length,
      activeBets: activeBets.length,
      wonBets: wonBets.length,
      lostBets: lostBets.length,
      totalBetAmount,
      totalWon,
      netPL,
      winRate: resolvedBets.length > 0
        ? Math.round((wonBets.length / resolvedBets.length) * 100)
        : null,
    },
    activeBets,
    resolvedBets,
    myMarkets: markets,
  })
}
