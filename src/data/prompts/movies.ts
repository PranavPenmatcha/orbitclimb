import type { Prompt } from '../../lib/types';

const p = (id: string, text: string, requireTags: string[]): Prompt => ({
  id: `movies.${id}`,
  category: 'movies',
  text,
  requireTags,
});

export const moviesPrompts: Prompt[] = [
  p('action', 'Name an action movie', ['action']),
  p('drama', 'Name a drama film', ['drama']),
  p('thriller', 'Name a thriller', ['thriller']),
  p('scifi', 'Name a science fiction movie', ['scifi']),
  p('horror', 'Name a horror movie', ['horror']),
  p('comedy', 'Name a comedy movie', ['comedy']),
  p('animated', 'Name an animated movie', ['animated']),
  p('family', 'Name a family movie', ['family']),
  p('oscar', 'Name a movie that won the Best Picture Oscar', ['best-picture-winner']),
  p('90s', 'Name a movie from the 1990s', ['1990s']),
  p('2000s', 'Name a movie from the 2000s', ['2000s']),
  p('2010s', 'Name a movie from the 2010s', ['2010s']),
  p('fantasy', 'Name a fantasy movie', ['fantasy']),
  p('marvel', 'Name a Marvel movie', ['marvel']),
  p('star-wars', 'Name a Star Wars movie', ['star-wars']),
  p('pixar', 'Name a Pixar movie', ['pixar']),
];
