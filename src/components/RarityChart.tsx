'use client';

import { useState } from 'react';

// Validated ordinal ramp (single hue, monotone lightness, dark-surface-safe —
// see dataviz skill: node scripts/validate_palette.js ... --ordinal --mode dark).
// Low rarity recedes toward the dark surface; high rarity pops bright.
const TIER_RAMP: Record<string, string> = {
  launchpad: '#184f95',
  contrail: '#256abf',
  stratosphere: '#3987e5',
  'karman-line': '#6da7ec',
  orbital: '#9ec5f4',
  'deep-space': '#cde2fb',
  'failed-to-launch': '#3a3f6b',
};

export interface RarityChartEntry {
  promptText: string;
  tierName: string;
  tierLabel: string;
  points: number;
  sharePercent: number | null;
  resolvedName: string | null;
}

interface Props {
  entries: RarityChartEntry[];
}

const CHART_HEIGHT = 120;
const BAR_MAX = 100; // points scale

export default function RarityChart({ entries }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div style={{ width: '100%', maxWidth: 560, position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <span className="mono" style={{ fontSize: 12, color: 'var(--dim)', letterSpacing: '0.1em' }}>
          RARITY BY PROMPT
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="mono" style={{ fontSize: 10, color: 'var(--dim)' }}>
            COMMON
          </span>
          <div
            style={{
              width: 40,
              height: 6,
              borderRadius: 3,
              background: 'linear-gradient(90deg, #184f95, #cde2fb)',
            }}
          />
          <span className="mono" style={{ fontSize: 10, color: 'var(--dim)' }}>
            RARE
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 6,
          height: CHART_HEIGHT,
          borderBottom: '1px solid var(--border)',
          position: 'relative',
        }}
      >
        {entries.map((e, i) => {
          const heightPx = Math.max(3, (e.points / BAR_MAX) * (CHART_HEIGHT - 20));
          const color = TIER_RAMP[e.tierName] ?? TIER_RAMP['failed-to-launch'];
          return (
            <div
              key={i}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', position: 'relative' }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--dim)', marginBottom: 4 }}>
                {e.points}
              </span>
              <div
                style={
                  e.points === 0
                    ? {
                        width: '100%',
                        maxWidth: 24,
                        height: 8,
                        border: '1.5px dashed var(--dim)',
                        borderBottom: 'none',
                        borderRadius: '4px 4px 0 0',
                        opacity: hovered === i ? 0.9 : 0.55,
                        transition: 'opacity 0.15s ease',
                      }
                    : {
                        width: '100%',
                        maxWidth: 24,
                        height: heightPx,
                        background: color,
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.7s cubic-bezier(0.2, 0.8, 0.2, 1), filter 0.15s ease',
                        filter: hovered === i ? 'brightness(1.25)' : 'none',
                        animationName: 'barGrow',
                        animationDuration: '0.7s',
                        animationTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
                        animationDelay: `${i * 0.05}s`,
                        animationFillMode: 'backwards',
                      }
                }
              />
              <span className="mono" style={{ fontSize: 10, color: 'var(--dim)', marginTop: 6 }}>
                {i + 1}
              </span>

              {hovered === i && (
                <div
                  role="tooltip"
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginBottom: 8,
                    background: 'var(--panel-raised)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '8px 10px',
                    width: 180,
                    fontSize: 11.5,
                    color: 'var(--star)',
                    zIndex: 10,
                    boxShadow: '0 8px 24px -8px rgba(0,0,0,0.6)',
                    pointerEvents: 'none',
                  }}
                >
                  <div style={{ color: 'var(--dim)', marginBottom: 3, lineHeight: 1.3 }}>{e.promptText}</div>
                  <div style={{ fontWeight: 600 }}>{e.resolvedName ?? '— no answer —'}</div>
                  <div className="mono" style={{ color: 'var(--cyan)', marginTop: 2 }}>
                    {e.tierLabel}
                    {e.sharePercent !== null && ` · ${(e.sharePercent * 100).toFixed(e.sharePercent < 0.01 ? 2 : 1)}%`}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes barGrow {
          from { height: 0 !important; }
        }
      `}</style>
    </div>
  );
}
