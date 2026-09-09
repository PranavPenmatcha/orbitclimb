import { getDb } from './db';
import { currentPuzzleDateET } from './daily';
import type { CategoryId } from './types';

function addDaysET(dateStr: string, delta: number): string {
  // dateStr is YYYY-MM-DD; treat as a plain calendar date (ET's own midnight
  // boundary already produced it) so we don't need timezone math here.
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return dt.toISOString().slice(0, 10);
}

/** Current consecutive-day streak for a player in a category, counting back from today (or yesterday, if today isn't played yet). */
export async function currentStreak(playerId: string, categoryId: CategoryId): Promise<number> {
  const db = await getDb();
  const result = await db.execute({
    sql: `SELECT puzzle_date FROM daily_results WHERE player_id = ? AND category_id = ? ORDER BY puzzle_date DESC`,
    args: [playerId, categoryId],
  });
  const rows = result.rows as unknown as Array<{ puzzle_date: string }>;
  if (rows.length === 0) return 0;

  const today = currentPuzzleDateET();
  const playedDates = new Set(rows.map((r) => r.puzzle_date));

  let cursor = playedDates.has(today) ? today : addDaysET(today, -1);
  if (!playedDates.has(cursor)) return 0;

  let streak = 0;
  while (playedDates.has(cursor)) {
    streak++;
    cursor = addDaysET(cursor, -1);
  }
  return streak;
}

export async function hasPlayedToday(playerId: string, categoryId: CategoryId): Promise<boolean> {
  const db = await getDb();
  const today = currentPuzzleDateET();
  const result = await db.execute({
    sql: `SELECT 1 FROM daily_results WHERE player_id = ? AND category_id = ? AND puzzle_date = ?`,
    args: [playerId, categoryId, today],
  });
  return result.rows.length > 0;
}
