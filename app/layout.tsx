import type { Metadata } from 'next'
import { Poppins, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import ClientLayout from './ClientLayout'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-sans',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
})

export const metadata: Metadata = {
  title: 'Tirumala Family Mall — Tekkali, Srikakulam',
  description: 'Premium fashion...',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${cormorant.variable}`}>
      <body className="bg-white text-[#111] antialiased font-sans">

          <ClientLayout>
            {children}
          </ClientLayout>

      </body>
    </html>
  )
}