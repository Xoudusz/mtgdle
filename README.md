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

To add cards that rank outside the top 1000, add their names to `data/curated.json`.

Re-run `npm run fetch-cards` after major set releases to pick up new cards and updated data.

## Testing

Copy `.env.local.example` to `.env.local` to override the daily card and disable localStorage caching during development:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|---|---|
| `TEST_CARD` | Force a specific card by name (overrides daily logic) |
| `CARD_SEED` | Offset daily card index without changing date (e.g. `50` shifts pool by 50) |
| `NEXT_PUBLIC_NO_CACHE` | Disable localStorage persistence |

## Project Structure

```
app/                  # Next.js App Router pages
  classic/            # Carddle game
  art/                # Artdle game
  flavor/             # Flavordle game
components/           # Shared UI components
lib/                  # Game logic (types, daily seed, compare, storage)
data/
  cards.json          # Generated card pool (git-ignored after initial fetch)
  curated.json        # Manual iconic card overrides
scripts/
  fetch-cards.ts      # Scryfall → cards.json
```

## Deployment

Docker image auto-published to GHCR on push to `master`.

```bash
docker pull ghcr.io/xoudusz/mtgdle:latest
```

Container listens on **port 3000**. Configure nginx proxy to target `mtgdle:3000`.

See `docker-compose.yml` for production setup with nginx_proxy_default network.

### PocketBase

PocketBase runs alongside the app. The Next.js server auto-creates the `guesses` collection on startup via `instrumentation.ts`.

Set credentials in your environment (or a `.env` file next to `docker-compose.yml`):

```env
PB_ADMIN_EMAIL=admin@yourdomain.com
PB_ADMIN_PASSWORD=your-secure-password
```

The admin UI is available at `http://<host>:8090/_/` — but only if you expose the port. By default PocketBase is only reachable inside the Docker network. To access it from your LAN (e.g. for debugging), add a port mapping to the pocketbase service in `docker-compose.yml`:

```yaml
ports:
  - "8090:8090"
```

Then reach it at `http://<host-ip>:8090/_/` (e.g. `http://192.168.68.103:8090/_/`).

## Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **Scryfall** bulk JSON for card data
- **PocketBase** for anonymous stats (Phase 5)
- **Docker** + nginx for deployment
