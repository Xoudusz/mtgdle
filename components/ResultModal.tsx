'use client'

import type { Card } from '@/lib/types'
import Image from 'next/image'

interface Props {
  card: Card
  solved: boolean
  guessCount: number
  onClose: () => void
}

export default function ResultModal({ card, solved, guessCount, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1510] border border-[#8b6914] rounded-xl max-w-sm w-full p-6 flex flex-col items-center gap-4"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold">
          {solved ? '🎉 Solved!' : '💀 Better luck tomorrow'}
        </h2>
        {card.image_uris && (
          <Image
            src={card.image_uris.normal}
            alt={card.name}
            width={245}
            height={340}
            className="rounded-lg"
          />
        )}
        <p className="text-center">
          <span className="text-[#9b8a6e]">Today's card: </span>
          <span className="font-bold">{card.name}</span>
        </p>
        {solved && (
          <p className="text-[#9b8a6e] text-sm">
            Solved in {guessCount} guess{guessCount !== 1 ? 'es' : ''}
          </p>
        )}
        <button
          onClick={onClose}
          className="mt-2 px-6 py-2 rounded-lg bg-[#8b6914] hover:bg-[#a07a1a] transition-colors font-bold"
        >
          Close
        </button>
      </div>
    </div>
  )
}
