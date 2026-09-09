import type { AnswerEntry, Category, CategoryId, Prompt } from '../lib/types';
import { stocks } from './stocks';
import { animals } from './animals';
import { countries } from './countries';
import { movies } from './movies';
import { athletes } from './athletes';
import { games } from './games';
import { music } from './music';
import { stocksPrompts } from './prompts/stocks';
import { animalsPrompts } from './prompts/animals';
import { countriesPrompts } from './prompts/countries';
import { moviesPrompts } from './prompts/movies';
import { athletesPrompts } from './prompts/athletes';
import { gamesPrompts } from './prompts/games';
import { musicPrompts } from './prompts/music';

export const CATEGORIES: Category[] = [
  { id: 'stocks', name: 'Stocks', tagline: 'Public companies, from mega-caps to meme stocks', glyph: 'STK' },
  { id: 'animals', name: 'Animals', tagline: 'Anything that walks, swims, or flies', glyph: 'ANI' },
  { id: 'countries', name: 'Countries', tagline: 'All 187 dots on the map, more or less', glyph: 'GEO' },
  { id: 'movies', name: 'Movies', tagline: 'Blockbusters, classics, and deep cuts', glyph: 'FLM' },
  { id: 'athletes', name: 'Athletes', tagline: 'Legends and current stars across every sport', glyph: 'ATH' },
  { id: 'games', name: 'Video Games', tagline: 'From arcade cabinets to battle royales', glyph: 'GME' },
  { id: 'music', name: 'Music Artists', tagline: 'Every genre, every era', glyph: 'MUS' },
];

export const ANSWER_POOLS: Record<CategoryId, AnswerEntry[]> = {
  stocks,
  animals,
  countries,
  movies,
  athletes,
  games,
  music,
};

export const PROMPT_SETS: Record<CategoryId, Prompt[]> = {
  stocks: stocksPrompts,
  animals: animalsPrompts,
  countries: countriesPrompts,
  movies: moviesPrompts,
  athletes: athletesPrompts,
  games: gamesPrompts,
  music: musicPrompts,
};

export function getCategory(id: CategoryId): Category {
  const c = CATEGORIES.find((c) => c.id === id);
  if (!c) throw new Error(`Unknown category: ${id}`);
  return c;
}

export function isValidCategoryId(id: string): id is CategoryId {
  return CATEGORIES.some((c) => c.id === id);
}

/** All answers in a category's pool that satisfy a given prompt's tag rules. */
export function validAnswersForPrompt(prompt: Prompt): AnswerEntry[] {
  const pool = ANSWER_POOLS[prompt.category];
  return pool.filter((entry) => {
    for (const tag of prompt.requireTags) {
      if (!entry.tags.includes(tag)) return false;
    }
    if (prompt.excludeTags) {
      for (const tag of prompt.excludeTags) {
        if (entry.tags.includes(tag)) return false;
      }
    }
    return true;
  });
}
