'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { Card } from '@/lib/types'
import { parseMana } from '@/lib/mana'
import ManaSymbol from '@/components/ManaSymbol'

interface Props {
  cards: Card[]
  guessedNames: string[]
  onGuess: (card: Card) => void
  disabled?: boolean
}

export default function CardSearch({ cards, guessedNames, onGuess, disabled }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const filtered = query.length < 1
    ? []
    : cards
        .filter(c => !guessedNames.includes(c.name) && c.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 10)

  const noMatch = query.length >= 1 && filtered.length === 0

  useEffect(() => {
    setOpen(filtered.length > 0 || noMatch)
    setHighlighted(-1)
  }, [query])

  function select(card: Card) {
    onGuess(card)
    setQuery('')
    setOpen(false)
    setHighlighted(-1)
    inputRef.current?.focus()
  }

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted(h => Math.min(h + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted(h => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlighted >= 0 && filtered[highlighted]) select(filtered[highlighted])
    } else if (e.key === 'Escape') {
      setOpen(false)
      setHighlighted(-1)
    }
  }, [open, highlighted, filtered])

  return (
    <div className="relative w-full max-w-md">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => { if (filtered.length > 0 || noMatch) setOpen(true) }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Type a card name…"
        disabled={disabled}
        autoComplete="off"
        className="w-full px-4 py-3 rounded-lg bg-[#1a1510] border border-[#3a3020] text-[#e8e0d0] placeholder-[#6b5a3e] focus:outline-none focus:border-[#8b6914] disabled:opacity-50"
      />
      {!query && (
        <p className="mt-1 text-xs text-[#6b5a3e]">Only cards in today's pool can be guessed</p>
      )}
      {open && (
        <ul
          ref={listRef}
          className="absolute z-10 w-full mt-1 bg-[#1a1510] border border-[#3a3020] rounded-lg overflow-hidden shadow-xl max-h-[360px] overflow-y-auto"
        >
          {noMatch ? (
            <li className="px-4 py-3 text-sm text-[#6b5a3e] italic">Not in card pool</li>
          ) : (
            filtered.map((card, i) => {
              const manaPips = parseMana(card.mana_cost)
              const isLegendary = card.supertypes.includes('Legendary')
              return (
                <li key={card.id}>
                  <button
                    type="button"
                    onMouseDown={() => select(card)}
                    className={`w-full text-left px-3 py-1.5 text-sm transition-colors flex items-center gap-2 ${
                      i === highlighted
                        ? isLegendary ? 'bg-[#3a2a10]' : 'bg-[#1f1f1f]'
                        : isLegendary ? 'hover:bg-[#2a1e08]' : 'hover:bg-[#1f1f1f]'
                    }`}
                  >
                    {card.image_uris?.art_crop && (
                      <img
                        src={card.image_uris.art_crop}
                        alt=""
                        width={40}
                        height={30}
                        className="rounded flex-shrink-0 object-cover"
                        style={{ width: 40, height: 30 }}
                      />
                    )}
                    <span className="flex-1 min-w-0 truncate">
                      {card.name}
                      {isLegendary && <span className="ml-1.5 text-[#8b6914] text-xs">★</span>}
                    </span>
                    {manaPips.length > 0 && (
                      <span className="flex items-center gap-0.5 flex-shrink-0">
                        {manaPips.map((pip, j) => (
                          <ManaSymbol key={j} symbol={pip} size={14} />
                        ))}
                      </span>
                    )}
                  </button>
                </li>
              )
            })
          )}
        </ul>
      )}
    </div>
  )
}
