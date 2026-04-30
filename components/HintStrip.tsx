import type { Card } from '@/lib/types'
import ManaSymbol from './ManaSymbol'

interface Props {
  card: Card
  wrongCount: number
}

const HINTS = [
  { label: 'Color' },
  { label: 'Type' },
  { label: 'CMC' },
  { label: 'Rarity' },
  { label: 'Starts with' },
]

function renderValue(card: Card, index: number) {
  switch (index) {
    case 0:
      return card.color_identity.length === 0
        ? <span className="text-[#9b8a6e] text-xs">Colorless</span>
        : <span className="flex gap-0.5 items-center">
            {card.color_identity.map(c => <ManaSymbol key={c} symbol={c} size={16} />)}
          </span>
    case 1:
      return <span className="text-xs">{card.card_type}</span>
    case 2:
      return <span className="text-xs">{card.cmc}</span>
    case 3:
      return <span className="text-xs capitalize">{card.rarity}</span>
    case 4:
      return <span className="text-xs font-mono">{card.name[0].toUpperCase()}…</span>
    default:
      return null
  }
}

export default function HintStrip({ card, wrongCount }: Props) {
  return (
    <div className="flex flex-wrap justify-center gap-2 w-full">
      {HINTS.map((hint, i) => {
        const revealed = wrongCount > i
        return (
          <div
            key={hint.label}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border min-w-[64px] transition-all duration-500 ${
              revealed
                ? 'border-[#8b6914] bg-[#2a1f0a] text-[#e8e0d0]'
                : 'border-[#2a2218] bg-[#0f0d0a] text-[#3a3020]'
            }`}
          >
            <span className="text-[10px] uppercase tracking-wide opacity-60">{hint.label}</span>
            {revealed
              ? renderValue(card, i)
              : <span className="text-sm font-bold opacity-30">?</span>
            }
          </div>
        )
      })}
    </div>
  )
}
