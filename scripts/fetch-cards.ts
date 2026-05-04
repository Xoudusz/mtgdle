import * as fs from 'fs'
import * as path from 'path'
import { Readable } from 'stream'
import StreamArray from 'stream-json/streamers/StreamArray'

const BULK_URL = 'https://api.scryfall.com/bulk-data'
const TARGET_COUNT = 1000

interface ScryfallCard {
  id: string
  name: string
  color_identity: string[]
  type_line: string
  cmc: number
  power?: string
  toughness?: string
  rarity: string
  set: string
  set_name: string
  flavor_text?: string
  mana_cost?: string
  image_uris?: { art_crop: string; normal: string; large: string }
  edhrec_rank?: number
  layout: string
  card_faces?: Array<{ mana_cost?: string; image_uris?: { art_crop: string; normal: string; large: string }; flavor_text?: string }>
  promo: boolean
  variation: boolean
  full_art: boolean
  border_color: string
  frame_effects?: string[]
  released_at: string
  set_type: string
  lang: string
}

const FANCY_FRAME_EFFECTS = new Set([
  'showcase', 'extendedart', 'etched', 'fullart', 'inverted', 'nyxtouched', 'compasslanddfc'
])

const NON_STANDARD_SET_TYPES = new Set([
  'funny', 'memorabilia', 'promo', 'token', 'vanguard', 'starter', 'box', 'minigame'
])

// Preferred set types for picking the "cleanest" printing
const PREFERRED_SET_TYPES = ['core', 'expansion', 'masters', 'draft_innovation', 'commander', 'duel_deck']

function setTypePriority(setType: string): number {
  const idx = PREFERRED_SET_TYPES.indexOf(setType)
  return idx === -1 ? PREFERRED_SET_TYPES.length : idx
}

function pickDefaultPrinting(cards: ScryfallCard[]): ScryfallCard {
  const normal = cards.filter(c =>
    !c.promo &&
    !c.variation &&
    !c.full_art &&
    c.border_color === 'black' &&
    !NON_STANDARD_SET_TYPES.has(c.set_type) &&
    !(c.frame_effects ?? []).some(e => FANCY_FRAME_EFFECTS.has(e))
  )

  const pool = normal.length > 0 ? normal : cards

  // Sort: prefer core/expansion set types first, then newest release within same tier
  return pool.sort((a, b) => {
    const typeDiff = setTypePriority(a.set_type) - setTypePriority(b.set_type)
    if (typeDiff !== 0) return typeDiff
    return b.released_at.localeCompare(a.released_at) // newest first
  })[0]
}

function extractType(typeLine: string) {
  const mainTypes = ['Creature', 'Instant', 'Sorcery', 'Artifact', 'Enchantment', 'Planeswalker', 'Land', 'Battle']
  const card_type = mainTypes.find(t => typeLine.includes(t)) ?? 'Other'
  const supertypes: string[] = []
  if (typeLine.includes('Legendary')) supertypes.push('Legendary')
  if (typeLine.includes('Basic')) supertypes.push('Basic')
  if (typeLine.includes('Snow')) supertypes.push('Snow')
  if (typeLine.includes('World')) supertypes.push('World')
  return { card_type, supertypes }
}

async function fetchWithRetry(url: string, headers: Record<string, string>, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers })
      if (res.ok) return res
      const text = await res.text()
      console.error(`Attempt ${i + 1}: HTTP ${res.status}: ${text.slice(0, 200)}`)
    } catch (err) {
      console.error(`Attempt ${i + 1} failed:`, err)
    }
    if (i < retries - 1) {
      const delay = (i + 1) * 2000
      console.log(`Retrying in ${delay}ms...`)
      await new Promise(r => setTimeout(r, delay))
    }
  }
  throw new Error(`Failed after ${retries} attempts`)
}

