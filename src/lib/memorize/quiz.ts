/**
 * Quiz generation for verse memorization. Pure functions – no React – so
 * they're easy to test.
 *
 * Quiz types (they get harder as a verse's stage rises):
 *   blank      – fill in the missing word
 *   order      – tap the words in the right order
 *   reference  – which reference is this verse?
 *   letters    – type the first letter of each word
 *   recall     – type the whole verse from memory
 */

export type Token = { display: string; norm: string };

export type Question =
  | { kind: 'intro'; reference: string; text: string }
  | { kind: 'blank'; reference: string; tokens: Token[]; blank: number; options: string[] }
  | { kind: 'order'; reference: string; tokens: Token[]; start: number; end: number; pieces: Token[] }
  | { kind: 'reference'; reference: string; text: string; options: string[] }
  | { kind: 'letters'; reference: string; tokens: Token[] }
  | { kind: 'recall'; reference: string; tokens: Token[] };

const STOPWORDS = new Set(
  'a an and are as at be but by for from has have he her him his i in is it its me my not of on or our so that the their them they this to us was we were who will with you your yours shall unto thee thou thy which what all no nor do does did am been'.split(' '),
);

const COMMON_WORDS = [
  'love', 'faith', 'grace', 'peace', 'heart', 'spirit', 'light', 'life', 'world', 'glory', 'strength', 'mercy', 'truth',
  'hope', 'joy', 'power', 'word', 'name', 'kingdom', 'heaven', 'earth', 'father', 'son', 'people', 'righteous', 'holy',
  'good', 'great', 'eternal', 'mighty', 'refuge', 'shepherd', 'salvation', 'rest', 'trust', 'fear', 'praise', 'works',
];

export function normalize(word: string) {
  return word
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9']/g, '')
    .replace(/^'+|'+$/g, '');
}

/** Splits verse text into words, keeping punctuation for display. */
export function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  for (const raw of text.split(/\s+/).filter(Boolean)) {
    const norm = normalize(raw);
    if (!norm && tokens.length) {
      tokens[tokens.length - 1].display += ` ${raw}`; // e.g. a lone "—"
    } else if (norm) {
      tokens.push({ display: raw, norm });
    }
  }
  return tokens;
}

/** The word without surrounding punctuation, for answer buttons. */
export function bare(display: string) {
  return display.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9’']+$/g, '').replace(/[’']$/, '');
}

function shuffle<T>(list: T[], rand = Math.random): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function matchCase(word: string, like: string) {
  return like[0] === like[0]?.toUpperCase() && like[0] !== like[0]?.toLowerCase()
    ? word[0].toUpperCase() + word.slice(1)
    : word;
}

function contentIndexes(tokens: Token[]) {
  const idx = tokens.map((t, i) => i).filter((i) => tokens[i].norm.length >= 4 && !STOPWORDS.has(tokens[i].norm));
  return idx.length ? idx : tokens.map((_, i) => i);
}

export function makeBlank(reference: string, tokens: Token[], avoid: number[] = [], rand = Math.random): Question {
  const candidates = contentIndexes(tokens).filter((i) => !avoid.includes(i));
  const pool = candidates.length ? candidates : contentIndexes(tokens);
  const blank = pool[Math.floor(rand() * pool.length)];
  const answer = bare(tokens[blank].display);
  const used = new Set([tokens[blank].norm]);
  const distractors: string[] = [];
  for (const i of shuffle(contentIndexes(tokens), rand)) {
    if (distractors.length >= 2) break;
    if (!used.has(tokens[i].norm)) {
      used.add(tokens[i].norm);
      distractors.push(matchCase(bare(tokens[i].display), answer));
    }
  }
  for (const w of shuffle(COMMON_WORDS, rand)) {
    if (distractors.length >= 3) break;
    if (!used.has(w)) {
      used.add(w);
      distractors.push(matchCase(w, answer));
    }
  }
  return { kind: 'blank', reference, tokens, blank, options: shuffle([answer, ...distractors], rand) };
}

