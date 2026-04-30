import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request, { params }) {
  const auth = getAuthUser()
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  try {
    const { position, amount } = await request.json()
    if (typeof position !== 'boolean' || !amount || amount < 10)
      return NextResponse.json({ error: 'Mínimo 10 créditos' }, { status: 400 })

    const [market, user] = await Promise.all([
      prisma.market.findUnique({ where: { id: params.id } }),
      prisma.user.findUnique({ where: { id: auth.id } })
    ])

    if (!market) return NextResponse.json({ error: 'Mercado no existe' }, { status: 404 })
    if (market.status !== 'OPEN') return NextResponse.json({ error: 'Mercado cerrado' }, { status: 400 })
    if (new Date() > market.deadline) return NextResponse.json({ error: 'Mercado expirado' }, { status: 400 })
    if (user.credits < amount) return NextResponse.json({ error: 'Créditos insuficientes' }, { status: 400 })

    const existing = await prisma.bet.findUnique({
      where: { userId_marketId: { userId: auth.id, marketId: params.id } }
    })
    if (existing) return NextResponse.json({ error: 'Ya apostaste en este mercado' }, { status: 400 })

    // BUG FIX: transacción correcta con resultado desestructurado bien
    const result = await prisma.$transaction(async (tx) => {
      const bet = await tx.bet.create({
        data: { userId: auth.id, marketId: params.id, position, amount }
      })
      const updatedUser = await tx.user.update({
        where: { id: auth.id },
        data: { credits: { decrement: amount } }
      })
      await tx.market.update({
        where: { id: params.id },
        data: position ? { totalYes: { increment: amount } } : { totalNo: { increment: amount } }
      })
      return { bet, newCredits: updatedUser.credits }
    })

    return NextResponse.json(result)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error procesando apuesta' }, { status: 500 })
  }
}