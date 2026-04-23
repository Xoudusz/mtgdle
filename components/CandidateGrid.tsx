'use client'

import { useState } from 'react'
import type { Card } from '@/lib/types'
import ManaSymbol from './ManaSymbol'

interface Props {
  candidates: Card[]
  label: string
  onGuess: (card: Card) => void
  clickable?: boolean
}

const COLORS = ['W', 'U', 'B', 'R', 'G']
const COLOR_NAMES: Record<string, string> = { W: 'White', U: 'Blue', B: 'Black', R: 'Red', G: 'Green' }
const RARITIES = ['common', 'uncommon', 'rare', 'mythic']
const RARITY_LABELS: Record<string, string> = { common: 'C', uncommon: 'U', rare: 'R', mythic: 'M' }
const RARITY_NAMES: Record<string, string> = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', mythic: 'Mythic' }
const TYPES = ['All', 'Creature', 'Instant', 'Sorcery', 'Artifact', 'Enchantment', 'Land', 'Planeswalker']

function toggle<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]
}

export default function CandidateGrid({ candidates, label, onGuess, clickable }: Props) {
  const [open, setOpen] = useState(false)
  const [nameFilter, setNameFilter] = useState('')
  const [colorFilter, setColorFilter] = useState<string[]>([])
  const [colorless, setColorless] = useState(false)
  const [typeFilter, setTypeFilter] = useState('All')
  const [rarityFilter, setRarityFilter] = useState<string[]>([])

  function clearAll() {
    setNameFilter('')
    setColorFilter([])
    setColorless(false)
    setTypeFilter('All')
    setRarityFilter([])
  }

  function closeModal() {
    setOpen(false)
    clearAll()
  }

  const filtered = candidates.filter(card => {
    if (nameFilter && !card.name.toLowerCase().includes(nameFilter.toLowerCase())) return false
    if (colorless) {
      if (card.color_identity.length !== 0) return false
    } else if (colorFilter.length > 0) {
      if (!colorFilter.some(c => card.color_identity.includes(c))) return false
    }
    if (typeFilter !== 'All' && card.card_type !== typeFilter) return false
    if (rarityFilter.length > 0 && !rarityFilter.includes(card.rarity)) return false
    return true
  })

  // Build active chips
  const chips: { label: string; onRemove: () => void }[] = [
    ...colorFilter.map(c => ({ label: COLOR_NAMES[c], onRemove: () => setColorFilter(f => f.filter(x => x !== c)) })),
    ...(colorless ? [{ label: 'Colorless', onRemove: () => setColorless(false) }] : []),
    ...(typeFilter !== 'All' ? [{ label: typeFilter, onRemove: () => setTypeFilter('All') }] : []),
    ...rarityFilter.map(r => ({ label: RARITY_NAMES[r], onRemove: () => setRarityFilter(f => f.filter(x => x !== r)) })),
  ]

  const btn = (active: boolean) =>
    `h-7 rounded border transition-colors flex items-center justify-center text-xs font-bold ${
      active
        ? 'border-[#8b6914] bg-[#2a1f0a] text-[#e8e0d0]'
        : 'border-[#3a3020] bg-[#1a1510] text-[#9b8a6e] hover:border-[#8b6914]'
    }`

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-lg border border-[#3a3020] bg-[#1a1510] hover:border-[#8b6914] text-sm transition-colors"
      >
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-[#0f0f0f] border border-[#3a3020] rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#3a3020] flex-shrink-0">
              <div>
                <h2 className="font-bold text-lg">{label}</h2>
                <p className="text-[#6b5a3e] text-xs">{filtered.length} card{filtered.length !== 1 ? 's' : ''}</p>
              </div>
              <button onClick={closeModal} className="text-[#9b8a6e] hover:text-[#e8e0d0] text-xl leading-none">✕</button>
            </div>

            {/* Filter controls */}
            <div className="px-4 py-3 border-b border-[#3a3020] flex flex-col gap-2 flex-shrink-0">
              {/* Row 1: search */}
              <input
                type="text"
                placeholder="Search by name…"
                value={nameFilter}
                onChange={e => setNameFilter(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-[#3a3020] bg-[#1a1510] text-sm text-[#e8e0d0] placeholder-[#6b5a3e] focus:outline-none focus:border-[#8b6914]"
              />

              {/* Row 2: color + rarity + type in one line */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => { setColorless(false); setColorFilter(f => toggle(f, c)) }}
                    className={`w-7 ${btn(colorFilter.includes(c) && !colorless)}`}
                  >
                    <ManaSymbol symbol={c} size={18} />
                  </button>
                ))}
                <button
                  onClick={() => { setColorFilter([]); setColorless(v => !v) }}
                  className={`w-7 ${btn(colorless)}`}
                >
                  <ManaSymbol symbol="C" size={18} />
                </button>

                <span className="w-px h-5 bg-[#3a3020] mx-0.5" />

                {RARITIES.map(r => (
                  <button
                    key={r}
                    onClick={() => setRarityFilter(f => toggle(f, r))}
                    className={`w-7 ${btn(rarityFilter.includes(r))}`}
                  >
                    {RARITY_LABELS[r]}
                  </button>
                ))}

                <span className="w-px h-5 bg-[#3a3020] mx-0.5" />

                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  className="h-7 rounded border border-[#3a3020] bg-[#1a1510] text-[#9b8a6e] text-xs px-2 focus:outline-none focus:border-[#8b6914] cursor-pointer"
                >
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Active chips */}
              {chips.length > 0 && (
                <div className="flex flex-wrap gap-1.5 items-center">
                  {chips.map(chip => (
                    <span
                      key={chip.label}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-[#8b6914] bg-[#2a1f0a] text-[#e8e0d0] text-xs"
                    >
                      {chip.label}
                      <button
                        onClick={chip.onRemove}
                        className="text-[#9b8a6e] hover:text-[#e8e0d0] leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={clearAll}
                    className="text-[#6b5a3e] hover:text-[#9b8a6e] text-xs underline"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Card grid */}
            <div className="overflow-y-auto p-4">
              {filtered.length === 0 ? (
                <p className="text-center text-[#9b8a6e] py-8">No cards match the filters.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {filtered.map(card => (
                    <div
                      key={card.id}
                      className={`flex flex-col items-center gap-1 group ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
                      onClick={() => {
                        if (clickable) { onGuess(card); closeModal() }
                      }}
                    >
                      {card.image_uris?.normal ? (
                        <img
                          src={card.image_uris.normal}
                          alt={card.name}
                          className={`rounded-lg w-full object-cover shadow-md transition-all ${clickable ? 'group-hover:ring-2 group-hover:ring-[#8b6914]' : ''}`}
                        />
                      ) : (
                        <div className="w-full aspect-[5/7] rounded-lg bg-[#1a1510] border border-[#3a3020] flex items-center justify-center text-xs text-[#6b5a3e]">
                          ?
                        </div>
                      )}
                      <span className="text-[10px] text-[#9b8a6e] text-center leading-tight line-clamp-2">
                        {card.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
