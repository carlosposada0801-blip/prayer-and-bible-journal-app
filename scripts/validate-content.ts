/**
 * Checks every Bible reference in the app's content files.
 *
 *   npm run validate
 *
 * Fails if a reference can't be parsed or points past the end of a chapter.
 */
import { chapterCount, parseReference, verseCount } from '../src/data/bible/references';
import { VERSES_OF_THE_DAY } from '../src/data/verses-of-the-day';

const errors: string[] = [];
let checked = 0;

export function check(label: string, input: string) {
  checked++;
  const r = parseReference(input);
  if (!r) return errors.push(`${label}: cannot parse "${input}"`);
  const lastChapter = r.chapterEnd ?? r.chapter;
  if (lastChapter > chapterCount(r.book)) errors.push(`${label}: "${input}" chapter out of range`);
  if (r.verseStart && r.verseStart > verseCount(r.book, r.chapter)) errors.push(`${label}: "${input}" start verse out of range`);
  if (r.verseEnd && r.verseEnd > verseCount(r.book, lastChapter)) errors.push(`${label}: "${input}" end verse out of range`);
}

VERSES_OF_THE_DAY.forEach((v) => check('verse of the day', v));

const extra = globalThis as unknown as { __extraChecks?: (() => void)[] };
(extra.__extraChecks ?? []).forEach((f) => f());

if (errors.length) {
  console.error(errors.join('\n'));
  console.error(`\n${errors.length} problem(s) in ${checked} references.`);
  process.exit(1);
}
console.log(`All ${checked} references are valid.`);
