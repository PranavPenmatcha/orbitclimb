import type { Prompt } from '../../lib/types';

const p = (id: string, text: string, requireTags: string[]): Prompt => ({
  id: `athletes.${id}`,
  category: 'athletes',
  text,
  requireTags,
});

export const athletesPrompts: Prompt[] = [
  p('basketball', 'Name a basketball player', ['basketball']),
  p('soccer', 'Name a soccer player', ['soccer']),
  p('football', 'Name an American football player', ['football-american']),
  p('tennis', 'Name a tennis player', ['tennis']),
  p('baseball', 'Name a baseball player', ['baseball']),
  p('golf', 'Name a golfer', ['golf']),
  p('boxing', 'Name a boxer', ['boxing']),
  p('mma', 'Name an MMA fighter', ['mma']),
  p('olympics', 'Name an Olympic athlete', ['olympics-track']),
  p('hockey', 'Name a hockey player', ['hockey']),
  p('cricket', 'Name a cricket player', ['cricket']),
  p('women', 'Name a female athlete', ['women']),
  p('legend', 'Name a legendary athlete from any sport', ['legend']),
  p('active', 'Name a currently active professional athlete', ['active']),
  p('international', 'Name an athlete who isn’t American', ['international']),
];
