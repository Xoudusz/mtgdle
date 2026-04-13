# MTGdle

Daily Magic: The Gathering guessing game with three modes.

| Mode | Route | Description |
|---|---|---|
| Carddle | `/classic` | Guess the card by its attributes (color, type, CMC, rarity, set, P/T) |
| Artdle | `/art` | Identify the card from a zoomed artwork that reveals more each guess |
| Flavordle | `/flavor` | Guess the card from its flavor text |

Each mode has its own independent daily card, seeded by date.

## Prerequisites

- Node.js 20+

## Setup

```bash
npm install
npm run fetch-cards   # downloads Scryfall bulk data → data/cards.json (~1000 cards)
npm run dev           # starts dev server at http://localhost:3000
```

## Card Pool

Cards are sourced from the [Scryfall](https://scryfall.com/docs/api/bulk-data) `default_cards` bulk export, filtered to the top 1000 unique cards by EDHREC rank (most popular Commander staples and iconic cards).

To add cards that rank outside the top 1000, add their Scryfall card objects to `data/curated.json`.

## Project Structure

```
app/                  # Next.js App Router pages
  classic/            # Carddle game
  art/                # Artdle game (coming soon)
  flavor/             # Flavordle game (coming soon)
components/           # Shared UI components
lib/                  # Game logic (types, daily seed, compare, storage)
data/
  cards.json          # Generated card pool (git-ignored after initial fetch)
  curated.json        # Manual iconic card overrides
scripts/
  fetch-cards.ts      # Scryfall → cards.json
```

## Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **Scryfall** bulk JSON for card data
- **PocketBase** for anonymous stats (Phase 5)
- **Docker** + nginx for deployment (Phase 7)
