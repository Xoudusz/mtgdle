import type { Card } from './types'

export type Feedback = 'correct' | 'partial' | 'wrong'
export type Direction = 'higher' | 'lower' | null

export interface GuessResult {
  guessedCard: Card
  columns: {
    name: Feedback
    color_identity: { feedback: Feedback }
    type_line: Feedback
    subtypes: Feedback
    cmc: { feedback: Feedback; direction: Direction }
    power_toughness: { feedback: Feedback; direction: Direction }
    rarity: Feedback
    set: Feedback
  }
  correct: boolean
}

export function extractSubtypes(typeLine: string): string[] {
  const after = typeLine.split(' — ')[1]
  if (!after) return []
  return after.trim().split(' ').filter(Boolean)
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
  // Empty supertypes do NOT count as a match — "no supertype" is not meaningful info
  const typeMatch = guessed.card_type === target.card_type
  const gSupStr = [...guessed.supertypes].sort().join(',')
  const tSupStr = [...target.supertypes].sort().join(',')
  const supertypeMatch = gSupStr === tSupStr
  const typeLineFeedback: Feedback =
    typeMatch && supertypeMatch ? 'correct' : typeMatch || supertypeMatch ? 'partial' : 'wrong'

  // Subtypes: exact = correct, overlap = partial, no overlap or both empty = wrong
  const guessedSubs = extractSubtypes(guessed.type_line)
  const targetSubs = extractSubtypes(target.type_line)
  const subIntersection = guessedSubs.filter(s => targetSubs.includes(s))
  const subtypesFeedback: Feedback =
    guessedSubs.length > 0 && targetSubs.length > 0 &&
    guessedSubs.length === targetSubs.length && subIntersection.length === targetSubs.length
      ? 'correct'
      : subIntersection.length > 0
      ? 'partial'
      : 'wrong'

  // Power/Toughness
  const gPT = parsePT(guessed.power)
  const tPT = parsePT(target.power)
  const ptCompare = compareNumeric(gPT, tPT)

  const columns: GuessResult['columns'] = {
    name: guessed.name === target.name ? 'correct' : 'wrong',
    color_identity: { feedback: colorFeedback },
    type_line: typeLineFeedback,
    subtypes: subtypesFeedback,
    cmc: compareNumeric(guessed.cmc, target.cmc),
    power_toughness: ptCompare,
    rarity: guessed.rarity === target.rarity ? 'correct' : 'wrong',
    set: guessed.original_set === target.original_set ? 'correct' : 'wrong',
  }

  return { guessedCard: guessed, columns, correct: guessed.name === target.name }
}

export function filterCandidates(cards: Card[], results: GuessResult[]): Card[] {
  if (results.length === 0) return cards
  const guessedNames = new Set(results.map(r => r.guessedCard.name))

  return cards.filter(candidate => {
    if (guessedNames.has(candidate.name)) return false

    for (const result of results) {
      const g = result.guessedCard
      const c = result.columns

      // Color identity
      const gColors = g.color_identity
      const cColors = candidate.color_identity
      const overlap = gColors.filter(x => cColors.includes(x))
      if (c.color_identity.feedback === 'correct') {
        if (cColors.length !== gColors.length || overlap.length !== gColors.length) return false
      } else if (c.color_identity.feedback === 'partial') {
        if (overlap.length === 0) return false
        if (cColors.length === gColors.length && overlap.length === gColors.length) return false
      } else {
        if (overlap.length > 0) return false
      }

      // Type line (card_type + supertypes)
      const typeMatch = candidate.card_type === g.card_type
      const cSupStr = [...candidate.supertypes].sort().join(',')
      const gSupStr2 = [...g.supertypes].sort().join(',')
      const supertypeMatch = cSupStr === gSupStr2
      if (c.type_line === 'correct' && !(typeMatch && supertypeMatch)) return false
      if (c.type_line === 'partial' && !(typeMatch || supertypeMatch)) return false
      if (c.type_line === 'partial' && typeMatch && supertypeMatch) return false
      if (c.type_line === 'wrong' && (typeMatch || supertypeMatch)) return false

      // Subtypes
      const gSubs = extractSubtypes(g.type_line)
      const cSubs = extractSubtypes(candidate.type_line)
      const subOverlap = gSubs.filter(s => cSubs.includes(s))
      if (c.subtypes === 'correct') {
        if (!(gSubs.length > 0 && cSubs.length > 0 && gSubs.length === cSubs.length && subOverlap.length === cSubs.length)) return false
      } else if (c.subtypes === 'partial') {
        if (subOverlap.length === 0) return false
        if (gSubs.length === cSubs.length && subOverlap.length === cSubs.length) return false
      } else {
        if (subOverlap.length > 0) return false
      }

      // CMC
      if (c.cmc.feedback === 'correct' && candidate.cmc !== g.cmc) return false
      if (c.cmc.feedback === 'wrong' && c.cmc.direction === 'higher' && candidate.cmc <= g.cmc) return false
      if (c.cmc.feedback === 'wrong' && c.cmc.direction === 'lower' && candidate.cmc >= g.cmc) return false

      // Rarity
      if (c.rarity === 'correct' && candidate.rarity !== g.rarity) return false
      if (c.rarity === 'wrong' && candidate.rarity === g.rarity) return false

      // Set (compare original printing)
      if (c.set === 'correct' && candidate.original_set !== g.original_set) return false
      if (c.set === 'wrong' && candidate.original_set === g.original_set) return false
    }

    return true
  })
}
