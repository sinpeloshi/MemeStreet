import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { CREDIT_PACKS } from '@/lib/packs'

export async function POST(request) {
  const auth = getAuthUser()
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  if (!process.env.NOWPAYMENTS_API_KEY) {
    return NextResponse.json({ error: 'Pagos crypto no configurados aún. Contactá al administrador.' }, { status: 503 })
  }

  try {
    const { packId } = await request.json()
    const pack = CREDIT_PACKS.find(p => p.id === packId)
    if (!pack) return NextResponse.json({ error: 'Pack inválido' }, { status: 400 })

    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    // encode userId:packId:credits in order_id for webhook
    const orderId = `${auth.id}:${pack.id}:${pack.credits}:${pack.priceUsd}:${Date.now()}`

    const nowRes = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NOWPAYMENTS_API_KEY,
      },
      body: JSON.stringify({
        price_amount: pack.priceUsd,
        price_currency: 'usd',
        order_id: orderId,
        order_description: `MEMEO ${pack.label} — ${pack.credits.toLocaleString()} créditos`,
        ipn_callback_url: `${APP_URL}/api/payments/crypto/webhook`,
        success_url: `${APP_URL}/dashboard?pago=ok&cr=${pack.credits}`,
        cancel_url: `${APP_URL}/dashboard`,
      }),
    })

    if (!nowRes.ok) {
      console.error('NOWPayments error:', await nowRes.text())
      return NextResponse.json({ error: 'Error al crear el pago crypto' }, { status: 502 })
    }

    const invoice = await nowRes.json()
    return NextResponse.json({ url: invoice.invoice_url })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
