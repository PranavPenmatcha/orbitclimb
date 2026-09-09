-- ORBIT database schema. Applied once at startup by db.ts (idempotent via IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  nickname TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS rounds (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL REFERENCES players(id),
  category_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('daily', 'unlimited')),
  puzzle_date TEXT, -- ET YYYY-MM-DD, only set for daily rounds
  seed INTEGER NOT NULL,
  prompt_ids TEXT NOT NULL, -- JSON array, the 7 prompt ids in order
  started_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  completed_at TEXT,
  total_score INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_rounds_player ON rounds(player_id);
CREATE INDEX IF NOT EXISTS idx_rounds_daily_lookup ON rounds(player_id, category_id, puzzle_date);

CREATE TABLE IF NOT EXISTS round_answers (
  round_id TEXT NOT NULL REFERENCES rounds(id),
  prompt_index INTEGER NOT NULL, -- 0..6
  prompt_id TEXT NOT NULL,
  raw_input TEXT NOT NULL,
  answer_id TEXT, -- null if invalid
  valid INTEGER NOT NULL, -- 0/1
  corrected INTEGER NOT NULL DEFAULT 0, -- 0/1, fuzzy-matched
  tier TEXT NOT NULL,
  points INTEGER NOT NULL,
  share REAL, -- the blended share used to score this answer
  ms_taken INTEGER NOT NULL,
  answered_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (round_id, prompt_index)
);

-- The live rarity table: how many times each valid answer has been given
-- for each prompt, across all players/modes. This is what blends with the
-- seeded prior in rarity.ts as real play accumulates.
CREATE TABLE IF NOT EXISTS answer_counts (
  prompt_id TEXT NOT NULL,
  answer_id TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (prompt_id, answer_id)
);

CREATE TABLE IF NOT EXISTS prompt_totals (
  prompt_id TEXT PRIMARY KEY,
  total INTEGER NOT NULL DEFAULT 0
);

-- One row per player/category/day. Unique constraint blocks replaying a
-- completed daily puzzle. Powers streaks and the leaderboard.
CREATE TABLE IF NOT EXISTS daily_results (
  player_id TEXT NOT NULL REFERENCES players(id),
  category_id TEXT NOT NULL,
  puzzle_date TEXT NOT NULL,
  round_id TEXT NOT NULL REFERENCES rounds(id),
  total_score INTEGER NOT NULL,
  nickname TEXT NOT NULL,
  PRIMARY KEY (player_id, category_id, puzzle_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_results_leaderboard ON daily_results(category_id, puzzle_date, total_score DESC);
