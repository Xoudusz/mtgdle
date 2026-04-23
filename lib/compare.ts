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
    power_toughness: { feedback: Feedback; powerDirection: Direction; toughnessDirection: Direction }
    rarity: Feedback
    set: { feedback: Feedback; direction: Direction }
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

function compareSet(guessed: Card, target: Card): { feedback: Feedback; direction: Direction } {
  // Same set = correct (no arrow needed)
  if (guessed.original_set === target.original_set) {
    return { feedback: 'correct', direction: null }
  }
  // Different set, same year = partial (no arrow)
  if (guessed.original_year === target.original_year) {
    return { feedback: 'partial', direction: null }
  }
  // Different year = wrong with direction arrow
  const guessedYM = guessed.original_year * 100 + guessed.original_month
  const targetYM = target.original_year * 100 + target.original_month
  const direction: Direction = guessedYM < targetYM ? 'higher' : 'lower'
  return { feedback: 'wrong', direction }
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
  // Only count supertype match if at least one has supertypes
  const bothSupertypesEmpty = guessed.supertypes.length === 0 && target.supertypes.length === 0
  const supertypeMatch =
    (guessed.supertypes.length > 0 || target.supertypes.length > 0) && gSupStr === tSupStr
  const typeLineFeedback: Feedback =
    typeMatch && (supertypeMatch || bothSupertypesEmpty)
      ? 'correct'
      : typeMatch || supertypeMatch
      ? 'partial'
      : 'wrong'

  // Subtypes: exact = correct, overlap = partial, no overlap or both empty = wrong
  const guessedSubs = extractSubtypes(guessed.type_line)
  const targetSubs = extractSubtypes(target.type_line)
  const subIntersection = guessedSubs.filter(s => targetSubs.includes(s))
  const subtypesFeedback: Feedback =
    guessedSubs.length === 0 && targetSubs.length === 0
      ? 'correct'
      : guessedSubs.length > 0 && targetSubs.length > 0 &&
        guessedSubs.length === targetSubs.length && subIntersection.length === targetSubs.length
        ? 'correct'
        : subIntersection.length > 0
        ? 'partial'
        : 'wrong'

  // Power/Toughness: correct=both match, partial=one matches, wrong=neither; arrow per mismatching stat
  const gP = parsePT(guessed.power)
  const tP = parsePT(target.power)
  const gT = parsePT(guessed.toughness)
  const tT = parsePT(target.toughness)
  const powerMatch = gP !== null && tP !== null && gP === tP
  const toughnessMatch = gT !== null && tT !== null && gT === tT
  let ptFeedback: Feedback
  if (powerMatch && toughnessMatch) ptFeedback = 'correct'
  else if (powerMatch || toughnessMatch) ptFeedback = 'partial'
  else ptFeedback = 'wrong'
  const powerDirection: Direction = powerMatch || gP === null || tP === null ? null : gP < tP ? 'higher' : 'lower'
  const toughnessDirection: Direction = toughnessMatch || gT === null || tT === null ? null : gT < tT ? 'higher' : 'lower'
  const ptCompare = { feedback: ptFeedback, powerDirection, toughnessDirection }

  const columns: GuessResult['columns'] = {
    name: guessed.name === target.name ? 'correct' : 'wrong',
    color_identity: { feedback: colorFeedback },
    type_line: typeLineFeedback,
    subtypes: subtypesFeedback,
    cmc: compareNumeric(guessed.cmc, target.cmc),
    power_toughness: ptCompare,
    rarity: guessed.rarity === target.rarity ? 'correct' : 'wrong',
    set: compareSet(guessed, target),
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
      const gSupStr = [...g.supertypes].sort().join(',')
      // Only count supertype match if at least one has supertypes
      const bothSupertypesEmpty = candidate.supertypes.length === 0 && g.supertypes.length === 0
      const supertypeMatch =
        (candidate.supertypes.length > 0 || g.supertypes.length > 0) && cSupStr === gSupStr
      if (c.type_line === 'correct' && !(typeMatch && (supertypeMatch || bothSupertypesEmpty))) return false
      if (c.type_line === 'partial' && !(typeMatch || supertypeMatch)) return false
      if (c.type_line === 'partial' && typeMatch && (supertypeMatch || bothSupertypesEmpty)) return false
      if (c.type_line === 'wrong' && (typeMatch || supertypeMatch)) return false

      // Subtypes
      const gSubs = extractSubtypes(g.type_line)
      const cSubs = extractSubtypes(candidate.type_line)
      const subOverlap = gSubs.filter(s => cSubs.includes(s))
      if (c.subtypes === 'correct') {
        const bothEmpty = gSubs.length === 0 && cSubs.length === 0
        const exactMatch = gSubs.length > 0 && cSubs.length > 0 && gSubs.length === cSubs.length && subOverlap.length === cSubs.length
        if (!bothEmpty && !exactMatch) return false
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

      // Power/Toughness
      const gPow = parsePT(g.power)
      const gTou = parsePT(g.toughness)
      const cPow = parsePT(candidate.power)
      const cTou = parsePT(candidate.toughness)
      const powMatch = gPow !== null && cPow !== null && cPow === gPow
      const touMatch = gTou !== null && cTou !== null && cTou === gTou
      if (c.power_toughness.feedback === 'correct') {
        if (!powMatch || !touMatch) return false
      } else if (c.power_toughness.feedback === 'partial') {
        if (powMatch === touMatch) return false
      } else {
        if (powMatch || touMatch) return false
        if (c.power_toughness.powerDirection === 'higher' && gPow !== null && cPow !== null && cPow <= gPow) return false
        if (c.power_toughness.powerDirection === 'lower' && gPow !== null && cPow !== null && cPow >= gPow) return false
        if (c.power_toughness.toughnessDirection === 'higher' && gTou !== null && cTou !== null && cTou <= gTou) return false
        if (c.power_toughness.toughnessDirection === 'lower' && gTou !== null && cTou !== null && cTou >= gTou) return false
      }

      // Set with year filtering
      const setMatch = candidate.original_set === g.original_set
      const yearMatch = candidate.original_year === g.original_year
      if (c.set.feedback === 'correct') {
        // Must match set exactly
        if (!setMatch) return false
      } else if (c.set.feedback === 'partial') {
        // Must match year but not set
        if (!yearMatch || setMatch) return false
      } else {
        // Wrong: different year, respect direction
        if (yearMatch) return false
        if (c.set.direction === 'higher') {
          // Target is newer, so candidate must be newer than guess
          const candYM = candidate.original_year * 100 + candidate.original_month
          const guessYM = g.original_year * 100 + g.original_month
          if (candYM <= guessYM) return false
        } else if (c.set.direction === 'lower') {
          // Target is older, so candidate must be older than guess
          const candYM = candidate.original_year * 100 + candidate.original_month
          const guessYM = g.original_year * 100 + g.original_month
          if (candYM >= guessYM) return false
        }
      }
    }

    return true
  })
}
