'use client'

import { useState, useEffect } from 'react'
import type { Card } from '@/lib/types'
import type { GuessResult } from '@/lib/compare'
import { compareCards } from '@/lib/compare'
import { loadResult, saveResult } from '@/lib/storage'
import CardSearch from '@/components/CardSearch'
import GuessGrid from '@/components/GuessGrid'
import ResultModal from '@/components/ResultModal'

const MAX_GUESSES = 8

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

interface Props {
  cards: Card[]
  dailyCard: Card
}

export default function ClassicGame({ cards, dailyCard }: Props) {
  const [results, setResults] = useState<GuessResult[]>([])
  const [showModal, setShowModal] = useState(false)
  const [done, setDone] = useState(false)
  const [solved, setSolved] = useState(false)

  // Restore from localStorage on mount
  useEffect(() => {
    const saved = loadResult(todayStr(), 'classic')
    if (!saved) return
    const pastResults: GuessResult[] = saved.guesses
      .map(name => cards.find(c => c.name === name))
      .filter((c): c is Card => !!c)
      .map(c => compareCards(c, dailyCard))
    setResults(pastResults)
    if (saved.solved || saved.guesses.length >= MAX_GUESSES) {
      setSolved(saved.solved)
      setDone(true)
    }
  }, [cards, dailyCard])

  function handleGuess(card: Card) {
    const result = compareCards(card, dailyCard)
    const next = [...results, result]
    setResults(next)

    const isCorrect = result.correct
    const isLast = next.length >= MAX_GUESSES

    if (isCorrect || isLast) {
      setSolved(isCorrect)
      setDone(true)
      setShowModal(true)
      saveResult({
        date: todayStr(),
        mode: 'classic',
        solved: isCorrect,
        guesses: next.map(r => r.guessedCard.name),
      })
    }
  }

  const guessedNames = results.map(r => r.guessedCard.name)

  return (
    <main className="flex flex-col items-center min-h-screen px-4 py-8 gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Carddle</h1>
        <p className="text-[#9b8a6e] text-sm mt-1">Guess today's Magic card</p>
      </div>

      <div className="text-[#9b8a6e] text-sm">
        {results.length} / {MAX_GUESSES} guesses
        {done && !showModal && (
          <button
            onClick={() => setShowModal(true)}
            className="ml-4 underline hover:text-[#e8e0d0]"
          >
            Show result
          </button>
        )}
      </div>

      <CardSearch
        cards={cards}
        guessedNames={guessedNames}
        onGuess={handleGuess}
        disabled={done}
      />

      <GuessGrid results={results} />

      {showModal && (
        <ResultModal
          card={dailyCard}
          solved={solved}
          guessCount={results.length}
          onClose={() => setShowModal(false)}
        />
      )}
    </main>
  )
}
