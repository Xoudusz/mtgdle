import type { GuessResult, Feedback, Direction } from '@/lib/compare'

function cellBg(feedback: Feedback) {
  if (feedback === 'correct') return 'bg-green-800 border-green-600'
  if (feedback === 'partial') return 'bg-yellow-800 border-yellow-600'
  return 'bg-[#2a1a1a] border-[#5a2020]'
}

function arrow(direction: Direction) {
  if (direction === 'higher') return ' ↑'
  if (direction === 'lower') return ' ↓'
  return ''
}

function colorLabel(colors: string[]) {
  if (colors.length === 0) return 'C'
  return colors.join('')
}

function rarityLabel(r: string) {
  return r.charAt(0).toUpperCase()
}

// Strip subtype (everything after " — ") from type_line for display
function typeLabel(card: GuessResult['guessedCard']) {
  const parts = card.type_line.split(' — ')
  return parts[0].trim()
}

interface Props {
  results: GuessResult[]
  showPT: boolean
}

export default function GuessGrid({ results, showPT }: Props) {
  if (results.length === 0) return null

  const minWidth = showPT ? 'min-w-[560px]' : 'min-w-[480px]'

  return (
    <div className="w-full overflow-x-auto">
      <table className={`w-full ${minWidth} text-xs text-center border-collapse`}>
        <thead>
          <tr>
            <th className="px-1.5 py-2 sm:px-2 text-[#9b8a6e] font-normal border-b border-[#3a3020]">Name</th>
            <th className="px-1.5 py-2 sm:px-2 text-[#9b8a6e] font-normal border-b border-[#3a3020]">Colors</th>
            <th className="px-1.5 py-2 sm:px-2 text-[#9b8a6e] font-normal border-b border-[#3a3020]">Type</th>
            <th className="px-1.5 py-2 sm:px-2 text-[#9b8a6e] font-normal border-b border-[#3a3020]">CMC</th>
            {showPT && <th className="px-1.5 py-2 sm:px-2 text-[#9b8a6e] font-normal border-b border-[#3a3020]">P/T</th>}
            <th className="px-1.5 py-2 sm:px-2 text-[#9b8a6e] font-normal border-b border-[#3a3020]">Rarity</th>
            <th className="px-1.5 py-2 sm:px-2 text-[#9b8a6e] font-normal border-b border-[#3a3020]">Set</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, i) => {
            const c = result.columns
            const card = result.guessedCard
            return (
              <tr key={i}>
                <td className={`px-1.5 py-2 sm:px-2 sm:py-3 border max-w-[100px] truncate ${cellBg(c.name)} font-mono`}>
                  {card.name}
                </td>
                <td className={`px-1.5 py-2 sm:px-2 sm:py-3 border ${cellBg(c.color_identity.feedback)} font-mono`}>
                  {colorLabel(card.color_identity)}
                </td>
                <td className={`px-1.5 py-2 sm:px-2 sm:py-3 border ${cellBg(c.type_line)} font-mono`}>
                  {typeLabel(card)}
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
                <td className={`px-1.5 py-2 sm:px-2 sm:py-3 border ${cellBg(c.set)} font-mono`}>
                  {card.set.toUpperCase()}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
