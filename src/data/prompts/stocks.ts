import type { Prompt } from '../../lib/types';

const p = (id: string, text: string, requireTags: string[]): Prompt => ({
  id: `stocks.${id}`,
  category: 'stocks',
  text,
  requireTags,
});

export const stocksPrompts: Prompt[] = [
  p('tech', 'Name a technology company', ['tech']),
  p('dividend', 'Name a company that pays a dividend to shareholders', ['dividend-payer']),
  p('healthcare', 'Name a healthcare or pharmaceutical company', ['healthcare']),
  p('retail', 'Name a retail brand you could walk into and buy something from', ['retail']),
  p('chipmaker', 'Name a semiconductor / chipmaker company', ['semiconductor']),
  p('mega', 'Name a company worth more than $500 billion', ['mega-cap']),
  p('media', 'Name a media or entertainment company', ['media']),
  p('energy', 'Name an energy, oil, or utility company', ['energy']),
  p('finance', 'Name a bank or financial services company', ['finance']),
  p('international', 'Name a public company headquartered outside the United States', ['international']),
  p('nasdaq', 'Name a company listed on the Nasdaq', ['nasdaq']),
  p('nyse', 'Name a company listed on the New York Stock Exchange', ['nyse']),
  p('smallcap', 'Name a smaller public company most people haven’t heard of', ['small-cap']),
  p('consumer', 'Name a company that sells directly to everyday shoppers', ['consumer']),
];
