import type { GuessResult, Feedback, Direction } from '@/lib/compare'

const COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'color_identity', label: 'Colors' },
  { key: 'card_type', label: 'Type' },
  { key: 'supertypes', label: 'Supertype' },
  { key: 'cmc', label: 'CMC' },
  { key: 'power_toughness', label: 'P/T' },
  { key: 'rarity', label: 'Rarity' },
  { key: 'set', label: 'Set' },
]

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

interface Props {
  results: GuessResult[]
}

export default function GuessGrid({ results }: Props) {
  if (results.length === 0) return null

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-xs text-center border-collapse">
        <thead>
          <tr>
            {COLUMNS.map(col => (
              <th key={col.key} className="px-2 py-2 text-[#9b8a6e] font-normal border-b border-[#3a3020]">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.map((result, i) => {
            const c = result.columns
            const rows = [
              { key: 'name', feedback: c.name, value: result.guessedCard.name },
              { key: 'color_identity', feedback: c.color_identity.feedback, value: colorLabel(result.guessedCard.color_identity) },
              { key: 'card_type', feedback: c.card_type, value: result.guessedCard.card_type },
              { key: 'supertypes', feedback: c.supertypes, value: result.guessedCard.supertypes.join(', ') || '—' },
              { key: 'cmc', feedback: c.cmc.feedback, value: `${result.guessedCard.cmc}${arrow(c.cmc.direction)}` },
              { key: 'power_toughness', feedback: c.power_toughness.feedback, value: result.guessedCard.power != null ? `${result.guessedCard.power}/${result.guessedCard.toughness}${arrow(c.power_toughness.direction)}` : '—' },
              { key: 'rarity', feedback: c.rarity, value: rarityLabel(result.guessedCard.rarity) },
              { key: 'set', feedback: c.set, value: result.guessedCard.set.toUpperCase() },
            ]
            return (
              <tr key={i}>
                {rows.map(cell => (
                  <td
                    key={cell.key}
                    className={`px-2 py-3 border ${cellBg(cell.feedback)} font-mono`}
                  >
                    {cell.value}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
