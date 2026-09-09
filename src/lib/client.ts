'use client';

/** Anonymous player identity, held in localStorage — no accounts, no auth. */
const PLAYER_ID_KEY = 'orbit:playerId';
const NICKNAME_KEY = 'orbit:nickname';

function randomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `p-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const ADJECTIVES = ['Swift', 'Silent', 'Lunar', 'Solar', 'Cosmic', 'Rogue', 'Neon', 'Rapid', 'Stellar', 'Quantum'];
const NOUNS = ['Falcon', 'Comet', 'Voyager', 'Nomad', 'Drifter', 'Pilot', 'Ranger', 'Probe', 'Satellite', 'Orbiter'];

function randomNickname(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 900 + 100);
  return `${adj}${noun}${num}`;
}

export function getPlayerId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let id = localStorage.getItem(PLAYER_ID_KEY);
    if (!id) {
      id = randomId();
      localStorage.setItem(PLAYER_ID_KEY, id);
    }
    return id;
  } catch {
    return randomId();
  }
}

export function getNickname(): string {
  if (typeof window === 'undefined') return 'Anonymous';
  try {
    let name = localStorage.getItem(NICKNAME_KEY);
    if (!name) {
      name = randomNickname();
      localStorage.setItem(NICKNAME_KEY, name);
    }
    return name;
  } catch {
    return randomNickname();
  }
}

export function setNickname(name: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NICKNAME_KEY, name.slice(0, 40));
  } catch {
    /* ignore */
  }
}
