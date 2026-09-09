import type { AnswerEntry } from '../lib/types';

const a = (id: string, name: string, tags: string[], weight: number, aliases?: string[]): AnswerEntry =>
  aliases ? { id, name, tags, weight, aliases } : { id, name, tags, weight };

// weight: how readily a casual sports fan names this athlete, 0.0001 (needs a
// real fandom in that sport) to 0.3 (a household name across sports).
export const athletes: AnswerEntry[] = [
  // basketball
  a('lebron-james', 'LeBron James', ['basketball', 'active', 'men', 'usa'], 0.25),
  a('michael-jordan', 'Michael Jordan', ['basketball', 'retired', 'legend', 'men', 'usa'], 0.28),
  a('kobe-bryant', 'Kobe Bryant', ['basketball', 'retired', 'legend', 'men', 'usa'], 0.22),
  a('stephen-curry', 'Stephen Curry', ['basketball', 'active', 'men', 'usa'], 0.2),
  a('shaquille-oneal', "Shaquille O'Neal", ['basketball', 'retired', 'legend', 'men', 'usa'], 0.14, ['shaq']),
  a('kevin-durant', 'Kevin Durant', ['basketball', 'active', 'men', 'usa'], 0.14),
  a('giannis-antetokounmpo', 'Giannis Antetokounmpo', ['basketball', 'active', 'men', 'international'], 0.1),
  a('magic-johnson', 'Magic Johnson', ['basketball', 'retired', 'legend', 'men', 'usa'], 0.1),
  a('larry-bird', 'Larry Bird', ['basketball', 'retired', 'legend', 'men', 'usa'], 0.08),
  a('tim-duncan', 'Tim Duncan', ['basketball', 'retired', 'legend', 'men', 'usa'], 0.04),
  a('kareem-abdul-jabbar', 'Kareem Abdul-Jabbar', ['basketball', 'retired', 'legend', 'men', 'usa'], 0.05),
  a('dirk-nowitzki', 'Dirk Nowitzki', ['basketball', 'retired', 'men', 'international'], 0.03),
  a('luka-doncic', 'Luka Dončić', ['basketball', 'active', 'men', 'international'], 0.08),
  a('nikola-jokic', 'Nikola Jokić', ['basketball', 'active', 'men', 'international'], 0.05),
  a('kawhi-leonard', 'Kawhi Leonard', ['basketball', 'active', 'men', 'usa'], 0.03),
  a('james-harden', 'James Harden', ['basketball', 'active', 'men', 'usa'], 0.04),
  a('allen-iverson', 'Allen Iverson', ['basketball', 'retired', 'legend', 'men', 'usa'], 0.04),
  a('dwyane-wade', 'Dwyane Wade', ['basketball', 'retired', 'men', 'usa'], 0.03),
  a('sue-bird', 'Sue Bird', ['basketball', 'retired', 'women', 'usa'], 0.02),
  a('diana-taurasi', 'Diana Taurasi', ['basketball', 'active', 'women', 'usa'], 0.015),
  a('caitlin-clark', 'Caitlin Clark', ['basketball', 'active', 'women', 'usa'], 0.06),
  a('aja-wilson', "A'ja Wilson", ['basketball', 'active', 'women', 'usa'], 0.015),

  // american football
  a('tom-brady', 'Tom Brady', ['football-american', 'retired', 'legend', 'men', 'usa'], 0.28),
  a('patrick-mahomes', 'Patrick Mahomes', ['football-american', 'active', 'men', 'usa'], 0.18),
  a('peyton-manning', 'Peyton Manning', ['football-american', 'retired', 'legend', 'men', 'usa'], 0.12),
  a('aaron-rodgers', 'Aaron Rodgers', ['football-american', 'active', 'men', 'usa'], 0.1),
  a('jerry-rice', 'Jerry Rice', ['football-american', 'retired', 'legend', 'men', 'usa'], 0.04),
  a('joe-montana', 'Joe Montana', ['football-american', 'retired', 'legend', 'men', 'usa'], 0.04),
  a('brett-favre', 'Brett Favre', ['football-american', 'retired', 'legend', 'men', 'usa'], 0.03),
  a('walter-payton', 'Walter Payton', ['football-american', 'retired', 'legend', 'men', 'usa'], 0.02),
  a('emmitt-smith', 'Emmitt Smith', ['football-american', 'retired', 'legend', 'men', 'usa'], 0.02),
  a('deion-sanders', 'Deion Sanders', ['football-american', 'retired', 'legend', 'men', 'usa'], 0.03),
  a('jj-watt', 'J.J. Watt', ['football-american', 'retired', 'men', 'usa'], 0.02),
  a('travis-kelce', 'Travis Kelce', ['football-american', 'active', 'men', 'usa'], 0.08),
  a('justin-jefferson', 'Justin Jefferson', ['football-american', 'active', 'men', 'usa'], 0.008),
  a('von-miller', 'Von Miller', ['football-american', 'active', 'men', 'usa'], 0.006),

  // soccer
  a('lionel-messi', 'Lionel Messi', ['soccer', 'active', 'men', 'international'], 0.28),
  a('cristiano-ronaldo', 'Cristiano Ronaldo', ['soccer', 'active', 'men', 'international'], 0.28),
  a('pele', 'Pelé', ['soccer', 'retired', 'legend', 'men', 'international'], 0.16),
  a('diego-maradona', 'Diego Maradona', ['soccer', 'retired', 'legend', 'men', 'international'], 0.12),
  a('kylian-mbappe', 'Kylian Mbappé', ['soccer', 'active', 'men', 'international'], 0.14),
  a('neymar', 'Neymar', ['soccer', 'active', 'men', 'international'], 0.12),
  a('david-beckham', 'David Beckham', ['soccer', 'retired', 'men', 'international'], 0.14),
  a('zinedine-zidane', 'Zinedine Zidane', ['soccer', 'retired', 'legend', 'men', 'international'], 0.06),
  a('ronaldinho', 'Ronaldinho', ['soccer', 'retired', 'men', 'international'], 0.06),
  a('erling-haaland', 'Erling Haaland', ['soccer', 'active', 'men', 'international'], 0.08),
  a('luka-modric', 'Luka Modrić', ['soccer', 'active', 'men', 'international'], 0.02),
  a('kevin-de-bruyne', 'Kevin De Bruyne', ['soccer', 'active', 'men', 'international'], 0.03),
  a('mohamed-salah', 'Mohamed Salah', ['soccer', 'active', 'men', 'international'], 0.05),
  a('megan-rapinoe', 'Megan Rapinoe', ['soccer', 'retired', 'women', 'usa'], 0.05),
  a('alex-morgan', 'Alex Morgan', ['soccer', 'retired', 'women', 'usa'], 0.04),
  a('mia-hamm', 'Mia Hamm', ['soccer', 'retired', 'legend', 'women', 'usa'], 0.03),
  a('marta', 'Marta', ['soccer', 'retired', 'legend', 'women', 'international'], 0.008),
  a('abby-wambach', 'Abby Wambach', ['soccer', 'retired', 'women', 'usa'], 0.015),

  // baseball
  a('babe-ruth', 'Babe Ruth', ['baseball', 'retired', 'legend', 'men', 'usa'], 0.2),
  a('derek-jeter', 'Derek Jeter', ['baseball', 'retired', 'legend', 'men', 'usa'], 0.1),
  a('shohei-ohtani', 'Shohei Ohtani', ['baseball', 'active', 'men', 'international'], 0.14),
  a('mike-trout', 'Mike Trout', ['baseball', 'active', 'men', 'usa'], 0.04),
  a('barry-bonds', 'Barry Bonds', ['baseball', 'retired', 'men', 'usa'], 0.04),
  a('hank-aaron', 'Hank Aaron', ['baseball', 'retired', 'legend', 'men', 'usa'], 0.03),
  a('jackie-robinson', 'Jackie Robinson', ['baseball', 'retired', 'legend', 'men', 'usa'], 0.08),
  a('mickey-mantle', 'Mickey Mantle', ['baseball', 'retired', 'legend', 'men', 'usa'], 0.03),
  a('ken-griffey-jr', 'Ken Griffey Jr.', ['baseball', 'retired', 'legend', 'men', 'usa'], 0.03),
  a('alex-rodriguez', 'Alex Rodriguez', ['baseball', 'retired', 'men', 'usa'], 0.04),
  a('aaron-judge', 'Aaron Judge', ['baseball', 'active', 'men', 'usa'], 0.03),

  // tennis
  a('roger-federer', 'Roger Federer', ['tennis', 'retired', 'legend', 'men', 'international'], 0.2),
  a('rafael-nadal', 'Rafael Nadal', ['tennis', 'retired', 'legend', 'men', 'international'], 0.18),
  a('novak-djokovic', 'Novak Djokovic', ['tennis', 'active', 'men', 'international'], 0.18),
  a('serena-williams', 'Serena Williams', ['tennis', 'retired', 'legend', 'women', 'usa'], 0.24),
  a('venus-williams', 'Venus Williams', ['tennis', 'retired', 'women', 'usa'], 0.1),
  a('andy-murray', 'Andy Murray', ['tennis', 'active', 'men', 'international'], 0.04),
  a('maria-sharapova', 'Maria Sharapova', ['tennis', 'retired', 'women', 'international'], 0.06),
  a('coco-gauff', 'Coco Gauff', ['tennis', 'active', 'women', 'usa'], 0.04),
  a('naomi-osaka', 'Naomi Osaka', ['tennis', 'active', 'women', 'international'], 0.05),
  a('billie-jean-king', 'Billie Jean King', ['tennis', 'retired', 'legend', 'women', 'usa'], 0.03),
  a('martina-navratilova', 'Martina Navratilova', ['tennis', 'retired', 'legend', 'women', 'international'], 0.02),
  a('carlos-alcaraz', 'Carlos Alcaraz', ['tennis', 'active', 'men', 'international'], 0.04),

  // golf
  a('tiger-woods', 'Tiger Woods', ['golf', 'active', 'legend', 'men', 'usa'], 0.24),
  a('jack-nicklaus', 'Jack Nicklaus', ['golf', 'retired', 'legend', 'men', 'usa'], 0.06),
  a('arnold-palmer', 'Arnold Palmer', ['golf', 'retired', 'legend', 'men', 'usa'], 0.03),
  a('rory-mcilroy', 'Rory McIlroy', ['golf', 'active', 'men', 'international'], 0.05),
  a('phil-mickelson', 'Phil Mickelson', ['golf', 'active', 'men', 'usa'], 0.04),
  a('jon-rahm', 'Jon Rahm', ['golf', 'active', 'men', 'international'], 0.01),
  a('annika-sorenstam', 'Annika Sörenstam', ['golf', 'retired', 'women', 'international'], 0.008),

  // boxing / mma
  a('muhammad-ali', 'Muhammad Ali', ['boxing', 'retired', 'legend', 'men', 'usa'], 0.22),
  a('mike-tyson', 'Mike Tyson', ['boxing', 'retired', 'legend', 'men', 'usa'], 0.16),
  a('floyd-mayweather', 'Floyd Mayweather', ['boxing', 'retired', 'men', 'usa'], 0.1),
  a('manny-pacquiao', 'Manny Pacquiao', ['boxing', 'retired', 'men', 'international'], 0.06),
  a('canelo-alvarez', 'Canelo Álvarez', ['boxing', 'active', 'men', 'international'], 0.02),
  a('conor-mcgregor', 'Conor McGregor', ['mma', 'active', 'men', 'international'], 0.12),
  a('khabib-nurmagomedov', 'Khabib Nurmagomedov', ['mma', 'retired', 'men', 'international'], 0.06),
  a('jon-jones', 'Jon Jones', ['mma', 'active', 'men', 'usa'], 0.03),
  a('ronda-rousey', 'Ronda Rousey', ['mma', 'retired', 'women', 'usa'], 0.04),
  a('amanda-nunes', 'Amanda Nunes', ['mma', 'retired', 'women', 'international'], 0.008),

  // olympics / track
  a('usain-bolt', 'Usain Bolt', ['olympics-track', 'retired', 'legend', 'men', 'international'], 0.22),
  a('carl-lewis', 'Carl Lewis', ['olympics-track', 'retired', 'legend', 'men', 'usa'], 0.03),
  a('michael-phelps', 'Michael Phelps', ['olympics-track', 'retired', 'legend', 'men', 'usa'], 0.16),
  a('simone-biles', 'Simone Biles', ['olympics-track', 'active', 'women', 'usa'], 0.16, ['gymnastics']),
  a('florence-griffith-joyner', 'Florence Griffith-Joyner', ['olympics-track', 'retired', 'legend', 'women', 'usa'], 0.008),
  a('allyson-felix', 'Allyson Felix', ['olympics-track', 'retired', 'women', 'usa'], 0.008),
  a('katie-ledecky', 'Katie Ledecky', ['olympics-track', 'active', 'women', 'usa'], 0.02),
  a('sha-carri-richardson', "Sha'Carri Richardson", ['olympics-track', 'active', 'women', 'usa'], 0.008),
  a('jesse-owens', 'Jesse Owens', ['olympics-track', 'retired', 'legend', 'men', 'usa'], 0.02),

  // hockey
  a('wayne-gretzky', 'Wayne Gretzky', ['hockey', 'retired', 'legend', 'men', 'international'], 0.14),
  a('sidney-crosby', 'Sidney Crosby', ['hockey', 'active', 'men', 'international'], 0.06),
  a('alex-ovechkin', 'Alex Ovechkin', ['hockey', 'active', 'men', 'international'], 0.05),
  a('mario-lemieux', 'Mario Lemieux', ['hockey', 'retired', 'legend', 'men', 'international'], 0.02),
  a('connor-mcdavid', 'Connor McDavid', ['hockey', 'active', 'men', 'international'], 0.03),
  a('bobby-orr', 'Bobby Orr', ['hockey', 'retired', 'legend', 'men', 'international'], 0.01),

  // cricket
  a('sachin-tendulkar', 'Sachin Tendulkar', ['cricket', 'retired', 'legend', 'men', 'international'], 0.1),
  a('virat-kohli', 'Virat Kohli', ['cricket', 'active', 'men', 'international'], 0.08),
  a('ms-dhoni', 'MS Dhoni', ['cricket', 'retired', 'men', 'international'], 0.06),
  a('brian-lara', 'Brian Lara', ['cricket', 'retired', 'legend', 'men', 'international'], 0.02),
  a('ricky-ponting', 'Ricky Ponting', ['cricket', 'retired', 'men', 'international'], 0.015),
  a('shane-warne', 'Shane Warne', ['cricket', 'retired', 'legend', 'men', 'international'], 0.015),
  a('babar-azam', 'Babar Azam', ['cricket', 'active', 'men', 'international'], 0.01),

  // more cricket
  a('joe-root', 'Joe Root', ['cricket', 'active', 'men', 'international'], 0.006),
  a('kane-williamson', 'Kane Williamson', ['cricket', 'active', 'men', 'international'], 0.005),
  a('ab-de-villiers', 'AB de Villiers', ['cricket', 'retired', 'men', 'international'], 0.008),
  a('wasim-akram', 'Wasim Akram', ['cricket', 'retired', 'legend', 'men', 'international'], 0.005),

  // more golf
  a('gary-player', 'Gary Player', ['golf', 'retired', 'legend', 'men', 'international'], 0.008),
  a('greg-norman', 'Greg Norman', ['golf', 'retired', 'men', 'international'], 0.006),
  a('nelly-korda', 'Nelly Korda', ['golf', 'active', 'women', 'usa'], 0.004),
  a('lexi-thompson', 'Lexi Thompson', ['golf', 'active', 'women', 'usa'], 0.002),
  a('collin-morikawa', 'Collin Morikawa', ['golf', 'active', 'men', 'usa'], 0.003),

  // more hockey
  a('patrick-kane', 'Patrick Kane', ['hockey', 'active', 'men', 'usa'], 0.006),
  a('nathan-mackinnon', 'Nathan MacKinnon', ['hockey', 'active', 'men', 'international'], 0.004),
  a('gordie-howe', 'Gordie Howe', ['hockey', 'retired', 'legend', 'men', 'international'], 0.008),
  a('mark-messier', 'Mark Messier', ['hockey', 'retired', 'legend', 'men', 'international'], 0.005),

  // more boxing / mma
  a('george-foreman', 'George Foreman', ['boxing', 'retired', 'legend', 'men', 'usa'], 0.04),
  a('sugar-ray-robinson', 'Sugar Ray Robinson', ['boxing', 'retired', 'legend', 'men', 'usa'], 0.008),
  a('evander-holyfield', 'Evander Holyfield', ['boxing', 'retired', 'men', 'usa'], 0.02),
  a('anderson-silva', 'Anderson Silva', ['mma', 'retired', 'legend', 'men', 'international'], 0.008),
  a('georges-st-pierre', 'Georges St-Pierre', ['mma', 'retired', 'legend', 'men', 'international'], 0.006),
  a('israel-adesanya', 'Israel Adesanya', ['mma', 'active', 'men', 'international'], 0.006),

  // more olympics / track
  a('nadia-comaneci', 'Nadia Comăneci', ['olympics-track', 'retired', 'legend', 'women', 'international'], 0.008),
  a('mark-spitz', 'Mark Spitz', ['olympics-track', 'retired', 'legend', 'men', 'usa'], 0.005),
  a('shaun-white', 'Shaun White', ['olympics-track', 'retired', 'men', 'usa'], 0.02),
  a('caeleb-dressel', 'Caeleb Dressel', ['olympics-track', 'active', 'men', 'usa'], 0.004),
  a('shericka-jackson', 'Shericka Jackson', ['olympics-track', 'active', 'women', 'international'], 0.002),
];
