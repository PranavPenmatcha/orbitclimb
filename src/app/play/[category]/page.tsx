'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { getPlayerId, getNickname } from '@/lib/client';
import AltitudeGauge from '@/components/AltitudeGauge';
import TimerRing from '@/components/TimerRing';
import PromptCard from '@/components/PromptCard';
import TierReveal from '@/components/TierReveal';

interface StartRoundResponse {
  roundId: string;
  promptIds: string[];
  promptTexts: string[];
  mode: 'daily' | 'unlimited';
  puzzleDate: string | null;
  timePerPromptMs: number;
}

interface AnswerResponse {
  promptIndex: number;
  valid: boolean;
  corrected: boolean;
  resolvedName: string | null;
  feedback: string | null;
  tierName: string;
  tierLabel: string;
  points: number;
  sharePercent: number | null;
  cumulativeScore: number;
}

type Phase = 'loading' | 'error' | 'playing' | 'revealing' | 'finishing';

export default function PlayPage() {
  const params = useParams<{ category: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get('mode') === 'unlimited' ? 'unlimited' : 'daily';

  const [phase, setPhase] = useState<Phase>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [round, setRound] = useState<StartRoundResponse | null>(null);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [remainingMs, setRemainingMs] = useState(0);
  const [lastResult, setLastResult] = useState<AnswerResponse | null>(null);
  const [pointsHistory, setPointsHistory] = useState<number[]>([]);
  const [cumulativeScore, setCumulativeScore] = useState(0);

  const promptStartedAt = useRef<number>(0);
  const submittedRef = useRef(false);
  const inputRef = useRef('');
  inputRef.current = input;

  useEffect(() => {
    const category = params.category;
    if (!category) return;

    fetch('/api/round/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: getPlayerId(), nickname: getNickname(), category, mode }),
    })
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          throw new Error(body.error ?? 'START_FAILED');
        }
        return r.json();
      })
      .then((data: StartRoundResponse) => {
        setRound(data);
        setRemainingMs(data.timePerPromptMs);
        promptStartedAt.current = Date.now();
        setPhase('playing');
      })
      .catch((err: Error) => {
        setErrorMsg(err.message);
        setPhase('error');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.category, mode]);

  const submitAnswer = useCallback(
    async (value: string) => {
      if (!round || submittedRef.current) return;
      submittedRef.current = true;
      setPhase('revealing');
      const elapsedMs = Date.now() - promptStartedAt.current;

      try {
        const res = await fetch('/api/round/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roundId: round.roundId, promptIndex: index, input: value, elapsedMs }),
        });
        const data: AnswerResponse = await res.json();
        setLastResult(data);
        setCumulativeScore(data.cumulativeScore);
        setPointsHistory((prev) => [...prev, data.points]);
      } catch {
        setLastResult({
          promptIndex: index,
          valid: false,
          corrected: false,
          resolvedName: null,
          feedback: 'Connection issue — counted as no answer.',
          tierName: 'failed-to-launch',
          tierLabel: 'Failed to Launch',
          points: 0,
          sharePercent: null,
          cumulativeScore,
        });
      }
    },
    [round, index, cumulativeScore]
  );

  // countdown timer
  useEffect(() => {
    if (phase !== 'playing') return;
    const interval = setInterval(() => {
      const elapsed = Date.now() - promptStartedAt.current;
      const remaining = (round?.timePerPromptMs ?? 20000) - elapsed;
      setRemainingMs(Math.max(0, remaining));
      if (remaining <= 0) {
        clearInterval(interval);
        submitAnswer(inputRef.current);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [phase, round, submitAnswer]);

  // advance to next prompt after showing the tier reveal
  useEffect(() => {
    if (phase !== 'revealing' || !lastResult || !round) return;
    const timeout = setTimeout(async () => {
      const isLast = index >= round.promptTexts.length - 1;
      if (isLast) {
        setPhase('finishing');
        try {
          const res = await fetch('/api/round/finish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roundId: round.roundId, nickname: getNickname() }),
          });
          const data = await res.json();
          try {
            sessionStorage.setItem(
              `orbit:result:${round.roundId}`,
              JSON.stringify({
                category: params.category,
                mode: round.mode,
                puzzleDate: round.puzzleDate,
                promptTexts: round.promptTexts,
                pointsHistory,
                totalScore: data.totalScore,
                breakdown: data.breakdown,
              })
            );
          } catch {
            /* sessionStorage unavailable — results page will show fallback */
          }
          router.push(`/results/${round.roundId}`);
        } catch {
          setErrorMsg('Could not finish the round. Your score was saved locally.');
          setPhase('error');
        }
      } else {
        setIndex((i) => i + 1);
        setInput('');
        setLastResult(null);
        submittedRef.current = false;
        promptStartedAt.current = Date.now();
        setRemainingMs(round.timePerPromptMs);
        setPhase('playing');
      }
    }, 1700);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, lastResult]);

  if (phase === 'loading') {
    return <CenteredMessage>Establishing uplink…</CenteredMessage>;
  }

  if (phase === 'error') {
    return (
      <CenteredMessage>
        {errorMsg === 'ALREADY_PLAYED_TODAY' ? (
          <>
            <p>You already flew today’s dive in this category.</p>
            <a href={`/play/${params.category}?mode=unlimited`} className="mono" style={{ color: 'var(--cyan)' }}>
              Play Unlimited instead →
            </a>
          </>
        ) : (
          <p>Something went wrong. <a href="/" style={{ color: 'var(--cyan)' }}>Back to Mission Control</a></p>
        )}
      </CenteredMessage>
    );
  }

  if (phase === 'finishing') {
    return <CenteredMessage>Calculating final altitude…</CenteredMessage>;
  }

  if (!round) return null;

  return (
    <main
      style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px clamp(12px, 4vw, 24px) 24px clamp(56px, 20vw, 88px)',
        gap: 24,
        boxSizing: 'border-box',
      }}
    >
      <AltitudeGauge altitude={cumulativeScore} />

      <div style={{ position: 'fixed', top: 24, right: 'clamp(12px, 4vw, 24px)', zIndex: 5 }}>
        {phase === 'playing' && <TimerRing remainingMs={remainingMs} totalMs={round.timePerPromptMs} />}
      </div>

      <div style={{ position: 'fixed', top: 28, left: 'clamp(56px, 20vw, 88px)', zIndex: 5 }}>
        <span className="mono" style={{ fontSize: 12, color: 'var(--dim)', letterSpacing: '0.1em' }}>
          {mode === 'daily' ? 'DAILY DIVE' : 'UNLIMITED'}
        </span>
      </div>

      {phase === 'playing' && (
        <PromptCard
          promptText={round.promptTexts[index] ?? ''}
          index={index}
          total={round.promptTexts.length}
          value={input}
          onChange={setInput}
          onSubmit={() => submitAnswer(input)}
          disabled={false}
        />
      )}

      {phase === 'revealing' && lastResult && (
        <TierReveal
          tierName={lastResult.tierName}
          tierLabel={lastResult.tierLabel}
          points={lastResult.points}
          valid={lastResult.valid}
          resolvedName={lastResult.resolvedName}
          corrected={lastResult.corrected}
          feedback={lastResult.feedback}
          sharePercent={lastResult.sharePercent}
        />
      )}
    </main>
  );
}

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <main
      style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: 'var(--dim)',
        fontSize: 16,
        padding: 24,
      }}
    >
      <div>{children}</div>
    </main>
  );
}
