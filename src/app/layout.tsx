import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'RPI Education — Invest Like the Top 2%',
  description:
    'Learn real estate investing from Monika Jazyk and her team of experts. Community, coaching, and courses for every level.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://rpi-sable.vercel.app'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-body">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
