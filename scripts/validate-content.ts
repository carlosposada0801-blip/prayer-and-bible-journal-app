/**
 * Checks every Bible reference in the app's content files.
 *
 *   npm run validate
 *
 * Fails if a reference can't be parsed or points past the end of a chapter,
 * or if lesson ids are duplicated.
 */
import { chapterCount, parseReference, verseCount } from '../src/data/bible/references';
import { STUDY_SERIES, isPublished } from '../src/data/studies';
import { VERSES_OF_THE_DAY } from '../src/data/verses-of-the-day';

const errors: string[] = [];
let checked = 0;

function check(label: string, input: string | undefined) {
  if (!input) return;
  checked++;
  const r = parseReference(input);
  if (!r) return errors.push(`${label}: cannot parse "${input}"`);
  const lastChapter = r.chapterEnd ?? r.chapter;
  if (lastChapter > chapterCount(r.book)) errors.push(`${label}: "${input}" chapter out of range`);
  if (r.verseStart && r.verseStart > verseCount(r.book, r.chapter)) errors.push(`${label}: "${input}" start verse out of range`);
  if (r.verseEnd && r.verseEnd > verseCount(r.book, lastChapter)) errors.push(`${label}: "${input}" end verse out of range`);
}

VERSES_OF_THE_DAY.forEach((v) => check('verse of the day', v));

const lessonIds = new Set<string>();
for (const series of STUDY_SERIES) {
  for (const lesson of series.lessons) {
    if (lessonIds.has(lesson.id)) errors.push(`study: duplicate lesson id "${lesson.id}"`);
    lessonIds.add(lesson.id);
    check(`study ${lesson.id} passage`, lesson.passage);
    check(`study ${lesson.id} key verse`, lesson.keyVerse);
    if (isPublished(series) && (!lesson.explanation?.length || !lesson.questions?.length || !lesson.application || !lesson.prayer)) {
      errors.push(`study ${lesson.id}: published lessons need explanation, questions, application and prayer`);
    }
  }
}

export { check };

if (errors.length) {
  console.error(errors.join('\n'));
  console.error(`\n${errors.length} problem(s) in ${checked} references.`);
  process.exit(1);
}
console.log(`All ${checked} references are valid.`);
