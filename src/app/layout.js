import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'MEMEO — La economía del meme',
  description: 'El Polymarket de los memes. Apostá a qué va a ser viral.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ background: '#080808', minHeight: '100vh' }}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}
