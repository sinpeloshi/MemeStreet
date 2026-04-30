import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

function sortKeys(obj) {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return obj
  return Object.keys(obj).sort().reduce((acc, k) => { acc[k] = sortKeys(obj[k]); return acc }, {})
}

export async function POST(request) {
  try {
    const sig = request.headers.get('x-nowpayments-sig')
    const text = await request.text()
    const body = JSON.parse(text)

    // Verify HMAC-SHA512 signature
    if (process.env.NOWPAYMENTS_IPN_SECRET && sig) {
      const expected = crypto
        .createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET)
        .update(JSON.stringify(sortKeys(body)))
        .digest('hex')
      if (expected !== sig) {
        console.error('NOWPayments: invalid signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const { payment_status, payment_id, order_id, price_amount } = body

    // Only credit on confirmed/finished
    if (payment_status !== 'finished' && payment_status !== 'confirmed') {
      return NextResponse.json({ ok: true })
    }

    // order_id: userId:packId:credits:priceUsd:timestamp
    const parts = (order_id || '').split(':')
    const userId = parts[0]
    const credits = parseInt(parts[2])
    const amountUsd = parseFloat(parts[3]) || price_amount || 0
    if (!userId || !credits || isNaN(credits)) return NextResponse.json({ ok: true })

    const extId = `np_${payment_id}`

    const existing = await prisma.transaction.findUnique({ where: { externalId: extId } })
    if (existing?.status === 'completed') return NextResponse.json({ ok: true })

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { credits: { increment: credits } },
      }),
      prisma.transaction.upsert({
        where: { externalId: extId },
        create: { userId, credits, amountUsd, provider: 'crypto', externalId: extId, status: 'completed' },
        update: { status: 'completed' },
      }),
    ])

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Crypto webhook error:', e)
    return NextResponse.json({ ok: true })
  }
}
