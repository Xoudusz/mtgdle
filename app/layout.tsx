import type { Metadata } from 'next'
import './globals.css'
import GameNav from '@/components/GameNav'

export const metadata: Metadata = {
  title: 'MTGdle',
  description: 'Daily Magic: The Gathering guessing game',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0f0f0f] text-[#e8e0d0]">
        <GameNav />
        {children}
      </body>
    </html>
  )
}
