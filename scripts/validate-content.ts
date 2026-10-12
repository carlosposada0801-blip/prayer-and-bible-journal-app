/**
 * Checks every Bible reference in the app's content files.
 *
 *   npm run validate
 *
 * Fails if a reference can't be parsed or points past the end of a chapter,
 * or if lesson ids are duplicated.
 */
import { chapterCount, parseReference, verseCount } from '../src/data/bible/references';
import { CHARACTER_PLANS, SEASONAL_PLANS, TOPICAL_PLANS } from '../src/data/plans/curated';
import { PLANS, getChronologicalChapters } from '../src/data/plans';
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

// Reading plans: every curated reference, plus every generated plan builds without gaps.
for (const plan of [...TOPICAL_PLANS, ...SEASONAL_PLANS, ...CHARACTER_PLANS]) {
  plan.days.forEach((day, i) => day.split(';').forEach((r) => check(`plan ${plan.id} day ${i + 1}`, r.trim())));
}
const planIds = new Set<string>();
for (const plan of PLANS) {
  if (planIds.has(plan.id)) errors.push(`plan: duplicate id "${plan.id}"`);
  planIds.add(plan.id);
  for (const pace of plan.paceable ? (['slow', 'normal', 'fast'] as const) : (['normal'] as const)) {
    const schedule = plan.schedule(pace);
    if (schedule.length !== plan.days(pace)) errors.push(`plan ${plan.id} (${pace}): ${schedule.length} days, expected ${plan.days(pace)}`);
    schedule.forEach((day, i) => day.length === 0 && errors.push(`plan ${plan.id} (${pace}): day ${i + 1} is empty`));
  }
}
// The chronological plan must include every chapter exactly once.
{
  const seen = new Map<string, number>();
  getChronologicalChapters().forEach((c) => seen.set(c, (seen.get(c) ?? 0) + 1));
  const expected = 1189;
  if (seen.size !== expected || [...seen.values()].some((n) => n !== 1)) {
    errors.push(`chronological plan covers ${seen.size} unique chapters (expected ${expected}) with ${[...seen.values()].filter((n) => n > 1).length} duplicates`);
  }
}

export { check };

if (errors.length) {
  console.error(errors.join('\n'));
  console.error(`\n${errors.length} problem(s) in ${checked} references.`);
  process.exit(1);
}
console.log(`All ${checked} references are valid.`);
