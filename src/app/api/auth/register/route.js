import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { signToken } from '@/lib/auth'

export async function POST(request) {
  try {
    const { username, email, password } = await request.json()
    if (!username || !email || !password)
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 })

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    })
    if (existing)
      return NextResponse.json({ error: 'Email o usuario ya existe' }, { status: 400 })

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { username, email, password: hashed }
    })

    const token = signToken({ id: user.id, username: user.username })
    const res = NextResponse.json({ user: { id: user.id, username: user.username, credits: user.credits } })
    res.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })
    return res
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}