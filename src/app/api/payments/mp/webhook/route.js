import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request) {
  try {
    const body = await request.json()

    // MP sends different notification types; only process payments
    if (body.type !== 'payment') return NextResponse.json({ ok: true })

    const paymentId = body.data?.id
    if (!paymentId) return NextResponse.json({ ok: true })

    // Fetch payment from MP to verify authenticity and get details
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    })
    if (!mpRes.ok) return NextResponse.json({ ok: true })

    const payment = await mpRes.json()
    if (payment.status !== 'approved') return NextResponse.json({ ok: true })

    // external_reference: userId:packId:credits:priceUsd
    const parts = (payment.external_reference || '').split(':')
    const userId = parts[0]
    const credits = parseInt(parts[2])
    const amountUsd = parseFloat(parts[3]) || payment.transaction_amount || 0
    if (!userId || !credits || isNaN(credits)) return NextResponse.json({ ok: true })

    const extId = `mp_${paymentId}`

    // Idempotency: skip if already credited
    const existing = await prisma.transaction.findUnique({ where: { externalId: extId } })
    if (existing?.status === 'completed') return NextResponse.json({ ok: true })

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { credits: { increment: credits } },
      }),
      prisma.transaction.upsert({
        where: { externalId: extId },
        create: { userId, credits, amountUsd, provider: 'mercadopago', externalId: extId, status: 'completed' },
        update: { status: 'completed' },
      }),
    ])

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('MP webhook error:', e)
    return NextResponse.json({ ok: true }) // Always 200 so MP doesn't retry forever
  }
}
