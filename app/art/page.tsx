import { getDailyCard, getDayIndex } from '@/lib/daily'
import cards from '@/data/cards.json'
import type { Card } from '@/lib/types'
import ArtGame from './ArtGame'

export default function ArtPage() {
  const cardPool = cards as Card[]
  const dailyCard = getDailyCard('art', cardPool)
  const seed = getDayIndex() + 1000
  const anchorX = [25, 50, 75][seed % 3]
  const anchorY = [25, 40, 60, 75][Math.floor(seed / 3) % 4]
  return <ArtGame cards={cardPool} dailyCard={dailyCard} anchorX={anchorX} anchorY={anchorY} />
}
