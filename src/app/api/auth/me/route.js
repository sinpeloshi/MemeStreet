import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const auth = getAuthUser()
    if (!auth) return NextResponse.json({ user: null })

    const user = await prisma.user.findUnique({
      where: { id: auth.id },
      select: { id: true, username: true, credits: true },
    })
    return NextResponse.json({ user: user ?? null })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ user: null })
  }
}
