import type { Prompt } from '../../lib/types';

const p = (id: string, text: string, requireTags: string[]): Prompt => ({
  id: `games.${id}`,
  category: 'games',
  text,
  requireTags,
});

export const gamesPrompts: Prompt[] = [
  p('platformer', 'Name a platformer video game', ['platformer']),
  p('shooter', 'Name a shooter video game', ['shooter']),
  p('rpg', 'Name a role-playing game (RPG)', ['rpg']),
  p('sports', 'Name a sports video game', ['sports']),
  p('puzzle', 'Name a puzzle video game', ['puzzle']),
  p('sandbox', 'Name an open-world or sandbox video game', ['sandbox']),
  p('racing', 'Name a racing video game', ['racing']),
  p('fighting', 'Name a fighting video game', ['fighting']),
  p('horror', 'Name a horror video game', ['horror']),
  p('battle-royale', 'Name a battle royale video game', ['battle-royale']),
  p('retro', 'Name a retro or classic video game', ['retro']),
  p('nintendo', 'Name a Nintendo video game', ['nintendo']),
  p('mobile', 'Name a mobile game', ['mobile']),
  p('indie', 'Name an indie video game', ['indie']),
  p('pc', 'Name a PC video game', ['pc']),
];
