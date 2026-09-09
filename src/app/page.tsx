'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPlayerId } from '@/lib/client';

interface CategoryWithStreak {
  id: string;
  name: string;
  tagline: string;
  glyph: string;
  streak: number;
  playedToday: boolean;
}

export default function HomePage() {
  const [categories, setCategories] = useState<CategoryWithStreak[] | null>(null);

  useEffect(() => {
    const playerId = getPlayerId();
    fetch(`/api/categories?playerId=${encodeURIComponent(playerId)}`)
      .then((r) => r.json())
      .then((data) => setCategories(data.categories))
      .catch(() => setCategories([]));
  }, []);

  return (
    <main
      style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '64px 24px 80px',
      }}
    >
      <header style={{ textAlign: 'center', marginBottom: 56 }}>
        <div className="mono" style={{ color: 'var(--cyan)', fontSize: 13, letterSpacing: '0.35em', marginBottom: 12 }}>
          MISSION CONTROL
        </div>
        <h1
          style={{
            fontSize: 'clamp(40px, 8vw, 72px)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, var(--star), var(--cyan))',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            margin: 0,
          }}
        >
          ORBIT
        </h1>
        <p style={{ color: 'var(--dim)', fontSize: 17, marginTop: 12, maxWidth: 520 }}>
          Pick a category. Seven prompts, same for everyone today. Rare answers send you higher —
          obvious ones barely leave the ground.
        </p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 18,
          width: '100%',
          maxWidth: 920,
        }}
      >
        {categories === null &&
          Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: 150,
                borderRadius: 16,
                border: '1px solid var(--border)',
                background: 'rgba(19, 26, 74, 0.3)',
                animation: 'pulse 1.6s ease-in-out infinite',
              }}
            />
          ))}

        {categories?.map((cat) => (
          <Link
            key={cat.id}
            href={`/play/${cat.id}?mode=${cat.playedToday ? 'unlimited' : 'daily'}`}
            style={{
              textDecoration: 'none',
              display: 'block',
              borderRadius: 16,
              border: '1px solid var(--border)',
              background: 'rgba(19, 26, 74, 0.45)',
              padding: '22px 22px 18px',
              transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
            }}
            className="category-card"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span
                className="mono"
                style={{
                  fontSize: 11,
                  letterSpacing: '0.15em',
                  color: 'var(--nebula)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  padding: '3px 7px',
                  background: 'var(--panel)',
                }}
              >
                {cat.glyph}
              </span>
              {cat.streak > 0 && (
                <span className="mono" style={{ fontSize: 12, color: 'var(--magenta)' }}>
                  🔥 {cat.streak}
                </span>
              )}
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 600, margin: '14px 0 6px', color: 'var(--star)' }}>{cat.name}</h2>
            <p style={{ fontSize: 13.5, color: 'var(--dim)', margin: 0, lineHeight: 1.4 }}>{cat.tagline}</p>
            <div
              className="mono"
              style={{
                marginTop: 16,
                fontSize: 11,
                letterSpacing: '0.08em',
                color: cat.playedToday ? 'var(--dim)' : 'var(--cyan)',
              }}
            >
              {cat.playedToday ? 'DAILY COMPLETE — REPLAY IN UNLIMITED' : 'PLAY TODAY’S DIVE'}
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        .category-card:hover { transform: translateY(-3px); border-color: var(--cyan); box-shadow: 0 8px 32px -12px var(--cyan); }
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
      `}</style>
    </main>
  );
}
