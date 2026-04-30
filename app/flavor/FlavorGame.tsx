'use client'

import { useState, useEffect, useRef } from 'react'
import type { Card } from '@/lib/types'
import { loadResult, saveResult } from '@/lib/storage'
import { submitStats, fetchStats } from '@/lib/stats'
import CardSearch from '@/components/CardSearch'
import ResultModal from '@/components/ResultModal'
import FlavorText from '@/components/FlavorText'
import HintStrip from '@/components/HintStrip'

const MAX_GUESSES = 6

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

interface Props {
  cards: Card[]
  dailyCard: Card
}

export default function FlavorGame({ cards, dailyCard }: Props) {
  const [guesses, setGuesses] = useState<{ name: string; correct: boolean }[]>([])
  const [showModal, setShowModal] = useState(false)
  const [showContinueModal, setShowContinueModal] = useState(false)
  const [done, setDone] = useState(false)
  const [solved, setSolved] = useState(false)
  const [continued, setContinued] = useState(false)
  const [stats, setStats] = useState<{ total: number; solves: number } | null>(null)
  const statsSubmitted = useRef(false)

  useEffect(() => {
    const saved = loadResult(todayStr(), 'flavor')
    if (!saved) return
    const restored = saved.guesses.map(name => ({ name, correct: name === dailyCard.name }))
    setGuesses(restored)
    if (saved.solved) {
      setSolved(true)
      setDone(true)
      statsSubmitted.current = true
    } else if (saved.continued) {
      setContinued(true)
    } else if (saved.guesses.length >= MAX_GUESSES) {
      statsSubmitted.current = true
      setShowContinueModal(true)
    }
  }, [dailyCard])

  async function handleGuess(card: Card) {
    const correct = card.name === dailyCard.name
    const next = [...guesses, { name: card.name, correct }]
    setGuesses(next)

    if (correct) {
      setSolved(true)
      setDone(true)
      setShowModal(true)
      saveResult({ date: todayStr(), mode: 'flavor', solved: true, guesses: next.map(g => g.name) })
      if (!statsSubmitted.current) {
        statsSubmitted.current = true
        await submitStats({ mode: 'flavor', date: todayStr(), card_id: dailyCard.id, guess_count: next.length, solved: true })
        setStats(await fetchStats('flavor', todayStr()))
      }
      return
    }

    saveResult({ date: todayStr(), mode: 'flavor', solved: false, guesses: next.map(g => g.name), continued })

    if (!continued && next.length >= MAX_GUESSES) {
      setShowContinueModal(true)
    }
  }

  async function handleGiveUp() {
    setShowContinueModal(false)
    setDone(true)
    setShowModal(true)
    saveResult({ date: todayStr(), mode: 'flavor', solved: false, guesses: guesses.map(g => g.name) })
    if (!statsSubmitted.current) {
      statsSubmitted.current = true
      await submitStats({ mode: 'flavor', date: todayStr(), card_id: dailyCard.id, guess_count: guesses.length, solved: false })
      setStats(await fetchStats('flavor', todayStr()))
    }
  }

  function handleContinue() {
    setShowContinueModal(false)
    setContinued(true)
    saveResult({ date: todayStr(), mode: 'flavor', solved: false, guesses: guesses.map(g => g.name), continued: true })
  }

  const guessedNames = guesses.map(g => g.name)
  const wrongGuesses = guesses.filter(g => !g.correct)

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Flavordle</h1>
          <p className="text-[#9b8a6e] text-sm mt-1">Guess today's card from its flavor text</p>
        </div>

        <div className="text-[#9b8a6e] text-sm">
          {guesses.length} / {MAX_GUESSES} guesses
          {done && !showModal && (
            <button onClick={() => setShowModal(true)} className="ml-4 underline hover:text-[#e8e0d0]">
              Show result
            </button>
          )}
        </div>

        <FlavorText text={dailyCard.flavor_text!} />

        <HintStrip card={dailyCard} wrongCount={wrongGuesses.length} />

        {guesses.length > 0 && (
          <ul className="w-full flex flex-col gap-1">
            {guesses.map((g, i) => (
              <li key={i} className={`text-sm flex items-center gap-2 ${g.correct ? 'text-green-400' : 'text-red-400'}`}>
                <span>{g.correct ? '✓' : '✗'}</span>
                <span>{g.name}</span>
              </li>
            ))}
          </ul>
        )}

        <CardSearch
          cards={cards}
          guessedNames={guessedNames}
          onGuess={handleGuess}
          disabled={done}
        />

        {showContinueModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-[#0f0f0f] border border-[#3a3020] rounded-xl w-full max-w-sm p-6 flex flex-col items-center gap-4 text-center">
              <p className="text-lg font-bold">Out of guesses</p>
              <p className="text-[#9b8a6e] text-sm">Do you want to keep trying or see the answer?</p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleContinue}
                  className="flex-1 px-4 py-2 rounded-lg border border-[#3a3020] bg-[#1a1510] hover:border-[#8b6914] text-sm transition-colors"
                >
                  Keep trying
                </button>
                <button
                  onClick={handleGiveUp}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-950 border border-red-800 hover:border-red-600 text-sm transition-colors"
                >
                  Give up
                </button>
              </div>
            </div>
          </div>
        )}

        {showModal && (
          <ResultModal
            card={dailyCard}
            solved={solved}
            guessCount={guesses.length}
            onClose={() => setShowModal(false)}
            stats={stats ?? undefined}
          />
        )}
      </div>
    </main>
  )
}
