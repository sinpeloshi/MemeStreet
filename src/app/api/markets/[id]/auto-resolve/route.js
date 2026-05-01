import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getTweetMetrics } from '@/lib/twitter'

export async function POST(request, { params }) {
  try {
    const market = await prisma.market.findUnique({
      where: { id: params.id },
      include: { bets: true },
    })

    if (!market) return NextResponse.json({ error: 'No existe' }, { status: 404 })
    if (market.status !== 'OPEN') return NextResponse.json({ ok: true, alreadyResolved: true })
    if (new Date() < new Date(market.deadline))
      return NextResponse.json({ error: 'El mercado todavía está activo' }, { status: 400 })
    if (!market.tweetId)
      return NextResponse.json({ error: 'Este mercado requiere resolución manual' }, { status: 400 })

    const metrics = await getTweetMetrics(market.tweetId)
    if (!metrics)
      return NextResponse.json({ error: 'No se pudieron obtener las métricas de Twitter. Intentá de nuevo o resolvé manualmente.' }, { status: 503 })

    const result = metrics.total >= market.threshold

    const winningBets = market.bets.filter(b => b.position === result)
    const losingPool = market.bets.filter(b => b.position !== result).reduce((s, b) => s + b.amount, 0)
    const winningPool = winningBets.reduce((s, b) => s + b.amount, 0)
    const fee = Math.floor(losingPool * 0.02)
    const distributable = losingPool - fee

    await prisma.$transaction(async (tx) => {
      await tx.market.update({
        where: { id: params.id },
        data: { status: 'RESOLVED', result, resolvedBy: 'auto' },
      })
      for (const bet of winningBets) {
        const payout = bet.amount + Math.floor(winningPool > 0 ? (bet.amount / winningPool) * distributable : 0)
        await tx.bet.update({ where: { id: bet.id }, data: { payout } })
        await tx.user.update({ where: { id: bet.userId }, data: { credits: { increment: payout } } })
      }
    })

    return NextResponse.json({ ok: true, resolved: true, result, metrics, winners: winningBets.length, fee })
  } catch (e) {
    console.error('Auto-resolve error:', e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
