export interface Card {
  id: string
  name: string
  color_identity: string[] // ['W','U','B','R','G'] subset
  type_line: string        // e.g. "Legendary Creature — Dragon"
  card_type: string        // primary type: Creature, Instant, Sorcery, etc.
  supertypes: string[]     // Legendary, Basic, Snow, etc.
  cmc: number
  power: string | null     // null for non-creatures
  toughness: string | null
  rarity: 'common' | 'uncommon' | 'rare' | 'mythic'
  set: string              // set code, e.g. "m21"
  set_name: string
  flavor_text: string | null
  image_uris: {
    art_crop: string
    normal: string
    large: string
  } | null
  edhrec_rank: number | null
}
