import type { Prompt } from '../../lib/types';

const p = (id: string, text: string, requireTags: string[]): Prompt => ({
  id: `music.${id}`,
  category: 'music',
  text,
  requireTags,
});

export const musicPrompts: Prompt[] = [
  p('pop', 'Name a pop artist', ['pop']),
  p('rock', 'Name a rock artist or band', ['rock']),
  p('hiphop', 'Name a hip-hop artist', ['hiphop']),
  p('country', 'Name a country artist', ['country']),
  p('rnb', 'Name an R&B artist', ['rnb']),
  p('latin', 'Name a Latin music artist', ['latin']),
  p('electronic', 'Name an electronic/EDM artist', ['electronic']),
  p('kpop', 'Name a K-pop act', ['kpop']),
  p('metal', 'Name a metal band', ['metal']),
  p('jazz', 'Name a jazz artist', ['jazz']),
  p('90s', 'Name an artist who was big in the 90s', ['90s']),
  p('2000s', 'Name an artist who was big in the 2000s', ['2000s']),
  p('2010s', 'Name an artist who was big in the 2010s', ['2010s']),
  p('band', 'Name a band (not a solo artist)', ['band']),
  p('solo-woman', 'Name a solo female artist', ['solo', 'woman']),
];
