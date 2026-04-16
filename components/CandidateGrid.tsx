'use client'

import { useState } from 'react'
import type { Card } from '@/lib/types'

interface Props {
  candidates: Card[]
  label: string
  onGuess: (card: Card) => void
  clickable?: boolean
}

export default function CandidateGrid({ candidates, label, onGuess, clickable }: Props) {
  const [open, setOpen] = useState(false)

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
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-[#0f0f0f] border border-[#3a3020] rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#3a3020] flex-shrink-0">
              <h2 className="font-bold text-lg">{label}</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-[#9b8a6e] hover:text-[#e8e0d0] text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto p-4">
              {candidates.length === 0 ? (
                <p className="text-center text-[#9b8a6e] py-8">No candidates match all constraints.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {candidates.map(card => (
                    <div
                      key={card.id}
                      className={`flex flex-col items-center gap-1 group ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
                      onClick={() => {
                        if (clickable) {
                          onGuess(card)
                          setOpen(false)
                        }
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
