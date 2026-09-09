import { NextRequest, NextResponse } from 'next/server';
import { startRound, ensurePlayer } from '@/lib/game';
import { isValidCategoryId } from '@/data/categories';

export async function POST(req: NextRequest) {
  let body: { playerId?: string; nickname?: string; category?: string; mode?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
  }

  const { playerId, nickname, category, mode } = body;
  if (!playerId || typeof playerId !== 'string') {
    return NextResponse.json({ error: 'MISSING_PLAYER_ID' }, { status: 400 });
  }
  if (!category || !isValidCategoryId(category)) {
    return NextResponse.json({ error: 'INVALID_CATEGORY' }, { status: 400 });
  }
  if (mode !== 'daily' && mode !== 'unlimited') {
    return NextResponse.json({ error: 'INVALID_MODE' }, { status: 400 });
  }

  try {
    ensurePlayer(playerId, (nickname ?? 'Anonymous').slice(0, 40));
    const result = startRound(playerId, category, mode);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'UNKNOWN_ERROR';
    if (message === 'ALREADY_PLAYED_TODAY') {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    console.error('round/start failed', err);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
