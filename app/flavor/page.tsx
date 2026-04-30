import { getDailyCard } from '@/lib/daily'
import cards from '@/data/cards.json'
import type { Card } from '@/lib/types'
import FlavorGame from './FlavorGame'

export default function FlavorPage() {
  const cardPool = (cards as Card[]).filter(c => c.flavor_text !== null)
  const dailyCard = getDailyCard('flavor', cardPool)
  return <FlavorGame cards={cardPool} dailyCard={dailyCard} />
}
