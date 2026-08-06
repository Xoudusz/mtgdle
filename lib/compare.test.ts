import { describe, it, expect } from 'vitest'
import { extractSubtypes, compareCards, filterCandidates } from './compare'
import type { Card } from './types'

function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    id: 'test-id',
    name: 'Test Card',
    color_identity: [],
    type_line: 'Instant',
    card_type: 'Instant',
    supertypes: [],
    mana_cost: '{1}',
    cmc: 1,
    power: null,
    toughness: null,
    rarity: 'common',
    set: 'M21',
    set_name: 'Core Set 2021',
    original_set: 'M21',
    original_set_name: 'Core Set 2021',
    original_year: 2020,
    original_month: 7,
    flavor_text: null,
    image_uris: null,
    edhrec_rank: null,
    ...overrides,
  }
}

describe('extractSubtypes', () => {
  it('returns empty array when no em dash', () => {
    expect(extractSubtypes('Instant')).toEqual([])
  })

  it('returns subtypes after em dash', () => {
    expect(extractSubtypes('Legendary Creature — Dragon Wizard')).toEqual(['Dragon', 'Wizard'])
  })

  it('returns single subtype', () => {
    expect(extractSubtypes('Creature — Goblin')).toEqual(['Goblin'])
  })
})

describe('compareCards', () => {
  it('marks identical cards as correct', () => {
    const card = makeCard({ name: 'Lightning Bolt' })
    const result = compareCards(card, card)
    expect(result.correct).toBe(true)
    expect(result.columns.name).toBe('correct')
    expect(result.columns.rarity).toBe('correct')
    expect(result.columns.cmc.feedback).toBe('correct')
  })

  it('gives correct color feedback for exact color match', () => {
    const guessed = makeCard({ color_identity: ['R'] })
    const target = makeCard({ color_identity: ['R'] })
    expect(compareCards(guessed, target).columns.color_identity.feedback).toBe('correct')
  })

  it('gives partial color feedback for overlapping colors', () => {
    const guessed = makeCard({ color_identity: ['R', 'G'] })
    const target = makeCard({ color_identity: ['R', 'U'] })
    expect(compareCards(guessed, target).columns.color_identity.feedback).toBe('partial')
  })

  it('gives wrong color feedback for no overlap', () => {
    const guessed = makeCard({ color_identity: ['R'] })
    const target = makeCard({ color_identity: ['U'] })
    expect(compareCards(guessed, target).columns.color_identity.feedback).toBe('wrong')
  })

  it('gives higher direction when guessed cmc is lower than target', () => {
    const guessed = makeCard({ cmc: 2 })
    const target = makeCard({ cmc: 4 })
    const result = compareCards(guessed, target)
    expect(result.columns.cmc.feedback).toBe('wrong')
    expect(result.columns.cmc.direction).toBe('higher')
  })

  it('gives lower direction when guessed cmc is higher than target', () => {
    const guessed = makeCard({ cmc: 5 })
    const target = makeCard({ cmc: 2 })
    expect(compareCards(guessed, target).columns.cmc.direction).toBe('lower')
  })

  it('marks same rarity as correct', () => {
    const guessed = makeCard({ rarity: 'rare' })
    const target = makeCard({ rarity: 'rare' })
    expect(compareCards(guessed, target).columns.rarity).toBe('correct')
  })

  it('marks different rarity as wrong', () => {
    const guessed = makeCard({ rarity: 'common' })
    const target = makeCard({ rarity: 'rare' })
    expect(compareCards(guessed, target).columns.rarity).toBe('wrong')
  })

  it('gives partial PT feedback when only power matches', () => {
    const guessed = makeCard({ power: '3', toughness: '2' })
    const target = makeCard({ power: '3', toughness: '4' })
    const result = compareCards(guessed, target)
    expect(result.columns.power_toughness.feedback).toBe('partial')
    expect(result.columns.power_toughness.powerDirection).toBeNull()
    expect(result.columns.power_toughness.toughnessDirection).toBe('higher')
  })

  it('gives correct set feedback for same set', () => {
    const guessed = makeCard({ original_set: 'LEA', original_year: 1993, original_month: 8 })
    const target = makeCard({ original_set: 'LEA', original_year: 1993, original_month: 8 })
    expect(compareCards(guessed, target).columns.set.feedback).toBe('correct')
  })

  it('gives partial set feedback for same year different set', () => {
    const guessed = makeCard({ original_set: 'LEA', original_year: 1993, original_month: 8 })
    const target = makeCard({ original_set: 'LEB', original_year: 1993, original_month: 10 })
    expect(compareCards(guessed, target).columns.set.feedback).toBe('partial')
  })

  it('gives higher direction when target set is newer', () => {
    const guessed = makeCard({ original_set: 'M21', original_year: 2020, original_month: 7 })
    const target = makeCard({ original_set: 'MOM', original_year: 2023, original_month: 4 })
    const result = compareCards(guessed, target)
    expect(result.columns.set.feedback).toBe('wrong')
    expect(result.columns.set.direction).toBe('higher')
  })
})

describe('filterCandidates', () => {
  it('returns all cards when no results', () => {
    const cards = [makeCard({ name: 'A' }), makeCard({ name: 'B' })]
    expect(filterCandidates(cards, [])).toHaveLength(2)
  })

  it('excludes already-guessed card names', () => {
    const a = makeCard({ name: 'Lightning Bolt', color_identity: ['R'] })
    const b = makeCard({ name: 'Counterspell', color_identity: ['U'] })
    const result = compareCards(a, b)
    const remaining = filterCandidates([a, b], [result])
    expect(remaining.every(c => c.name !== 'Lightning Bolt')).toBe(true)
  })

  it('filters by exact cmc when correct', () => {
    const guessed = makeCard({ name: 'A', cmc: 3 })
    const match = makeCard({ name: 'B', cmc: 3 })
    const noMatch = makeCard({ name: 'C', cmc: 5 })
    const target = makeCard({ name: 'T', cmc: 3 })
    const result = compareCards(guessed, target)
    const remaining = filterCandidates([match, noMatch], [result])
    expect(remaining).toContainEqual(match)
    expect(remaining).not.toContainEqual(noMatch)
  })
})
