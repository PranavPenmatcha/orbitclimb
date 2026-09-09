/**
 * Validates the ORBIT dataset: catches the mistakes that would silently
 * break a prompt at play time (duplicate ids, ambiguous aliases, a prompt
 * with too few valid answers to feel fair). Run with `npm run validate-data`.
 */
import { CATEGORIES, ANSWER_POOLS, PROMPT_SETS, validAnswersForPrompt } from '../src/data/categories';
import { normalize } from '../src/lib/normalize';

const HARD_FAIL_MIN_ANSWERS = 8; // a prompt below this is unplayable
const WARN_MIN_ANSWERS = 15; // below this, rarity tiers won't feel meaningful

let errors = 0;
let warnings = 0;

function fail(msg: string) {
  console.error(`✗ ${msg}`);
  errors++;
}
function warn(msg: string) {
  console.warn(`! ${msg}`);
  warnings++;
}

for (const category of CATEGORIES) {
  const pool = ANSWER_POOLS[category.id];
  const prompts = PROMPT_SETS[category.id];

  // duplicate ids
  const idSeen = new Map<string, number>();
  for (const entry of pool) {
    idSeen.set(entry.id, (idSeen.get(entry.id) ?? 0) + 1);
  }
  for (const [id, count] of idSeen) {
    if (count > 1) fail(`[${category.id}] duplicate answer id "${id}" (${count}x)`);
  }

  // duplicate/ambiguous normalized names+aliases within a category
  const nameSeen = new Map<string, string[]>();
  for (const entry of pool) {
    const names = [entry.name, ...(entry.aliases ?? [])];
    for (const raw of names) {
      const norm = normalize(raw);
      if (!norm) {
        fail(`[${category.id}] "${entry.id}" has a name/alias that normalizes to empty: "${raw}"`);
        continue;
      }
      const owners = nameSeen.get(norm) ?? [];
      owners.push(entry.id);
      nameSeen.set(norm, owners);
    }
  }
  for (const [norm, owners] of nameSeen) {
    const uniqueOwners = new Set(owners);
    if (uniqueOwners.size > 1) {
      fail(`[${category.id}] ambiguous name "${norm}" claimed by multiple entries: ${[...uniqueOwners].join(', ')}`);
    }
  }

  // weight sanity
  for (const entry of pool) {
    if (!(entry.weight > 0 && entry.weight < 1)) {
      fail(`[${category.id}] "${entry.id}" has weight ${entry.weight}, must be in (0,1)`);
    }
  }

  // duplicate prompt ids
  const promptIdSeen = new Set<string>();
  for (const prompt of prompts) {
    if (promptIdSeen.has(prompt.id)) fail(`[${category.id}] duplicate prompt id "${prompt.id}"`);
    promptIdSeen.add(prompt.id);
  }

  // every prompt must resolve to enough valid answers
  for (const prompt of prompts) {
    const valid = validAnswersForPrompt(prompt);
    if (valid.length < HARD_FAIL_MIN_ANSWERS) {
      fail(`[${category.id}] prompt "${prompt.id}" ("${prompt.text}") only has ${valid.length} valid answers (min ${HARD_FAIL_MIN_ANSWERS})`);
    } else if (valid.length < WARN_MIN_ANSWERS) {
      warn(`[${category.id}] prompt "${prompt.id}" has only ${valid.length} valid answers (recommend ${WARN_MIN_ANSWERS}+)`);
    }
  }

  console.log(`${category.id}: ${pool.length} answers, ${prompts.length} prompts`);
}

console.log(`\n${errors} error(s), ${warnings} warning(s)`);
if (errors > 0) process.exit(1);
