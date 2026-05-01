import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const markets = await prisma.market.findMany({
    include: {
      meme: { include: { creator: { select: { username: true } } } },
      _count: { select: { bets: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(markets)
}