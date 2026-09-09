import { NextRequest, NextResponse } from 'next/server';
import { submitAnswer } from '@/lib/game';

export async function POST(req: NextRequest) {
  let body: { roundId?: string; promptIndex?: number; input?: string; elapsedMs?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
  }

  const { roundId, promptIndex, input, elapsedMs } = body;
  if (!roundId || typeof roundId !== 'string') {
    return NextResponse.json({ error: 'MISSING_ROUND_ID' }, { status: 400 });
  }
  if (typeof promptIndex !== 'number' || !Number.isInteger(promptIndex)) {
    return NextResponse.json({ error: 'INVALID_PROMPT_INDEX' }, { status: 400 });
  }
  if (typeof input !== 'string') {
    return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 });
  }
  const elapsed = typeof elapsedMs === 'number' && elapsedMs >= 0 ? elapsedMs : 0;

  try {
    const result = submitAnswer(roundId, promptIndex, input.slice(0, 200), elapsed);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'UNKNOWN_ERROR';
    const knownErrors = ['ROUND_NOT_FOUND', 'ROUND_ALREADY_COMPLETE', 'BAD_PROMPT_INDEX', 'PROMPT_ALREADY_ANSWERED', 'PROMPT_NOT_FOUND'];
    if (knownErrors.includes(message)) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error('round/answer failed', err);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
