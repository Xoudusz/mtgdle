import type { GuessResult, Feedback, Direction } from '@/lib/compare'
import { extractSubtypes } from '@/lib/compare'
import ManaSymbol from '@/components/ManaSymbol'

function cellBg(feedback: Feedback) {
  if (feedback === 'correct') return 'bg-green-800 border-green-600'
  if (feedback === 'partial') return 'bg-yellow-800 border-yellow-600'
  return 'bg-red-950 border-red-800'
}

function arrow(direction: Direction) {
  if (direction === 'higher') return ' ↑'
  if (direction === 'lower') return ' ↓'
  return ''
}

function rarityLabel(r: string) {
  return r.charAt(0).toUpperCase()
}

function typeLabel(card: GuessResult['guessedCard']) {
  return card.type_line.split(' — ')[0].trim()
}

interface Props {
  results: GuessResult[]
  showPT: boolean
}

export default function GuessGrid({ results, showPT }: Props) {
  if (results.length === 0) return null

  const minWidth = showPT ? 'min-w-[720px]' : 'min-w-[640px]'

  return (
    <div className="w-full overflow-x-auto">
      <table className={`w-full ${minWidth} text-xs text-center border-collapse`}>
        <thead>
          <tr>
            <th className="px-1.5 py-2 sm:px-2 text-[#9b8a6e] font-normal border-b border-[#3a3020]">Name</th>
            <th className="px-1.5 py-2 sm:px-2 text-[#9b8a6e] font-normal border-b border-[#3a3020]">Color ID</th>
            <th className="px-1.5 py-2 sm:px-2 text-[#9b8a6e] font-normal border-b border-[#3a3020]">Type</th>
            <th className="px-1.5 py-2 sm:px-2 text-[#9b8a6e] font-normal border-b border-[#3a3020]">Subtypes</th>
            <th className="px-1.5 py-2 sm:px-2 text-[#9b8a6e] font-normal border-b border-[#3a3020]">CMC</th>
            {showPT && <th className="px-1.5 py-2 sm:px-2 text-[#9b8a6e] font-normal border-b border-[#3a3020]">P/T</th>}
            <th className="px-1.5 py-2 sm:px-2 text-[#9b8a6e] font-normal border-b border-[#3a3020]">Rarity</th>
            <th className="px-1.5 py-2 sm:px-2 text-[#9b8a6e] font-normal border-b border-[#3a3020]">Released in</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, i) => {
            const c = result.columns
            const card = result.guessedCard
            return (
              <tr key={i}>
                <td className={`px-1.5 py-2 sm:px-2 sm:py-3 border min-w-[160px] ${cellBg(c.name)} font-mono`}>
                  {card.name}
                </td>
                <td className={`px-1.5 py-2 sm:px-2 sm:py-3 border ${cellBg(c.color_identity.feedback)}`}>
                  <div className="flex justify-center gap-0.5">
                    {card.color_identity.length === 0
                      ? <ManaSymbol symbol="C" />
                      : card.color_identity.map(c => <ManaSymbol key={c} symbol={c} />)
                    }
                  </div>
                </td>
                <td className={`px-1.5 py-2 sm:px-2 sm:py-3 border ${cellBg(c.type_line)} font-mono`}>
                  {typeLabel(card)}
                </td>
                <td className={`px-1.5 py-2 sm:px-2 sm:py-3 border ${cellBg(c.subtypes)} font-mono`}>
                  {extractSubtypes(card.type_line).join(', ') || '—'}
                </td>
                <td className={`px-1.5 py-2 sm:px-2 sm:py-3 border ${cellBg(c.cmc.feedback)} font-mono`}>
                  {card.cmc}{arrow(c.cmc.direction)}
                </td>
                {showPT && (
                  <td className={`px-1.5 py-2 sm:px-2 sm:py-3 border ${cellBg(c.power_toughness.feedback)} font-mono`}>
                    {card.power != null ? `${card.power}/${card.toughness}${arrow(c.power_toughness.direction)}` : '—'}
                  </td>
                )}
                <td className={`px-1.5 py-2 sm:px-2 sm:py-3 border ${cellBg(c.rarity)} font-mono`}>
                  {rarityLabel(card.rarity)}
                </td>
                <td className={`px-1.5 py-2 sm:px-2 sm:py-3 border ${cellBg(c.set.feedback)} font-mono`}>
                  {card.original_set_name} ({card.original_year}-{String(card.original_month).padStart(2, '0')}){arrow(c.set.direction)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
