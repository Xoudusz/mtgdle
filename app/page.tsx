import Link from 'next/link'

const modes = [
  {
    href: '/classic',
    name: 'Carddle',
    description: 'Guess the card by its attributes',
    icon: '🃏',
  },
  {
    href: '/art',
    name: 'Artdle',
    description: 'Identify the card from its artwork',
    icon: '🎨',
  },
  {
    href: '/flavor',
    name: 'Flavordle',
    description: 'Guess from the flavor text',
    icon: '📜',
  },
]

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 gap-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-wide mb-2">MTGdle</h1>
        <p className="text-[#9b8a6e] text-lg">Daily Magic: The Gathering puzzles</p>
      </div>
      <div className="grid gap-4 w-full max-w-md">
        {modes.map((mode) => (
          <Link
            key={mode.href}
            href={mode.href}
            className="flex items-center gap-4 p-5 rounded-lg border border-[#3a3020] bg-[#1a1510] hover:bg-[#2a2010] hover:border-[#8b6914] transition-colors"
          >
            <span className="text-3xl">{mode.icon}</span>
            <div>
              <div className="font-bold text-lg">{mode.name}</div>
              <div className="text-sm text-[#9b8a6e]">{mode.description}</div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
