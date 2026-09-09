'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getPlayerId } from '@/lib/client';
import { ALTITUDE_WAYPOINTS } from '@/lib/tiers';
import ShareCard from '@/components/ShareCard';
import AscentAnimation from '@/components/AscentAnimation';
import RarityChart from '@/components/RarityChart';

interface BreakdownEntry {
  promptText: string;
  tierName: string;
  tierLabel: string;
  points: number;
  sharePercent: number | null;
  resolvedName: string | null;
  rareExamples: string[];
}

interface StoredResult {
  category: string;
  mode: 'daily' | 'unlimited';
  puzzleDate: string | null;
  promptTexts: string[];
  pointsHistory: number[];
  totalScore: number;
  breakdown: BreakdownEntry[];
}

interface LeaderboardEntry {
  rank: number;
  nickname: string;
  score: number;
  playerId: string;
}

function altitudeMilestone(score: number): string {
  const passed = [...ALTITUDE_WAYPOINTS].reverse().find((wp) => score >= wp.km);
  if (!passed) return 'Still on the launchpad.';
  return `You reached ${passed.label} (${passed.km} km).`;
}

export default function ResultsPage() {
  const params = useParams<{ roundId: string }>();
  const [result, setResult] = useState<StoredResult | null | undefined>(undefined);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(null);
  const [categoryName, setCategoryName] = useState<string>('');

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`orbit:result:${params.roundId}`);
      setResult(raw ? JSON.parse(raw) : null);
    } catch {
      setResult(null);
    }
  }, [params.roundId]);

  useEffect(() => {
    if (!result) return;
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => {
        const cat = data.categories.find((c: { id: string }) => c.id === result.category);
        setCategoryName(cat?.name ?? result.category);
      })
      .catch(() => setCategoryName(result.category));

    if (result.mode === 'daily' && result.puzzleDate) {
      fetch(`/api/leaderboard?category=${result.category}&date=${result.puzzleDate}`)
        .then((r) => r.json())
        .then((data) => setLeaderboard(data.entries))
        .catch(() => setLeaderboard([]));
    }
  }, [result]);

  if (result === undefined) {
    return <Centered>Loading your dive…</Centered>;
  }

  if (result === null) {
    return (
      <Centered>
        <p>No result found for this round (maybe the page was reloaded).</p>
        <Link href="/" style={{ color: 'var(--cyan)' }}>
          Back to Mission Control
        </Link>
      </Centered>
    );
  }

  const playerId = getPlayerId();

  return (
    <main
      style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '56px 24px 80px',
        gap: 36,
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div className="mono" style={{ color: 'var(--dim)', fontSize: 12, letterSpacing: '0.2em', marginBottom: 16 }}>
          {categoryName.toUpperCase()} · {result.mode === 'daily' ? 'DAILY DIVE' : 'UNLIMITED'}
        </div>
        <AscentAnimation finalScore={result.totalScore} />
        <p style={{ color: 'var(--cyan)', marginTop: 14, fontSize: 15 }}>{altitudeMilestone(result.totalScore)}</p>
      </div>

      <RarityChart entries={result.breakdown} />

      <div style={{ width: '100%', maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {result.breakdown.map((b, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              padding: '10px 16px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'rgba(19, 26, 74, 0.35)',
              gap: 12,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13.5, color: 'var(--star)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {b.promptText}
              </div>
              <div className="mono" style={{ fontSize: 11.5, color: 'var(--dim)', marginTop: 2 }}>
                {b.resolvedName ?? '— no answer —'} · {b.tierLabel}
                {b.sharePercent !== null && ` · ${(b.sharePercent * 100).toFixed(b.sharePercent < 0.01 ? 2 : 1)}%`}
              </div>
              {b.rareExamples.length > 0 && (
                <div style={{ fontSize: 11, color: 'var(--nebula)', marginTop: 4 }}>
                  Rarer picks: {b.rareExamples.join(', ')}
                </div>
              )}
            </div>
            <div className="mono" style={{ fontSize: 15, fontWeight: 700, color: 'var(--cyan)', flexShrink: 0 }}>
              +{b.points}
            </div>
          </div>
        ))}
      </div>

      <ShareCard
        categoryName={categoryName}
        mode={result.mode}
        puzzleDate={result.puzzleDate}
        points={result.pointsHistory}
        totalScore={result.totalScore}
      />

      {result.mode === 'daily' && leaderboard && leaderboard.length > 0 && (
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div className="mono" style={{ fontSize: 12, color: 'var(--dim)', letterSpacing: '0.1em', marginBottom: 10 }}>
            TODAY’S LEADERBOARD
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {leaderboard.slice(0, 10).map((e) => (
              <div
                key={e.rank}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 13.5,
                  padding: '6px 10px',
                  borderRadius: 6,
                  background: e.playerId === playerId ? 'rgba(56, 232, 255, 0.1)' : 'transparent',
                  color: e.playerId === playerId ? 'var(--cyan)' : 'var(--star)',
                }}
              >
                <span className="mono">
                  #{e.rank} {e.nickname}
                </span>
                <span className="mono">{e.score} km</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 16 }}>
        <Link href="/" className="mono" style={{ color: 'var(--dim)', fontSize: 13 }}>
          ← Mission Control
        </Link>
        <Link href={`/play/${result.category}?mode=unlimited`} className="mono" style={{ color: 'var(--cyan)', fontSize: 13 }}>
          Play Unlimited →
        </Link>
      </div>
    </main>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
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
        gap: 12,
        textAlign: 'center',
        color: 'var(--dim)',
      }}
    >
      {children}
    </main>
  );
}
