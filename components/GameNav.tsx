'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const MODES = [
  { href: '/classic', label: 'Carddle',   icon: '🃏' },
  { href: '/art',     label: 'Artdle',    icon: '🎨' },
  { href: '/flavor',  label: 'Flavordle', icon: '📜' },
]

export default function GameNav() {
  const path = usePathname()

  return (
    <nav className="sticky top-0 z-40 w-full bg-[#0a0a0a] border-b border-[#3a3020]">
      <div className="flex items-center justify-center h-12 gap-1">
        <Link href="/" className="font-bold text-[#e8e0d0] hover:text-[#8b6914] transition-colors tracking-wide px-3 h-12 flex items-center">
          MTGdle
        </Link>
        <span className="w-px h-5 bg-[#3a3020]" />
        {MODES.map(m => {
          const active = path.startsWith(m.href)
          return (
            <Link
              key={m.href}
              href={m.href}
              className={`flex items-center gap-1.5 px-3 h-12 text-sm transition-colors border-b-2 ${
                active
                  ? 'border-[#8b6914] text-[#e8e0d0]'
                  : 'border-transparent text-[#9b8a6e] hover:text-[#e8e0d0] hover:border-[#3a3020]'
              }`}
            >
              <span>{m.icon}</span>
              <span className="hidden sm:inline">{m.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
