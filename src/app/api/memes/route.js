import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

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
    const { title, imageUrl, tags, question, threshold, platform, deadline } = await request.json()
    if (!title || !imageUrl || !question || !threshold || !platform || !deadline)
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })

    const meme = await prisma.meme.create({
      data: {
        title, imageUrl, tags: tags || [],
        creatorId: auth.id,
        market: {
          create: { question, threshold: parseInt(threshold), platform, deadline: new Date(deadline) }
        }
      },
      include: { market: true, creator: { select: { username: true } } }
    })
    return NextResponse.json(meme)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error creando meme' }, { status: 500 })
  }
}