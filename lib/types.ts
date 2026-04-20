export interface Card {
  id: string
  name: string
  color_identity: string[] // ['W','U','B','R','G'] subset
  type_line: string        // e.g. "Legendary Creature — Dragon"
  card_type: string        // primary type: Creature, Instant, Sorcery, etc.
  supertypes: string[]     // Legendary, Basic, Snow, etc.
  mana_cost: string | null // e.g. "{1}{G}", "{0}", null for lands
  cmc: number
  power: string | null     // null for non-creatures
  toughness: string | null
  rarity: 'common' | 'uncommon' | 'rare' | 'mythic'
  set: string              // set code of chosen printing
  set_name: string
  original_set: string     // set code of first printing
  original_set_name: string
  original_year: number    // year of first printing (e.g., 2018)
  original_month: number   // month of first printing (1-12)
  flavor_text: string | null
  image_uris: {
    art_crop: string
    normal: string
    large: string
  } | null
  edhrec_rank: number | null
}
