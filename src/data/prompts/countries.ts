import type { Prompt } from '../../lib/types';

const p = (id: string, text: string, requireTags: string[]): Prompt => ({
  id: `countries.${id}`,
  category: 'countries',
  text,
  requireTags,
});

export const countriesPrompts: Prompt[] = [
  p('coastal', 'Name a country with a coastline', ['coastal']),
  p('landlocked', 'Name a landlocked country', ['landlocked']),
  p('island', 'Name an island nation', ['island']),
  p('africa', 'Name a country in Africa', ['africa']),
  p('europe', 'Name a country in Europe', ['europe']),
  p('asia', 'Name a country in Asia', ['asia']),
  p('north-america', 'Name a country in North America (Caribbean and Central America count)', ['north-america']),
  p('south-america', 'Name a country in South America', ['south-america']),
  p('oceania', 'Name a country in Oceania', ['oceania']),
  p('english', 'Name a country where English is an official language', ['english-speaking']),
  p('spanish', 'Name a Spanish-speaking country', ['spanish-speaking']),
  p('french', 'Name a French-speaking country', ['french-speaking']),
  p('arabic', 'Name an Arabic-speaking country', ['arabic-speaking']),
  p('nato', 'Name a NATO member country', ['nato-member']),
  p('eu', 'Name a European Union member country', ['eu-member']),
  p('small', 'Name a small country', ['small']),
];
