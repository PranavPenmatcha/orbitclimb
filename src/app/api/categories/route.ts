import { NextRequest, NextResponse } from 'next/server';
import { CATEGORIES } from '@/data/categories';
import { currentStreak, hasPlayedToday } from '@/lib/streaks';
import type { CategoryId } from '@/lib/types';

export async function GET(req: NextRequest) {
  const playerId = req.nextUrl.searchParams.get('playerId');

  const categories = CATEGORIES.map((c) => ({
    ...c,
    streak: playerId ? currentStreak(playerId, c.id as CategoryId) : 0,
    playedToday: playerId ? hasPlayedToday(playerId, c.id as CategoryId) : false,
  }));

  return NextResponse.json({ categories });
}
