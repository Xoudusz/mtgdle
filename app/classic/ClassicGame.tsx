'use client'

import { useState, useEffect, useRef } from 'react'
import type { Card } from '@/lib/types'
import type { GuessResult } from '@/lib/compare'
import { compareCards, filterCandidates } from '@/lib/compare'
import { loadResult, saveResult } from '@/lib/storage'
import { submitStats, fetchStats } from '@/lib/stats'
import CardSearch from '@/components/CardSearch'
import GuessGrid from '@/components/GuessGrid'
import CandidateGrid from '@/components/CandidateGrid'
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
  const [showContinueModal, setShowContinueModal] = useState(false)
  const [done, setDone] = useState(false)
  const [solved, setSolved] = useState(false)
  const [continued, setContinued] = useState(false)
  const [stats, setStats] = useState<{ total: number; solves: number } | null>(null)
  const statsSubmitted = useRef(false)

  // Restore from localStorage on mount
  useEffect(() => {
    const saved = loadResult(todayStr(), 'classic')
    if (!saved) return
    const pastResults: GuessResult[] = saved.guesses
      .map(name => cards.find(c => c.name === name))
      .filter((c): c is Card => !!c)
      .map(c => compareCards(c, dailyCard))
    setResults(pastResults)
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
  }, [cards, dailyCard])

  async function handleGuess(card: Card) {
    const result = compareCards(card, dailyCard)
    const next = [...results, result]
    setResults(next)

    if (result.correct) {
      setSolved(true)
      setDone(true)
      setShowModal(true)
      saveResult({
        date: todayStr(),
        mode: 'classic',
        solved: true,
        guesses: next.map(r => r.guessedCard.name),
      })
      if (!statsSubmitted.current) {
        statsSubmitted.current = true
        await submitStats({ mode: 'classic', date: todayStr(), card_id: dailyCard.id, guess_count: next.length, solved: true })
        setStats(await fetchStats('classic', todayStr()))
      }
      return
    }

    saveResult({
      date: todayStr(),
      mode: 'classic',
      solved: false,
      guesses: next.map(r => r.guessedCard.name),
      continued,
    })

    if (!continued && next.length >= MAX_GUESSES) {
      setShowContinueModal(true)
    }
  }

  async function handleGiveUp() {
    setShowContinueModal(false)
    setDone(true)
    setShowModal(true)
    saveResult({
      date: todayStr(),
      mode: 'classic',
      solved: false,
      guesses: results.map(r => r.guessedCard.name),
    })
    if (!statsSubmitted.current) {
      statsSubmitted.current = true
      await submitStats({ mode: 'classic', date: todayStr(), card_id: dailyCard.id, guess_count: results.length, solved: false })
      setStats(await fetchStats('classic', todayStr()))
    }
  }

  function handleContinue() {
    setShowContinueModal(false)
    setContinued(true)
    saveResult({
      date: todayStr(),
      mode: 'classic',
      solved: false,
      guesses: results.map(r => r.guessedCard.name),
      continued: true,
    })
  }

  const guessedNames = results.map(r => r.guessedCard.name)
  const showPT =
    dailyCard.card_type === 'Creature' &&
    results.some(r => r.guessedCard.card_type === 'Creature')
  const candidates = filterCandidates(cards, results)

  const unlocked = continued
  const displayCandidates = unlocked ? candidates : cards
  const candidateLabel = unlocked
    ? `Browse ${candidates.length} possible cards`
    : `Browse ${cards.length} cards`

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6">
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

        <GuessGrid results={results} showPT={showPT} />

        {results.length > 0 && (
          <CandidateGrid
            candidates={displayCandidates}
            label={candidateLabel}
            onGuess={handleGuess}
            clickable={!done}
          />
        )}

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
            guessCount={results.length}
            onClose={() => setShowModal(false)}
            stats={stats ?? undefined}
          />
        )}
      </div>
    </main>
  )
}
