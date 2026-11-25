import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import { IMPRESSUM, impressumEnabled } from '@/lib/impressum'

export const metadata: Metadata = {
  title: 'Impressum – MTGdle',
}

export default async function ImpressumPage() {
  await connection()
  if (!impressumEnabled()) notFound()
  return (
    <main className="max-w-xl mx-auto px-6 py-12 space-y-4">
      <h1 className="text-2xl font-bold">Impressum</h1>
      <p className="text-sm text-[#8a8070]">Offenlegung gemäß § 25 Mediengesetz (Austrian legal notice)</p>
      <dl className="text-sm space-y-3">
        <div>
          <dt className="text-[#8a8070]">Medieninhaber (owner)</dt>
          <dd>{IMPRESSUM.name}, {IMPRESSUM.city}</dd>
        </div>
        <div>
          <dt className="text-[#8a8070]">Kontakt (contact)</dt>
          <dd>
            <a href={`mailto:${IMPRESSUM.email}`} className="underline hover:text-[#8b6914]">
              {IMPRESSUM.email}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-[#8a8070]">Blattlinie (purpose)</dt>
          <dd>Private, non-commercial fan project: a daily Magic: The Gathering guessing game.</dd>
        </div>
      </dl>
      <p className="text-xs text-[#8a8070]">
        Card data and images © Wizards of the Coast, provided via Scryfall. Not affiliated with or endorsed by Wizards of the Coast.
      </p>
    </main>
  )
}
