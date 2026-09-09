'use client';

interface Props {
  remainingMs: number;
  totalMs: number;
  size?: number;
}

/** Circular countdown ring. Purely a display — the server is the source of truth for timing. */
export default function TimerRing({ remainingMs, totalMs, size = 72 }: Props) {
  const pct = Math.max(0, Math.min(1, remainingMs / totalMs));
  const radius = size / 2 - 6;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);
  const urgent = remainingMs <= 5000;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="var(--border)" strokeWidth={4} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={urgent ? 'var(--magenta)' : 'var(--cyan)'}
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.2s linear' }}
        />
      </svg>
      <div
        className="mono"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          color: urgent ? 'var(--magenta)' : 'var(--star)',
        }}
      >
        {Math.ceil(remainingMs / 1000)}
      </div>
    </div>
  );
}
