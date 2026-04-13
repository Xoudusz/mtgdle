import type { Card } from './types'

export type Feedback = 'correct' | 'partial' | 'wrong'
export type Direction = 'higher' | 'lower' | null

export interface GuessResult {
  guessedCard: Card
  columns: {
    name: Feedback
    color_identity: { feedback: Feedback }
    type_line: Feedback
    cmc: { feedback: Feedback; direction: Direction }
    power_toughness: { feedback: Feedback; direction: Direction }
    rarity: Feedback
    set: Feedback
  }
  correct: boolean
}

function compareNumeric(guessed: number | null, target: number | null): { feedback: Feedback; direction: Direction } {
  if (guessed === null || target === null) return { feedback: 'wrong', direction: null }
  if (guessed === target) return { feedback: 'correct', direction: null }
  return { feedback: 'wrong', direction: guessed < target ? 'higher' : 'lower' }
}

function parsePT(val: string | null): number | null {
  if (!val || val === '*' || val === '∞') return null
  const n = parseFloat(val)
  return isNaN(n) ? null : n
}

export function compareCards(guessed: Card, target: Card): GuessResult {
  // Color identity: exact = correct, overlap = partial, no overlap = wrong
  const guessedColors = new Set(guessed.color_identity)
  const targetColors = new Set(target.color_identity)
  const intersection = guessed.color_identity.filter(c => targetColors.has(c))
  const colorFeedback: Feedback =
    guessedColors.size === targetColors.size && intersection.length === targetColors.size
      ? 'correct'
      : intersection.length > 0
      ? 'partial'
      : 'wrong'

  // Type line: green = type AND supertype both match, yellow = one matches, red = neither
  const typeMatch = guessed.card_type === target.card_type
  const supertypeMatch =
    [...guessed.supertypes].sort().join(',') === [...target.supertypes].sort().join(',')
  const typeLineFeedback: Feedback =
    typeMatch && supertypeMatch ? 'correct' : typeMatch || supertypeMatch ? 'partial' : 'wrong'

  // Power/Toughness
  const gPT = parsePT(guessed.power)
  const tPT = parsePT(target.power)
  const ptCompare = compareNumeric(gPT, tPT)

  const columns: GuessResult['columns'] = {
    name: guessed.name === target.name ? 'correct' : 'wrong',
    color_identity: { feedback: colorFeedback },
    type_line: typeLineFeedback,
    cmc: compareNumeric(guessed.cmc, target.cmc),
    power_toughness: ptCompare,
    rarity: guessed.rarity === target.rarity ? 'correct' : 'wrong',
    set: guessed.set === target.set ? 'correct' : 'wrong',
  }

  return { guessedCard: guessed, columns, correct: guessed.name === target.name }
}
