'use client';

import { useEffect, useRef, useState } from 'react';
import { MAX_ROUND_POINTS, ALTITUDE_WAYPOINTS } from '@/lib/tiers';
import Rocket from './Rocket';

interface Props {
  finalScore: number;
}

const RAIL_HEIGHT = 220;
const DURATION_MS = 1600;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * The results-screen hero: the rocket climbs the rail from the launchpad to
 * the final altitude while the score counts up in lockstep, both driven by
 * one eased timer so they land together.
 */
export default function AscentAnimation({ finalScore }: Props) {
  const [displayScore, setDisplayScore] = useState(0);
  const [pct, setPct] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayScore(finalScore);
      setPct(Math.min(100, (finalScore / MAX_ROUND_POINTS) * 100));
      return;
    }

    function tick(ts: number) {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const t = Math.min(1, elapsed / DURATION_MS);
      const eased = easeOutCubic(t);
      setDisplayScore(Math.round(eased * finalScore));
      setPct(Math.min(100, eased * (finalScore / MAX_ROUND_POINTS) * 100));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [finalScore]);

  const complete = displayScore >= finalScore;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
      <div style={{ position: 'relative', width: 30, height: RAIL_HEIGHT }}>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            top: 0,
            bottom: 0,
            width: 3,
            borderRadius: 3,
            background: 'linear-gradient(180deg, var(--cyan), var(--nebula) 70%, var(--border))',
            opacity: 0.5,
          }}
        />
        {ALTITUDE_WAYPOINTS.map((wp) => (
          <div
            key={wp.km}
            title={`${wp.label} — ${wp.km} km`}
            style={{
              position: 'absolute',
              bottom: `${(wp.km / MAX_ROUND_POINTS) * 100}%`,
              left: '50%',
              transform: 'translate(-50%, 50%)',
              width: 14,
              height: 2,
              background: 'var(--dim)',
            }}
          />
        ))}
        <div
          style={{
            position: 'absolute',
            bottom: `${pct}%`,
            left: '50%',
            transform: 'translate(-50%, 50%)',
            filter: complete
              ? 'drop-shadow(0 0 6px rgba(56,232,255,0.5))'
              : 'drop-shadow(0 0 14px var(--magenta)) drop-shadow(0 0 26px var(--magenta))',
          }}
        >
          <Rocket size={26} thrust={complete ? 0.25 : 1} />
        </div>
      </div>

      <div>
        <div
          className="mono"
          style={{
            fontSize: 'clamp(56px, 10vw, 96px)',
            fontWeight: 700,
            color: 'var(--star)',
            lineHeight: 1,
            textShadow: '0 0 40px var(--cyan)',
          }}
        >
          {displayScore}
          <span style={{ fontSize: '0.35em', color: 'var(--dim)', marginLeft: 8 }}>km</span>
        </div>
      </div>
    </div>
  );
}