async function main() {
  const headers = { 'User-Agent': 'MTGdle/1.0' }

  console.log('Fetching Scryfall bulk data index...')
  const indexRes = await fetchWithRetry(BULK_URL, headers)
  const index = await indexRes.json() as { data: Array<{ type: string; download_uri: string }> }
  const bulkEntry = index.data.find(d => d.type === 'default_cards')
  if (!bulkEntry) throw new Error('Could not find default_cards bulk entry')

  console.log('Downloading bulk cards JSON...')
  console.log(`URL: ${bulkEntry.download_uri}`)
  const bulkRes = await fetchWithRetry(bulkEntry.download_uri, headers)
  console.log(`Response status: ${bulkRes.status}, content-type: ${bulkRes.headers.get('content-type')}`)
  if (!bulkRes.body) {
    throw new Error('Scryfall response has no body')
  }
  const allCards: ScryfallCard[] = await new Promise((resolve, reject) => {
    const cards: ScryfallCard[] = []
    const pipeline = StreamArray.withParser()
    pipeline.on('data', ({ value }: { value: ScryfallCard }) => cards.push(value))
    pipeline.on('end', () => resolve(cards))
    pipeline.on('error', (err) => {
      console.error('Stream parse error:', err.message)
      reject(err)
    })
    Readable.fromWeb(bulkRes.body as import('stream/web').ReadableStream).pipe(pipeline)
  })

  console.log(`Total cards: ${allCards.length}`)

  // Filter: English, not token/art card, has image, has required fields
  const eligible = allCards.filter(c =>
    c.lang === 'en' &&
    c.layout !== 'token' &&
    c.layout !== 'art_series' &&
    c.layout !== 'double_faced_token' &&
    c.image_uris != null &&
    c.type_line &&
    !c.type_line.includes('Token')
  )

  // Group by name
  const byName = new Map<string, ScryfallCard[]>()
  for (const c of eligible) {
    const group = byName.get(c.name) ?? []
    group.push(c)
    byName.set(c.name, group)
  }

  // Pick best printing per name, then sort by EDHREC rank and take top 1000
  const picked = Array.from(byName.values()).map(group => {
    const chosen = pickDefaultPrinting(group)
    // Find original printing: earliest released_at across all printings of this name
    const original = group.sort((a, b) => a.released_at.localeCompare(b.released_at))[0]
    return { chosen, original }
  })

  const filtered = picked
    .filter(({ chosen }) => chosen.edhrec_rank != null)
    .sort((a, b) => a.chosen.edhrec_rank! - b.chosen.edhrec_rank!)
    .slice(0, TARGET_COUNT)

  // Load curated overrides (list of card names)
  const curatedPath = path.join(process.cwd(), 'data', 'curated.json')
  const curatedNames: string[] = fs.existsSync(curatedPath)
    ? JSON.parse(fs.readFileSync(curatedPath, 'utf-8'))
    : []

  const pool = [...filtered]
  for (const name of curatedNames) {
    const group = byName.get(name)
    if (!group) { console.warn(`curated: card not found: ${name}`); continue }
    const chosen = pickDefaultPrinting(group)
    const original = [...group].sort((a, b) => a.released_at.localeCompare(b.released_at))[0]
    if (!pool.find(p => p.chosen.id === chosen.id)) {
      pool.push({ chosen, original })
    }
  }

  const output = pool.map(({ chosen: c, original }) => {
    const { card_type, supertypes } = extractType(c.type_line)
    const imageUris = c.image_uris ?? c.card_faces?.[0]?.image_uris ?? null
    const flavorText = c.flavor_text ?? c.card_faces?.[0]?.flavor_text ?? null
    const manaCost = c.mana_cost ?? c.card_faces?.[0]?.mana_cost ?? null
    return {
      id: c.id,
      name: c.name,
      color_identity: c.color_identity,
      type_line: c.type_line,
      card_type,
      supertypes,
      mana_cost: manaCost,
      cmc: c.cmc,
      power: c.power ?? null,
      toughness: c.toughness ?? null,
      rarity: c.rarity,
      set: c.set,
      set_name: c.set_name,
      original_set: original.set,
      original_set_name: original.set_name,
      original_year: parseInt(original.released_at.slice(0, 4), 10),
      original_month: parseInt(original.released_at.slice(5, 7), 10),
      flavor_text: flavorText,
      image_uris: imageUris,
      edhrec_rank: c.edhrec_rank ?? null,
    }
  })

  const outPath = path.join(process.cwd(), 'data', 'cards.json')
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2))
  console.log(`Wrote ${output.length} cards to data/cards.json`)
}

main().catch(console.error)
