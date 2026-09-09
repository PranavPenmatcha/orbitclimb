import type { Prompt } from '../../lib/types';

const p = (id: string, text: string, requireTags: string[]): Prompt => ({
  id: `animals.${id}`,
  category: 'animals',
  text,
  requireTags,
});

export const animalsPrompts: Prompt[] = [
  p('mammal', 'Name a mammal', ['mammal']),
  p('bird', 'Name a bird', ['bird']),
  p('reptile', 'Name a reptile', ['reptile']),
  p('fish', 'Name a fish', ['fish']),
  p('insect', 'Name an insect', ['insect']),
  p('invertebrate', 'Name an animal without a backbone — crab, jellyfish, octopus, that sort of thing', ['invertebrate']),
  p('ocean', 'Name an animal that lives in the ocean', ['ocean']),
  p('africa', 'Name an animal native to Africa', ['africa']),
  p('asia', 'Name an animal native to Asia', ['asia']),
  p('south-america', 'Name an animal native to South America', ['south-america']),
  p('north-america', 'Name an animal native to North America', ['north-america']),
  p('forest', 'Name an animal that lives in a forest', ['forest']),
  p('nocturnal', 'Name a nocturnal animal', ['nocturnal']),
  p('domesticated', 'Name a domesticated animal', ['domesticated']),
  p('endangered', 'Name an endangered animal', ['endangered']),
  p('large', 'Name a large animal', ['large']),
  p('carnivore', 'Name a carnivorous animal', ['carnivore']),
  p('herbivore', 'Name an herbivore', ['herbivore']),
  p('venomous', 'Name a venomous animal', ['venomous']),
  p('grassland', 'Name an animal that lives on open grassland or savanna', ['grassland']),
  p('small-mammal', 'Name a small mammal', ['mammal', 'small']),
];
