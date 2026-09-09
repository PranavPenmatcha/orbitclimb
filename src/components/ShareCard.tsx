'use client';

import { useState } from 'react';

const BAR_BY_POINTS: Record<number, string> = {
  100: '█',
  85: '▇',
  60: '▅',
  35: '▄',
  20: '▂',
  10: '▁',
  0: '·',
};

interface Props {
  categoryName: string;
  mode: 'daily' | 'unlimited';
  puzzleDate: string | null;
  points: number[]; // 7 values, one per prompt
  totalScore: number;
}

function buildShareText({ categoryName, puzzleDate, points, totalScore }: Props): string {
  const bars = points.map((p) => BAR_BY_POINTS[p] ?? '·').join('');
  const label = puzzleDate ? `ORBIT · ${categoryName} · ${puzzleDate}` : `ORBIT · ${categoryName} · Unlimited`;
  return `${label}\n${bars}   ${totalScore} km`;
}

export default function ShareCard(props: Props) {
  const [copied, setCopied] = useState(false);
  const text = buildShareText(props);

  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 20,
        background: 'var(--panel)',
        maxWidth: 420,
      }}
    >
      <pre
        className="mono"
        style={{
          margin: 0,
          whiteSpace: 'pre-wrap',
          fontSize: 15,
          color: 'var(--star)',
          lineHeight: 1.6,
        }}
      >
        {text}
      </pre>
      <button
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          } catch {
            /* clipboard unavailable — silently ignore */
          }
        }}
        className="mono"
        style={{
          marginTop: 14,
          background: 'transparent',
          border: '1px solid var(--cyan)',
          color: 'var(--cyan)',
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: 13,
          letterSpacing: '0.05em',
          cursor: 'pointer',
        }}
      >
        {copied ? 'COPIED' : 'COPY RESULT'}
      </button>
    </div>
  );
}
