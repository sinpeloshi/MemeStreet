import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { CREDIT_PACKS } from '@/lib/packs'

export async function POST(request) {
  const auth = getAuthUser()
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  try {
    const { packId } = await request.json()
    const pack = CREDIT_PACKS.find(p => p.id === packId)
    if (!pack) return NextResponse.json({ error: 'Pack inválido' }, { status: 400 })

    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        items: [{
          id: pack.id,
          title: `MEMEO — ${pack.label} · ${pack.credits.toLocaleString()} créditos`,
          quantity: 1,
          currency_id: 'USD',
          unit_price: pack.priceUsd,
        }],
        back_urls: {
          success: `${APP_URL}/dashboard?pago=ok&cr=${pack.credits}`,
          failure: `${APP_URL}/dashboard?pago=error`,
          pending: `${APP_URL}/dashboard?pago=pendiente`,
        },
        auto_approve: true,
        notification_url: `${APP_URL}/api/payments/mp/webhook`,
        // encode userId + credits in external_reference for webhook
        external_reference: `${auth.id}:${pack.id}:${pack.credits}:${pack.priceUsd}`,
        statement_descriptor: 'MEMEO',
      }),
    })

    if (!mpRes.ok) {
      console.error('MP error:', await mpRes.text())
      return NextResponse.json({ error: 'Error al crear el pago en MercadoPago' }, { status: 502 })
    }

    const pref = await mpRes.json()
    const url = process.env.NODE_ENV === 'production' ? pref.init_point : pref.sandbox_init_point

    return NextResponse.json({ url })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
