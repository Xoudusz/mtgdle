import { getDailyCard } from '@/lib/daily'
import cards from '@/data/cards.json'
import type { Card } from '@/lib/types'
import ClassicGame from './ClassicGame'

export default function ClassicPage() {
  const cardPool = cards as Card[]
  const dailyCard = getDailyCard('classic', cardPool)
  return <ClassicGame cards={cardPool} dailyCard={dailyCard} />
}
