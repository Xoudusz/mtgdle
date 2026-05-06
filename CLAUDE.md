# mtgdle

Daily MTG guessing game — three modes (Carddle, Artdle, Flavordle), each with its own daily card seeded by date.

## Stack

- Next.js 14 App Router + TypeScript + Tailwind CSS
- Scryfall bulk JSON for card data
- PocketBase for anonymous guess stats (auto-creates collections via `instrumentation.ts`)
- Docker + nginx (port 3000)

## Project structure

```
app/          # Pages — classic/, art/, flavor/
components/   # Shared UI
lib/          # Game logic: types, daily seed, compare, storage
data/
  cards.json        # Generated (git-ignored) — run fetch-cards
  curated.json      # Manual overrides for iconic cards outside top 1000
scripts/
  fetch-cards.ts    # Scryfall → cards.json
```

## Card pool

Top 1000 by EDHREC rank from Scryfall bulk data. Cards outside top 1000 go in `data/curated.json`. Re-run after major set releases:
```bash
npm run fetch-cards
```

## Dev

```bash
npm install
npm run fetch-cards   # required — cards.json is git-ignored
npm run dev           # http://localhost:3000
```

Override daily card in `.env.local`:
- `TEST_CARD` — force specific card by name
- `CARD_SEED` — shift daily index
- `NEXT_PUBLIC_NO_CACHE` — disable localStorage

## PocketBase

Runs alongside Next.js. Admin UI at `:8090/_/` (expose port to access from LAN). Credentials in `PB_ADMIN_EMAIL` + `PB_ADMIN_PASSWORD` env vars. Collections are auto-created on startup via `instrumentation.ts` — don't create manually.

## Deploy

CI builds + pushes `ghcr.io/xoudusz/mtgdle:latest` on push to master.
