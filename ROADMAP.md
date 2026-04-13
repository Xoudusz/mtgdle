# MTGdle — Project Roadmap

## Stack Overview

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | Node.js app, not static export |
| Language | TypeScript | Safe card data model |
| Styling | Tailwind CSS | Fast to build the guess grid |
| Card data | Scryfall bulk JSON | Filtered to popular/iconic cards, bundled statically |
| Daily logic | Date-based deterministic seed | Same card for everyone, no DB needed |
| Stats | PocketBase | Tracks full guess history per day |
| Hosting | VPS + Docker + nginx | Same pattern as other projects |

---

## Modes

| Mode | Route | Description |
|---|---|---|
| Carddle | `/classic` | Guess by card attributes (color, type, CMC, rarity, set, P/T) |
| Artdle | `/art` | Zoomed into artwork, zooms out one step per guess (5 levels) |
| Flavordle | `/flavor` | Full flavor text shown, guess which card it belongs to |

Each mode has its own independent daily card, seeded by `date + mode offset`.

---

## Daily Seed Logic

```ts
function getDailyCard(mode: 'classic' | 'art' | 'flavor', cards: Card[]): Card {
  const epoch = new Date('2025-01-01')
  const today = new Date()
  const dayIndex = Math.floor((today.getTime() - epoch.getTime()) / 86400000)
  const modeOffset = { classic: 0, art: 1000, flavor: 2000 }
  return cards[(dayIndex + modeOffset[mode]) % cards.length]
}
```

---

## Guess Columns (Carddle)

| Column | Comparison | Feedback |
|---|---|---|
| Card name | exact | green / red |
| Color identity | set comparison | green = exact, yellow = partial overlap |
| Card type | exact | green / red |
| Supertype | exact (Legendary etc.) | green / red |
| CMC | numeric | green = exact, yellow + arrow = higher/lower |
| Power/Toughness | numeric | green = exact, yellow + arrow = higher/lower |
| Rarity | exact | green / red |
| Set | exact | green / red |

---

## Card Pool

- Source: Scryfall `default_cards` bulk JSON
- Filter by `edhrec_rank` (top ~1000)
- Supplement with `curated.json` for iconic cards that rank lower (Black Lotus, Counterspell, etc.)
- Cards must have: artwork, flavor text (for Flavordle pool), and all required attributes
- Tokens and incomplete card faces are excluded
- Stored as `data/cards.json`, regenerated via `scripts/fetch-cards.ts`

---

## PocketBase Schema

**Collection: `guesses`**

| Field | Type | Notes |
|---|---|---|
| `mode` | string | `classic`, `art`, `flavor` |
| `date` | string | `YYYY-MM-DD` |
| `card_id` | string | Scryfall card id |
| `guess_count` | number | how many guesses it took |
| `solved` | bool | did they get it |

- Written once per completed game, from the client
- No auth required to write, raw records not publicly readable

---

## localStorage Schema

```ts
type DailyResult = {
  date: string
  mode: string
  solved: boolean
  guesses: string[] // card names guessed
}
```

---

## Project Structure

```
mtgdle/
├── app/
│   ├── page.tsx               # mode selector home
│   ├── classic/page.tsx
│   ├── art/page.tsx
│   ├── flavor/page.tsx
│   └── api/stats/route.ts     # POST to PocketBase
├── components/
│   ├── GuessGrid.tsx
│   ├── ArtZoom.tsx
│   ├── FlavorReveal.tsx
│   ├── CardSearch.tsx
│   └── ResultModal.tsx
├── lib/
│   ├── daily.ts               # seed logic
│   ├── compare.ts             # attribute comparison
│   └── storage.ts             # localStorage helpers
├── data/
│   ├── cards.json             # curated card pool
│   └── curated.json           # manual iconic overrides
├── scripts/
│   └── fetch-cards.ts         # Scryfall → cards.json
└── docker/
    └── Dockerfile
```

---

## Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

```yaml
services:
  mtgdle:
    image: ghcr.io/you/mtgdle:latest
    container_name: mtgdle
    restart: unless-stopped
    network_mode: nginx_proxy_default
  pocketbase:
    image: ghcr.io/muchobien/pocketbase:latest
    container_name: mtgdle-pb
    restart: unless-stopped
    volumes:
      - ./pb_data:/pb/pb_data
    network_mode: nginx_proxy_default
```

---

## Roadmap

### Phase 1 — Foundation
- [x] Scaffold Next.js 14 + TypeScript + Tailwind
- [x] Write `fetch-cards.ts` — pulls Scryfall bulk JSON, filters by `edhrec_rank`, deduplicates by name, outputs `cards.json`
- [x] Create `curated.json` for manual iconic card overrides
- [x] Define `Card` TypeScript type based on Scryfall fields
- [x] Implement `daily.ts` — deterministic seed logic for all 3 modes
- [x] Basic routing: `/`, `/classic`, `/art`, `/flavor`

### Phase 2 — Classic Mode (Carddle)
- [x] `CardSearch.tsx` — autocomplete input filtered to card pool, keyboard nav, "not in pool" feedback
- [x] `compare.ts` — comparison logic for 7 columns (Type+Supertype merged: green=both match, yellow=one matches, red=neither)
- [x] `GuessGrid.tsx` — colored cell grid (green / yellow / red + arrows); P/T column hidden until player guesses a Creature and only if daily card is a Creature
- [x] Win state + `ResultModal.tsx` — show full card on solve
- [x] Persist result to `localStorage` via `storage.ts`

### Phase 3 — Art Mode (Artdle)
- [ ] `ArtZoom.tsx` — CSS zoom using Scryfall `image_uris.art_crop`, seeded crop anchor per day
- [ ] 5 zoom levels, steps out one per guess
- [ ] Same `CardSearch.tsx` input, no attribute columns
- [ ] Win state + full art reveal

### Phase 4 — Flavor Mode (Flavordle)
- [ ] Filter `cards.json` at build time — exclude cards without flavor text
- [ ] `FlavorReveal.tsx` — display full flavor text, styled nicely
- [ ] Same `CardSearch.tsx` input
- [ ] Win state + full card reveal

### Phase 5 — Stats (PocketBase)
- [ ] Spin up PocketBase, define `guesses` collection schema
- [ ] `api/stats/route.ts` — Next.js API route that proxies POST to PocketBase
- [ ] Fire stat submission on game completion (non-blocking, fails silently)
- [ ] Basic today's result screen — show solve count for today's card across all players

### Phase 6 — Polish
- [x] Home page `/` — mode selector with clear descriptions
- [ ] Shareable result (emoji grid, like Wordle) — copy to clipboard
- [ ] Mobile responsive layout
- [ ] MTG-themed visual design (card frame aesthetic)
- [ ] Loading states + error boundaries
- [ ] SEO + Open Graph metadata

### Phase 7 — Docker + Deployment
- [ ] Write `Dockerfile` (multi-stage Node build)
- [ ] Write `docker-compose.yml` (mtgdle + pocketbase)
- [ ] nginx config for both services
- [ ] GitHub Actions workflow — build image, push to `ghcr.io`, auto-deploy on push to `main`
- [ ] Lock down PocketBase API (write-only from app, no public read on raw records)

### Phase 8 — Future (post-launch)
- [ ] Expand card pool with Commanders
- [ ] Player streaks + win rate stats
- [ ] Past results calendar
- [ ] Infinite / practice mode (random card, not daily)
- [ ] Difficulty variations (e.g. fewer columns visible)