export function makeOrder(reference: string, tokens: Token[], length: number, rand = Math.random): Question {
  const len = Math.min(length, tokens.length);
  const start = tokens.length === len ? 0 : Math.floor(rand() * (tokens.length - len + 1));
  const end = start + len;
  const answer = tokens.slice(start, end);
  let pieces = shuffle(answer, rand);
  for (let tries = 0; tries < 5 && pieces.every((p, i) => p.norm === answer[i].norm) && len > 1; tries++) {
    pieces = shuffle(answer, rand);
  }
  return { kind: 'order', reference, tokens, start, end, pieces };
}

export function makeReference(reference: string, text: string, others: string[], rand = Math.random): Question {
  const book = (r: string) => r.replace(/\s+\d+(:.*)?$/, '');
  // Prefer references from other books so the choice isn't a trick question.
  const pool = shuffle(others.filter((o) => o !== reference), rand).sort(
    (a, b) => Number(book(a) === book(reference)) - Number(book(b) === book(reference)),
  );
  return { kind: 'reference', reference, text, options: shuffle([reference, ...pool.slice(0, 3)], rand) };
}

/**
 * Questions for one lesson, based on how far along the verse is.
 * Stage 0 starts with an introduction card.
 */
export function lessonQuestions(reference: string, text: string, stage: number, allReferences: string[], rand = Math.random): Question[] {
  const tokens = tokenize(text);
  const short = Math.min(6, tokens.length);
  const medium = Math.min(9, tokens.length);
  const long = tokens.length <= 22 ? tokens.length : 14;
  const b1 = makeBlank(reference, tokens, [], rand) as Extract<Question, { kind: 'blank' }>;
  const b2 = makeBlank(reference, tokens, [b1.blank], rand) as Extract<Question, { kind: 'blank' }>;
  const b3 = makeBlank(reference, tokens, [b1.blank, b2.blank], rand);
  switch (Math.min(stage, 4)) {
    case 0:
      return [{ kind: 'intro', reference, text }, b1, b2, makeOrder(reference, tokens, short, rand), b3];
    case 1:
      return [b1, makeOrder(reference, tokens, medium, rand), b2, makeOrder(reference, tokens, medium, rand)];
    case 2:
      return [makeReference(reference, text, allReferences, rand), makeOrder(reference, tokens, long, rand), b1];
    case 3:
      return [{ kind: 'letters', reference, tokens }, makeReference(reference, text, allReferences, rand)];
    default:
      return [{ kind: 'letters', reference, tokens }, { kind: 'recall', reference, tokens }];
  }
}

/** One or two quick questions to review a verse you've already learned. */
export function reviewQuestions(reference: string, text: string, stage: number, allReferences: string[], rand = Math.random): Question[] {
  const tokens = tokenize(text);
  if (stage <= 1) return [makeBlank(reference, tokens, [], rand), makeOrder(reference, tokens, Math.min(8, tokens.length), rand)];
  if (stage === 2) return [makeOrder(reference, tokens, Math.min(14, tokens.length), rand), makeReference(reference, text, allReferences, rand)];
  if (stage === 3) return [{ kind: 'letters', reference, tokens }];
  return [rand() < 0.5 ? { kind: 'letters', reference, tokens } : { kind: 'recall', reference, tokens }];
}

/** Compares a typed verse to the real one, word by word (ignoring case and punctuation). */
export function compareRecall(answer: Token[], typed: string) {
  const input = tokenize(typed).map((t) => t.norm);
  const target = answer.map((t) => t.norm);
  // Longest common subsequence, tracking which target words were matched.
  const dp = Array.from({ length: target.length + 1 }, () => new Array<number>(input.length + 1).fill(0));
  for (let i = target.length - 1; i >= 0; i--) {
    for (let j = input.length - 1; j >= 0; j--) {
      dp[i][j] = target[i] === input[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const matched = new Set<number>();
  let i = 0;
  let j = 0;
  while (i < target.length && j < input.length) {
    if (target[i] === input[j]) {
      matched.add(i);
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  const score = matched.size / Math.max(target.length, input.length, 1);
  return { score, matched };
}

export function firstLetter(token: Token) {
  return token.norm.replace(/[^a-z0-9]/g, '')[0] ?? '';
}
