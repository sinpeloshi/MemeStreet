import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request, { params }) {
  const market = await prisma.market.findUnique({
    where: { id: params.id },
    include: {
      meme: { include: { creator: { select: { username: true } } } },
      bets: {
        include: { user: { select: { username: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20
      }
    }
  })
  if (!market) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json(market)
}