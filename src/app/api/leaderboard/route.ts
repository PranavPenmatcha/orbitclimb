import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { isValidCategoryId } from '@/data/categories';
import { currentPuzzleDateET } from '@/lib/daily';

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get('category');
  const date = req.nextUrl.searchParams.get('date') ?? currentPuzzleDateET();

  if (!category || !isValidCategoryId(category)) {
    return NextResponse.json({ error: 'INVALID_CATEGORY' }, { status: 400 });
  }

  const db = getDb();
  const rows = db
    .prepare(
      `SELECT nickname, total_score, player_id
       FROM daily_results
       WHERE category_id = ? AND puzzle_date = ?
       ORDER BY total_score DESC
       LIMIT 50`
    )
    .all(category, date) as Array<{ nickname: string; total_score: number; player_id: string }>;

  return NextResponse.json({
    category,
    date,
    entries: rows.map((r, i) => ({ rank: i + 1, nickname: r.nickname, score: r.total_score, playerId: r.player_id })),
  });
}
