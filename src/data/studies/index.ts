import type { IconName } from '@/components/icons/paths';
import faithOverFear from '@/content/studies/faith-over-fear.json';
import fruitOfTheSpirit from '@/content/studies/fruit-of-the-spirit.json';
import proverbsForWisdom from '@/content/studies/proverbs-for-wisdom.json';
import psalmsForHardDays from '@/content/studies/psalms-for-hard-days.json';
import whoIsJesus from '@/content/studies/who-is-jesus.json';

/**
 * Bible study series. The lessons live in src/content/studies/*.json so
 * they're easy to read, edit and add to – see src/content/studies/README.md.
 *
 * To add a series: create a JSON file there, import it here, and add it to
 * STUDY_SERIES. Run `npm run validate` to check every Bible reference.
 */

export type StudyLesson = {
  id: string;
  title: string;
  /** e.g. "John 6:25-40" – shown in the user's chosen translation. */
  passage: string;
  keyVerse?: string;
  /** Paragraphs of the explanation (aim for a ~5 minute read). */
  explanation?: string[];
  questions?: string[];
  application?: string;
  prayer?: string;
};

export type StudySeries = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: IconName;
  tone: 'gold' | 'sage' | 'rose' | 'sky' | 'navy';
  /** "planned" series appear as Coming Soon until their lessons are written. */
  status?: 'planned' | 'published';
  lessons: StudyLesson[];
};

export const STUDY_SERIES = [
  whoIsJesus,
  faithOverFear,
  fruitOfTheSpirit,
  psalmsForHardDays,
  proverbsForWisdom,
] as StudySeries[];

export function isPublished(series: StudySeries) {
  return series.status !== 'planned';
}

export function getSeries(id: string) {
  return STUDY_SERIES.find((s) => s.id === id);
}

export function findLesson(lessonId: string) {
  for (const series of STUDY_SERIES) {
    const index = series.lessons.findIndex((l) => l.id === lessonId);
    if (index >= 0) return { series, lesson: series.lessons[index], index };
  }
  return undefined;
}
