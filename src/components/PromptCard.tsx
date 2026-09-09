'use client';

import { useEffect, useRef } from 'react';

interface Props {
  promptText: string;
  index: number;
  total: number;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}

export default function PromptCard({ promptText, index, total, value, onChange, onSubmit, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [index]);

  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 16,
        background: 'rgba(13, 16, 48, 0.55)',
        backdropFilter: 'blur(6px)',
        padding: '28px 24px',
        width: '100%',
        maxWidth: 560,
        boxSizing: 'border-box',
      }}
    >
      <div className="mono" style={{ fontSize: 12, color: 'var(--dim)', letterSpacing: '0.08em', marginBottom: 14 }}>
        PROMPT {index + 1} / {total}
      </div>
      <h2 style={{ fontSize: 'clamp(20px, 5vw, 26px)', fontWeight: 600, lineHeight: 1.3, marginBottom: 24, color: 'var(--star)' }}>
        {promptText}
      </h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!disabled) onSubmit();
        }}
        style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}
      >
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Type your answer…"
          autoComplete="off"
          spellCheck={false}
          style={{
            flex: '1 1 160px',
            minWidth: 0,
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '14px 16px',
            fontSize: 17,
            color: 'var(--star)',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={disabled || value.trim().length === 0}
          className="mono"
          style={{
            background: 'var(--cyan)',
            color: 'var(--void)',
            border: 'none',
            borderRadius: 10,
            padding: '0 22px',
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '0.05em',
            cursor: disabled ? 'default' : 'pointer',
            opacity: disabled || value.trim().length === 0 ? 0.5 : 1,
            flexShrink: 0,
          }}
        >
          LAUNCH
        </button>
      </form>
    </div>
  );
}
