import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Binance BTC Pairs Scanner - Mean Reversion',
  description: 'Real-time scanner for BTC-correlated pairs and mean reversion opportunities on Binance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} bg-gray-950 text-white`}>
        {children}
      </body>
    </html>
  )
}