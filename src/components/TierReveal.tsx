'use client';

const TIER_COLORS: Record<string, string> = {
  'deep-space': 'var(--tier-deep-space)',
  orbital: 'var(--tier-orbital)',
  'karman-line': 'var(--tier-karman)',
  stratosphere: 'var(--tier-stratosphere)',
  contrail: 'var(--tier-contrail)',
  launchpad: 'var(--tier-launchpad)',
  'failed-to-launch': 'var(--tier-failed)',
};

interface Props {
  tierName: string;
  tierLabel: string;
  points: number;
  valid: boolean;
  resolvedName: string | null;
  corrected: boolean;
  feedback: string | null;
  sharePercent: number | null;
}

export default function TierReveal({ tierName, tierLabel, points, valid, resolvedName, corrected, feedback, sharePercent }: Props) {
  const color = TIER_COLORS[tierName] ?? 'var(--dim)';

  return (
    <div
      style={{
        border: `1px solid ${color}`,
        borderRadius: 12,
        padding: '20px 24px',
        background: 'rgba(13, 16, 48, 0.7)',
        boxShadow: `0 0 32px -8px ${color}`,
        animation: 'tierPop 0.35s cubic-bezier(0.2, 0.9, 0.3, 1.2)',
      }}
    >
      <style>{`
        @keyframes tierPop {
          from { opacity: 0; transform: scale(0.92) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 }}>
        <span className="mono" style={{ fontSize: 13, letterSpacing: '0.1em', color, textTransform: 'uppercase' }}>
          {tierLabel}
        </span>
        <span className="mono" style={{ fontSize: 24, fontWeight: 700, color: 'var(--star)' }}>
          +{points} km
        </span>
      </div>

      {valid && resolvedName && (
        <p style={{ marginTop: 10, fontSize: 15, color: 'var(--star)' }}>
          {corrected ? (
            <>
              Read as <strong>{resolvedName}</strong>
            </>
          ) : (
            <strong>{resolvedName}</strong>
          )}
          {sharePercent !== null && (
            <span className="mono" style={{ color: 'var(--dim)', fontSize: 12, marginLeft: 8 }}>
              only {(sharePercent * 100).toFixed(sharePercent < 0.01 ? 2 : 1)}% of players said this
            </span>
          )}
        </p>
      )}

      {!valid && feedback && (
        <p style={{ marginTop: 10, fontSize: 14, color: 'var(--dim)' }}>{feedback}</p>
      )}
    </div>
  );
}
