import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Solo el creador del meme puede resolver su propio mercado
export async function POST(request, { params }) {
  const auth = getAuthUser()
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  try {
    const { result } = await request.json() // true = SÍ ganó, false = NO ganó

    const market = await prisma.market.findUnique({
      where: { id: params.id },
      include: { meme: true, bets: true }
    })

    if (!market) return NextResponse.json({ error: 'Market no existe' }, { status: 404 })
    if (market.status !== 'OPEN') return NextResponse.json({ error: 'Ya fue resuelto' }, { status: 400 })
    if (market.meme.creatorId !== auth.id) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

    const winningBets = market.bets.filter(b => b.position === result)
    const losingPool = market.bets
      .filter(b => b.position !== result)
      .reduce((sum, b) => sum + b.amount, 0)
    const winningPool = winningBets.reduce((sum, b) => sum + b.amount, 0)

    const fee = Math.floor(losingPool * 0.02) // 2% para la plataforma
    const distributable = losingPool - fee

    await prisma.$transaction(async (tx) => {
      await tx.market.update({
        where: { id: params.id },
        data: { status: 'RESOLVED', result, resolvedBy: 'manual' }
      })
      for (const bet of winningBets) {
        const payout = bet.amount + Math.floor(
          winningPool > 0 ? (bet.amount / winningPool) * distributable : 0
        )
        await tx.bet.update({ where: { id: bet.id }, data: { payout } })
        await tx.user.update({
          where: { id: bet.userId },
          data: { credits: { increment: payout } }
        })
      }
    })

    return NextResponse.json({ success: true, fee, winners: winningBets.length })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error resolviendo market' }, { status: 500 })
  }
}