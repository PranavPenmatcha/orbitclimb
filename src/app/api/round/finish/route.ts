import { NextRequest, NextResponse } from 'next/server';
import { finishRound } from '@/lib/game';

export async function POST(req: NextRequest) {
  let body: { roundId?: string; nickname?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
  }

  const { roundId, nickname } = body;
  if (!roundId || typeof roundId !== 'string') {
    return NextResponse.json({ error: 'MISSING_ROUND_ID' }, { status: 400 });
  }

  try {
    const result = finishRound(roundId, (nickname ?? 'Anonymous').slice(0, 40));
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'UNKNOWN_ERROR';
    const knownErrors = ['ROUND_NOT_FOUND', 'ROUND_ALREADY_COMPLETE', 'ROUND_INCOMPLETE'];
    if (knownErrors.includes(message)) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error('round/finish failed', err);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
