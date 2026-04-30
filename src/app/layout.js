import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'MemeMarket — Predice la viralidad',
  description: 'El Polymarket de los memes. Apostá a qué va a ser viral.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ background: '#080808', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>
          {children}
        </main>
      </body>
    </html>
  )
}