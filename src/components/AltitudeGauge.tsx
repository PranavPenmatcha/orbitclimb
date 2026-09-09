'use client';

import { useEffect, useRef, useState } from 'react';
import { MAX_ROUND_POINTS, ALTITUDE_WAYPOINTS } from '@/lib/tiers';
import Rocket from './Rocket';

interface Props {
  altitude: number; // current cumulative score, 0..MAX_ROUND_POINTS
}

/** Fixed vertical rail on the left showing altitude progress with real waypoints. */
export default function AltitudeGauge({ altitude }: Props) {
  const pct = Math.min(100, (altitude / MAX_ROUND_POINTS) * 100);

  const [boosting, setBoosting] = useState(false);
  const prevAltitude = useRef(altitude);
  useEffect(() => {
    if (altitude > prevAltitude.current) {
      setBoosting(true);
      const t = setTimeout(() => setBoosting(false), 900);
      prevAltitude.current = altitude;
      return () => clearTimeout(t);
    }
    prevAltitude.current = altitude;
  }, [altitude]);

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: 64,
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 0',
      }}
      aria-label={`Altitude ${altitude} kilometers`}
    >
      <div
        style={{
          position: 'relative',
          flex: 1,
          width: 3,
          background: 'linear-gradient(180deg, var(--cyan), var(--nebula) 70%, var(--border))',
          borderRadius: 3,
          opacity: 0.5,
        }}
      >
        {ALTITUDE_WAYPOINTS.map((wp) => {
          const wpPct = (wp.km / MAX_ROUND_POINTS) * 100;
          return (
            <div
              key={wp.km}
              style={{
                position: 'absolute',
                bottom: `${wpPct}%`,
                left: -3,
                width: 9,
                height: 2,
                background: 'var(--dim)',
              }}
              title={`${wp.label} — ${wp.km} km`}
            />
          );
        })}
        <div
          style={{
            position: 'absolute',
            bottom: `${pct}%`,
            left: -10,
            width: 22,
            transform: `translateY(50%) scale(${boosting ? 1.15 : 1})`,
            transition: 'bottom 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.3s ease',
            filter: boosting ? 'drop-shadow(0 0 10px var(--cyan))' : 'drop-shadow(0 0 4px rgba(56,232,255,0.4))',
          }}
        >
          <Rocket size={22} thrust={boosting ? 1 : 0.3} />
        </div>
      </div>
      <div
        className="mono"
        style={{
          marginTop: 12,
          fontSize: 11,
          color: 'var(--cyan)',
          letterSpacing: '0.05em',
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
        }}
      >
        {altitude} KM
      </div>
    </div>
  );
}
