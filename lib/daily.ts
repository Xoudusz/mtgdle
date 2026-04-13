import type { Card } from './types'

const EPOCH = new Date('2025-01-01')
const MODE_OFFSET: Record<string, number> = { classic: 0, art: 1000, flavor: 2000 }

export function getDayIndex(): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.floor((today.getTime() - EPOCH.getTime()) / 86400000)
}

export function getDailyCard(mode: 'classic' | 'art' | 'flavor', cards: Card[]): Card {
  if (process.env.TEST_CARD) {
    const override = cards.find(c => c.name === process.env.TEST_CARD)
    if (override) return override
  }
  const dayIndex = getDayIndex()
  return cards[(dayIndex + MODE_OFFSET[mode]) % cards.length]
}
