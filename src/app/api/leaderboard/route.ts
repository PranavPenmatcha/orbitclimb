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

  const db = await getDb();
  const result = await db.execute({
    sql: `SELECT nickname, total_score, player_id
          FROM daily_results
          WHERE category_id = ? AND puzzle_date = ?
          ORDER BY total_score DESC
          LIMIT 50`,
    args: [category, date],
  });
  const rows = result.rows as unknown as Array<{ nickname: string; total_score: number; player_id: string }>;

  return NextResponse.json({
    category,
    date,
    entries: rows.map((r, i) => ({ rank: i + 1, nickname: r.nickname, score: r.total_score, playerId: r.player_id })),
  });
}
