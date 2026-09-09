'use client';

import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  r: number;
  speed: number;
  hue: 'star' | 'cyan' | 'magenta';
}

/**
 * Fixed full-viewport canvas starfield behind all content. Stars drift
 * downward — scoring higher in the game reads as "rising past them" rather
 * than the field literally moving with player state (kept intentionally
 * decoupled from game state for simplicity and performance).
 */
export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let stars: Star[] = [];
    let rafId = 0;

    function makeStars() {
      const count = Math.floor((width * height) / 9000);
      stars = Array.from({ length: count }, () => {
        const roll = Math.random();
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 1.4 + 0.3,
          speed: Math.random() * 0.15 + 0.02,
          hue: roll > 0.97 ? 'magenta' : roll > 0.9 ? 'cyan' : 'star',
        };
      });
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      makeStars();
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      for (const s of stars) {
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        const color = s.hue === 'magenta' ? '#ff4fa3' : s.hue === 'cyan' ? '#38e8ff' : '#eaf0ff';
        ctx!.fillStyle = color;
        ctx!.globalAlpha = s.hue === 'star' ? 0.6 : 0.85;
        ctx!.fill();

        if (!prefersReducedMotion) {
          s.y += s.speed;
          if (s.y > height + 2) {
            s.y = -2;
            s.x = Math.random() * width;
          }
        }
      }
      ctx!.globalAlpha = 1;
      rafId = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background:
          'radial-gradient(ellipse at 50% -10%, #1a1550 0%, #05060f 55%), linear-gradient(180deg, #05060f 0%, #070921 100%)',
      }}
    />
  );
}
