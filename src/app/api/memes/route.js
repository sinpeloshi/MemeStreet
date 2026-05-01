import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { extractTweetId } from '@/lib/twitter'
import { MARKET_CREATION_COST } from '@/lib/constants'

export async function GET() {
  const memes = await prisma.meme.findMany({
    include: { creator: { select: { username: true } }, market: true },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(memes)
}

export async function POST(request) {
  const auth = getAuthUser()
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  try {
    const { title, imageUrl, tags, question, threshold, platform, deadline, tweetUrl, metric } = await request.json()
    if (!title || !imageUrl || !question || !threshold || !platform || !deadline)
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })

    if (new Date(deadline) <= new Date())
      return NextResponse.json({ error: 'La fecha límite debe ser en el futuro' }, { status: 400 })

    if (parseInt(threshold) <= 0)
      return NextResponse.json({ error: 'El umbral debe ser mayor a cero' }, { status: 400 })

    let tweetId = null
    if (tweetUrl) {
      tweetId = extractTweetId(tweetUrl)
      if (!tweetId)
        return NextResponse.json({ error: 'URL de tweet inválida. Usá el formato: https://x.com/usuario/status/123...' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: auth.id }, select: { credits: true } })
    if (!user || user.credits < MARKET_CREATION_COST)
      return NextResponse.json({ error: `Necesitás al menos ◈ ${MARKET_CREATION_COST} créditos para crear un mercado` }, { status: 402 })

    const meme = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: auth.id },
        data: { credits: { decrement: MARKET_CREATION_COST } },
      })
      return tx.meme.create({
        data: {
          title, imageUrl, tags: tags || [],
          creatorId: auth.id,
          market: {
            create: {
              question,
              threshold: parseInt(threshold),
              platform,
              deadline: new Date(deadline),
              tweetUrl: tweetUrl || null,
              tweetId: tweetId || null,
              metric: metric || 'total',
            }
          }
        },
        include: { market: true, creator: { select: { username: true } } }
      })
    })

    return NextResponse.json(meme)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error creando meme' }, { status: 500 })
  }
}
