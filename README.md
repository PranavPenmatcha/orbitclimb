# ORBIT

A daily rarity game: pick a category, name something in it, and score based on how *few* other players named the same thing. Inspired by [krillion.io](https://krillion.io/), rebuilt from scratch with your own category system, scoring model, and a deep-space visual identity instead of Krillion's ocean-dive theme.

**Live:** https://orbitclimb.vercel.app

## How it works

- Pick one of 7 categories: **Stocks, Animals, Countries, Movies, Athletes, Video Games, Music Artists**
- Every day each category gets 7 prompts, the same for every player, resetting at midnight ET
- You have 20 seconds per prompt to name something that fits
- Scoring is inverted trivia: the *rarer* your answer among all players, the more points — 6 tiers from **Launchpad** (10 pts, obvious) to **Deep Space** (100 pts, almost nobody else said it)
- Points map 1:1 to kilometres of altitude. 700 points is a perfect round — real low Earth orbit, and a rocket climbs a rail on-screen as you score
- **Daily** mode counts toward your streak and the leaderboard, one attempt per day. **Unlimited** mode is untimed-limit-wise replayable practice that still feeds the rarity data
- Results show a rarity chart across your 7 answers, plus rarer picks you could have named for each prompt

Rarity starts from ~1,227 hand-authored answers with estimated "how obvious is this" weights (so the game scores sensibly with zero players), then blends in real submissions as people play — the more a prompt gets played, the more its scoring reflects actual player behavior rather than the initial estimate.

## Stack

- Next.js 15 (App Router) + TypeScript
- SQLite dialect via `@libsql/client` — local dev talks to a plain file (`orbit.db`, zero network calls), production talks to a hosted [Turso](https://turso.tech) database. Same schema, same query code, one client.
- No auth — an anonymous id + nickname live in `localStorage`

## Running it locally

```bash
npm install
npm run dev
```

Open http://localhost:3311. No environment variables needed for local dev — it creates `orbit.db` on first run.

## Deploying

The live deployment is Vercel + Turso. To stand up your own:

```bash
turso auth login
turso db create <name>
turso db show <name> --url        # -> TURSO_DATABASE_URL
turso db tokens create <name>     # -> TURSO_AUTH_TOKEN

vercel link
vercel env add TURSO_DATABASE_URL production
vercel env add TURSO_AUTH_TOKEN production
vercel --prod
```

`src/lib/db.ts` picks local-file vs. Turso automatically based on whether `TURSO_DATABASE_URL` is set — no code changes needed between environments.

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
  components/     Starfield, Rocket, AltitudeGauge, AscentAnimation, TimerRing,
                   PromptCard, TierReveal, RarityChart, ShareCard
scripts/
  validate-data.ts
tests/
```

See [src/lib/game.ts](src/lib/game.ts) for the full round lifecycle (start → answer → finish) and [src/lib/rarity.ts](src/lib/rarity.ts) for the seed/live blending formula.
