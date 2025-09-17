import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LayoutShell } from '@/components/LayoutShell'
import { CartProvider } from '@/contexts/CartContext'
import { AuthProvider } from '@/contexts/AuthContext'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VemPraFonteSP - E-commerce',
  description: 'Loja online moderna com os melhores produtos',
  icons: {
    icon: '/images/Logo.jpg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="icon" type="image/jpeg" href="/images/Logo.jpg" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={`${inter.className} bg-dark-950 text-white antialiased`}>
        <AuthProvider>
          <CartProvider>
            <LayoutShell>
              {children}
            </LayoutShell>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
} 