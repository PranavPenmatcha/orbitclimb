# ORBIT

A daily rarity game: pick a category, name something in it, and score based on how *few* other players named the same thing. Inspired by [krillion.io](https://krillion.io/), rebuilt from scratch with your own category system, scoring model, and a deep-space visual identity instead of Krillion's ocean-dive theme.

## How it works

- Pick one of 7 categories: **Stocks, Animals, Countries, Movies, Athletes, Video Games, Music Artists**
- Every day each category gets 7 prompts, the same for every player, resetting at midnight ET
- You have 20 seconds per prompt to name something that fits
- Scoring is inverted trivia: the *rarer* your answer among all players, the more points — 6 tiers from **Launchpad** (10 pts, obvious) to **Deep Space** (100 pts, almost nobody else said it)
- Points map 1:1 to kilometres of altitude. 700 points is a perfect round — real low Earth orbit
- **Daily** mode counts toward your streak and the leaderboard, one attempt per day. **Unlimited** mode is untimed-limit-wise replayable practice that still feeds the rarity data

Rarity starts from ~1,227 hand-authored answers with estimated "how obvious is this" weights (so the game scores sensibly with zero players), then blends in real submissions as people play — the more a prompt gets played, the more its scoring reflects actual player behavior rather than the initial estimate.

## Stack

- Next.js 15 (App Router) + TypeScript
- SQLite via `better-sqlite3` — zero external services, `orbit.db` is created on first run
- No auth — an anonymous id + nickname live in `localStorage`

## Running it

```bash
npm install
npm run dev
```

Open http://localhost:3311.

## Scripts

- `npm run dev` — dev server
- `npm run build` / `npm start` — production build
- `npm test` — engine unit + integration tests (Vitest)
- `npm run validate-data` — checks the answer/prompt datasets for duplicate ids, ambiguous aliases, and prompts with too few valid answers

## Project layout

```
src/
  app/            pages + API routes (all scoring happens server-side)
  lib/            pure engine: matching, rarity blending, tiers, daily seeding, db
  data/           the 7 category answer pools + their prompts
  components/     Starfield, AltitudeGauge, TimerRing, PromptCard, TierReveal, ShareCard
scripts/
  validate-data.ts
tests/
```

See [src/lib/game.ts](src/lib/game.ts) for the full round lifecycle (start → answer → finish) and [src/lib/rarity.ts](src/lib/rarity.ts) for the seed/live blending formula.
