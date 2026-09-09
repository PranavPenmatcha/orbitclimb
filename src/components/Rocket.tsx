'use client';

interface Props {
  size?: number;
  /** 0 = idle on the pad, 1 = full thrust (bigger flame, more shake) */
  thrust?: number;
  className?: string;
}

/**
 * A small pixel-styled rocket, drawn as blocky <rect>s so it reads crisply
 * at tiny sizes (the altitude-rail marker) as well as large (results hero).
 * Idle bob + flicker are pure CSS so they cost nothing extra per instance.
 */
export default function Rocket({ size = 28, thrust = 0.4, className }: Props) {
  const flameScale = 0.6 + thrust * 0.8;
  return (
    <svg
      viewBox="0 0 16 24"
      width={size}
      height={(size * 24) / 16}
      className={className}
      style={{ overflow: 'visible', animation: 'rocketBob 2.2s ease-in-out infinite' }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes rocketBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes flameFlicker {
          0%, 100% { transform: scaleY(1) scaleX(1); opacity: 0.95; }
          50% { transform: scaleY(1.25) scaleX(0.85); opacity: 0.75; }
        }
      `}</style>

      {/* flame */}
      <g style={{ transformOrigin: '8px 20px', animation: 'flameFlicker 0.18s ease-in-out infinite' }}>
        <rect x="6" y="20" width="4" height={6 * flameScale} fill="var(--magenta)" opacity="0.9" />
        <rect x="7" y="20" width="2" height={4 * flameScale} fill="#ffd0ea" />
      </g>

      {/* fins */}
      <rect x="2" y="15" width="3" height="5" fill="var(--nebula)" />
      <rect x="11" y="15" width="3" height="5" fill="var(--nebula)" />

      {/* body */}
      <rect x="5" y="4" width="6" height="15" fill="var(--star)" />
      <rect x="5" y="4" width="6" height="15" fill="none" stroke="var(--border)" strokeWidth="0.5" />

      {/* nose cone */}
      <rect x="6" y="1" width="4" height="3" fill="var(--magenta)" />

      {/* window */}
      <rect x="6.5" y="8" width="3" height="3" fill="var(--cyan)" />
    </svg>
  );
}
