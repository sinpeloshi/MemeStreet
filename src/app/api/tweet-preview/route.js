import { NextResponse } from 'next/server'
import { extractTweetId, getTweetDetails } from '@/lib/twitter'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'URL requerida' }, { status: 400 })

  const tweetId = extractTweetId(url)
  if (!tweetId) return NextResponse.json({ error: 'URL de tweet inválida' }, { status: 400 })

  const details = await getTweetDetails(tweetId)
  if (!details) return NextResponse.json({ error: 'No se pudo obtener el tweet. Verificá tu TWITTER_BEARER_TOKEN.' }, { status: 503 })

  return NextResponse.json({ tweetId, ...details })
}
