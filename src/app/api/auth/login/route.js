import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { signToken } from '@/lib/auth'

export async function POST(request) {
  try {
    const { email, password } = await request.json()
    if (!email || !password)
      return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email } })
    const valid = user && await bcrypt.compare(password, user.password)
    if (!valid)
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })

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
