import * as fs from 'fs'
import * as path from 'path'

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
  image_uris?: { art_crop: string; normal: string; large: string }
  edhrec_rank?: number
  layout: string
  card_faces?: Array<{ image_uris?: { art_crop: string; normal: string; large: string }; flavor_text?: string }>
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

async function main() {
  console.log('Fetching Scryfall bulk data index...')
  const indexRes = await fetch(BULK_URL)
  const index = await indexRes.json() as { data: Array<{ type: string; download_uri: string }> }
  const bulkEntry = index.data.find(d => d.type === 'default_cards')
  if (!bulkEntry) throw new Error('Could not find default_cards bulk entry')

  console.log('Downloading bulk cards JSON...')
  const bulkRes = await fetch(bulkEntry.download_uri)
  const allCards: ScryfallCard[] = await bulkRes.json()

  console.log(`Total cards: ${allCards.length}`)

  // Filter: English, not token/art card, has image, has edhrec_rank, has required fields
  const sorted = allCards
    .filter(c =>
      c.layout !== 'token' &&
      c.layout !== 'art_series' &&
      c.layout !== 'double_faced_token' &&
      c.image_uris != null &&
      c.edhrec_rank != null &&
      c.type_line &&
      !c.type_line.includes('Token')
    )
    .sort((a, b) => (a.edhrec_rank ?? 99999) - (b.edhrec_rank ?? 99999))

  // Deduplicate by name — keep best-ranked printing
  const seen = new Set<string>()
  const filtered = sorted
    .filter(c => {
      if (seen.has(c.name)) return false
      seen.add(c.name)
      return true
    })
    .slice(0, TARGET_COUNT)

  // Load curated overrides
  const curatedPath = path.join(process.cwd(), 'data', 'curated.json')
  const curated: ScryfallCard[] = fs.existsSync(curatedPath)
    ? JSON.parse(fs.readFileSync(curatedPath, 'utf-8'))
    : []

  const pool = [...filtered]
  for (const c of curated) {
    if (!pool.find(p => p.id === c.id)) pool.push(c)
  }

  const output = pool.map(c => {
    const { card_type, supertypes } = extractType(c.type_line)
    const imageUris = c.image_uris ?? c.card_faces?.[0]?.image_uris ?? null
    const flavorText = c.flavor_text ?? c.card_faces?.[0]?.flavor_text ?? null
    return {
      id: c.id,
      name: c.name,
      color_identity: c.color_identity,
      type_line: c.type_line,
      card_type,
      supertypes,
      cmc: c.cmc,
      power: c.power ?? null,
      toughness: c.toughness ?? null,
      rarity: c.rarity,
      set: c.set,
      set_name: c.set_name,
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
