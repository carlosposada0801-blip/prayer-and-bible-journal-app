import type { IconName } from '@/components/icons/paths';

import { BOOKS } from '../bible/books';
import { ref, type Reference } from '../bible/references';
import { CHARACTER_PLANS, SEASONAL_PLANS, TOPICAL_PLANS, type CuratedPlan } from './curated';
import { bookRange, chaptersOf, daysForPace, splitEvenly, zipDays, type ChapterUnit, type Pace } from './generate';

/**
 * The reading plan library. Most plans are generated from rules (whole
 * Bible, testaments, every book, sections); topical, seasonal and character
 * plans are hand-picked in curated.ts. A user's own plans come from the
 * custom builder.
 */

export type PlanCategory =
  | 'Whole Bible'
  | 'Testaments'
  | 'Books'
  | 'Sections'
  | 'Psalms & Proverbs'
  | 'Topical'
  | 'Seasonal'
  | 'Characters'
  | 'Custom';

export const PLAN_CATEGORIES: PlanCategory[] = [
  'Whole Bible',
  'Testaments',
  'Sections',
  'Psalms & Proverbs',
  'Topical',
  'Seasonal',
  'Characters',
  'Books',
];

export type Plan = {
  id: string;
  title: string;
  description: string;
  category: PlanCategory;
  icon: IconName;
  tone: 'gold' | 'sage' | 'rose' | 'sky' | 'navy';
  topics: string[];
  /** Plans that can be read faster or slower (book and section plans). */
  paceable?: boolean;
  /** Number of days at the given pace. */
  days: (pace?: Pace) => number;
  /** Readings for every day at the given pace. */
  schedule: (pace?: Pace) => Reference[][];
};

/** Saved with a started plan so its schedule can be rebuilt. */
export type PlanOptions = { pace?: Pace; books?: number[]; days?: number; title?: string };

const cache = new Map<string, Reference[][]>();
function memo(key: string, build: () => Reference[][]) {
  let v = cache.get(key);
  if (!v) {
    v = build();
    cache.set(key, v);
  }
  return v;
}

function fixed(id: string, build: () => Reference[][], days: number): Pick<Plan, 'days' | 'schedule'> {
  return { days: () => days, schedule: () => memo(id, build) };
}

function paced(id: string, units: () => ChapterUnit[], chapters: number): Pick<Plan, 'days' | 'schedule' | 'paceable'> {
  return {
    paceable: true,
    days: (pace = 'normal') => daysForPace(chapters, pace),
    schedule: (pace = 'normal') => memo(`${id}:${pace}`, () => splitEvenly(units(), daysForPace(chapters, pace))),
  };
}

const ALL = bookRange(1, 66);
const OT = bookRange(1, 39);
const NT = bookRange(40, 66);

/** An approximate chronological order (scholars differ on some placements). */
const CHRONOLOGICAL: [number, number, number][] = [
  [1, 1, 11], [18, 1, 42], [1, 12, 50], [2, 1, 40], [3, 1, 27], [4, 1, 36], [5, 1, 34], [6, 1, 24], [7, 1, 21], [8, 1, 4],
  [9, 1, 31], [10, 1, 24], [13, 1, 29], [19, 1, 150], [11, 1, 11], [20, 1, 31], [21, 1, 12], [22, 1, 8], [11, 12, 22],
  [12, 1, 14], [30, 1, 9], [32, 1, 4], [28, 1, 14], [12, 15, 17], [23, 1, 66], [33, 1, 7], [12, 18, 25], [34, 1, 3],
  [36, 1, 3], [35, 1, 3], [29, 1, 3], [24, 1, 52], [25, 1, 5], [31, 1, 1], [14, 1, 36], [26, 1, 48], [27, 1, 12],
  [15, 1, 6], [37, 1, 2], [38, 1, 14], [17, 1, 10], [15, 7, 10], [16, 1, 13], [39, 1, 4],
  [40, 1, 28], [41, 1, 16], [42, 1, 24], [43, 1, 21], [44, 1, 12], [59, 1, 5], [44, 13, 14], [48, 1, 6], [44, 15, 18],
  [52, 1, 5], [53, 1, 3], [44, 19, 19], [46, 1, 16], [47, 1, 13], [45, 1, 16], [44, 20, 28], [49, 1, 6], [50, 1, 4],
  [51, 1, 4], [57, 1, 1], [54, 1, 6], [56, 1, 3], [60, 1, 5], [55, 1, 4], [61, 1, 3], [58, 1, 13], [65, 1, 1],
  [62, 1, 5], [63, 1, 1], [64, 1, 1], [66, 1, 22],
];

function chronologicalUnits(): ChapterUnit[] {
  return CHRONOLOGICAL.flatMap(([book, from, to]) =>
    BOOKS[book - 1].verses.slice(from - 1, to).map((verses, i) => ({ book, chapter: from + i, verses })),
  );
}

/** For validation: every chapter in the chronological plan as "book.chapter". */
export function getChronologicalChapters() {
  return chronologicalUnits().map((u) => `${u.book}.${u.chapter}`);
}

function curatedSchedule(plan: CuratedPlan) {
  return plan.days.map((day) => day.split(';').map((s) => ref(s.trim())));
}

function curated(plan: CuratedPlan, category: PlanCategory, tone: Plan['tone']): Plan {
  return {
    id: plan.id,
    title: plan.title,
    description: plan.description,
    category,
    icon: plan.icon,
    tone,
    topics: plan.topics ?? [],
    ...fixed(plan.id, () => curatedSchedule(plan), plan.days.length),
  };
}

function chaptersIn(books: number[]) {
  return books.reduce((sum, b) => sum + BOOKS[b - 1].verses.length, 0);
}

const SECTIONS: { id: string; title: string; description: string; books: number[]; icon: IconName }[] = [
  { id: 'section-gospels', title: 'The Gospels', description: 'Matthew, Mark, Luke and John: the life of Jesus four ways.', books: bookRange(40, 43), icon: 'cross' },
  { id: 'section-pentateuch', title: 'The Pentateuch', description: 'Genesis to Deuteronomy: creation, covenant and the law.', books: bookRange(1, 5), icon: 'scroll' },
  { id: 'section-history', title: 'History Books', description: 'Joshua to Esther: Israel in the land, in exile, and home again.', books: bookRange(6, 17), icon: 'map' },
  { id: 'section-wisdom', title: 'Wisdom Books', description: 'Job, Psalms, Proverbs, Ecclesiastes and Song of Solomon.', books: bookRange(18, 22), icon: 'lightbulb' },
  { id: 'section-major-prophets', title: 'Major Prophets', description: 'Isaiah, Jeremiah, Lamentations, Ezekiel and Daniel.', books: bookRange(23, 27), icon: 'flame' },
  { id: 'section-minor-prophets', title: 'Minor Prophets', description: 'Hosea to Malachi: twelve short, powerful books.', books: bookRange(28, 39), icon: 'flame' },
  { id: 'section-paul', title: 'Paul’s Letters', description: 'Romans to Philemon: grace, faith and life in the church.', books: bookRange(45, 57), icon: 'pen' },
  { id: 'section-general-epistles', title: 'General Epistles', description: 'Hebrews to Jude: faith that perseveres.', books: bookRange(58, 65), icon: 'pen' },
];

const bookTone = (genre: string): Plan['tone'] =>
  genre === 'Gospels' ? 'gold' : genre === 'Wisdom' ? 'rose' : genre.includes('Prophet') ? 'navy' : genre.includes('Letters') || genre.includes('Epistles') ? 'sage' : 'sky';

export const PLANS: Plan[] = [
  // Whole Bible
  { id: 'bible-1y', title: 'The Bible in a Year', description: 'Genesis to Revelation in 365 days, about 15 minutes a day.', category: 'Whole Bible', icon: 'openBook', tone: 'gold', topics: ['whole bible', 'year'], ...fixed('bible-1y', () => splitEvenly(chaptersOf(ALL), 365), 365) },
  { id: 'bible-chrono', title: 'Chronological Bible', description: 'Read the story in the order events happened (approximately) over one year.', category: 'Whole Bible', icon: 'clock', tone: 'sky', topics: ['whole bible', 'chronological', 'year'], ...fixed('bible-chrono', () => splitEvenly(chronologicalUnits(), 365), 365) },
  { id: 'bible-otnt', title: 'Old & New Together', description: 'One year with a reading from each Testament every day.', category: 'Whole Bible', icon: 'columns', tone: 'sage', topics: ['whole bible', 'year'], ...fixed('bible-otnt', () => zipDays(splitEvenly(chaptersOf(OT), 365), splitEvenly(chaptersOf(NT), 365)), 365) },
  { id: 'bible-2y', title: 'The Bible in Two Years', description: 'A gentler pace through the whole Bible.', category: 'Whole Bible', icon: 'openBook', tone: 'sage', topics: ['whole bible'], ...fixed('bible-2y', () => splitEvenly(chaptersOf(ALL), 730), 730) },
  { id: 'bible-6m', title: 'The Bible in 6 Months', description: 'An ambitious, rewarding sprint through Scripture.', category: 'Whole Bible', icon: 'flame', tone: 'rose', topics: ['whole bible'], ...fixed('bible-6m', () => splitEvenly(chaptersOf(ALL), 182), 182) },
  { id: 'bible-90d', title: 'The Bible in 90 Days', description: 'An immersive, big-picture read of the whole story.', category: 'Whole Bible', icon: 'flame', tone: 'navy', topics: ['whole bible'], ...fixed('bible-90d', () => splitEvenly(chaptersOf(ALL), 90), 90) },

  // Testaments
  ...[30, 60, 90, 260].map<Plan>((d) => ({
    id: `nt-${d}`,
    title: `New Testament in ${d} Days`,
    description: d === 260 ? 'One chapter a day. Read on weekdays and finish in a year.' : `Read Matthew through Revelation in ${d} days.`,
    category: 'Testaments',
    icon: 'cross',
    tone: d <= 60 ? 'rose' : 'gold',
    topics: ['new testament'],
    ...fixed(`nt-${d}`, () => splitEvenly(chaptersOf(NT), d), d),
  })),
  { id: 'ot-1y', title: 'Old Testament in a Year', description: 'Genesis through Malachi in 365 days.', category: 'Testaments', icon: 'scroll', tone: 'sky', topics: ['old testament', 'year'], ...fixed('ot-1y', () => splitEvenly(chaptersOf(OT), 365), 365) },

  // Psalms & Proverbs
  { id: 'proverbs-31', title: 'Proverbs in 31 Days', description: 'A chapter of wisdom for every day of the month.', category: 'Psalms & Proverbs', icon: 'lightbulb', tone: 'gold', topics: ['proverbs', 'wisdom', 'month'], ...fixed('proverbs-31', () => splitEvenly(chaptersOf([20]), 31), 31) },
  { id: 'psalms-30', title: 'Psalms in 30 Days', description: 'Pray through all 150 Psalms in a month.', category: 'Psalms & Proverbs', icon: 'heart', tone: 'rose', topics: ['psalms', 'worship', 'month'], ...fixed('psalms-30', () => splitEvenly(chaptersOf([19]), 30), 30) },
  { id: 'psalms-150', title: 'A Psalm a Day', description: 'Slowly savor one psalm each day for 150 days.', category: 'Psalms & Proverbs', icon: 'heart', tone: 'sage', topics: ['psalms', 'worship'], ...fixed('psalms-150', () => splitEvenly(chaptersOf([19]), 150), 150) },
  { id: 'psalms-proverbs', title: 'Psalms & Proverbs', description: 'Worship and wisdom: Psalms and a chapter of Proverbs each day for a month.', category: 'Psalms & Proverbs', icon: 'leaf', tone: 'navy', topics: ['psalms', 'proverbs', 'month'], ...fixed('psalms-proverbs', () => zipDays(splitEvenly(chaptersOf([19]), 31), splitEvenly(chaptersOf([20]), 31)), 31) },

  // Sections
  ...SECTIONS.map<Plan>((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    category: 'Sections',
    icon: s.icon,
    tone: 'sky',
    topics: [s.title.toLowerCase()],
    ...paced(s.id, () => chaptersOf(s.books), chaptersIn(s.books)),
  })),

  // Topical, seasonal, characters
  ...TOPICAL_PLANS.map((p) => curated(p, 'Topical', 'sage')),
  ...SEASONAL_PLANS.map((p) => curated(p, 'Seasonal', 'rose')),
  {
    id: 'season-40-luke',
    title: '40 Days with Jesus',
    description: 'Read the Gospel of Luke slowly over forty days, perfect before Easter or any season.',
    category: 'Seasonal',
    icon: 'cross',
    tone: 'gold',
    topics: ['40 days', 'lent', 'easter', 'jesus'],
    ...fixed('season-40-luke', () => splitEvenly(chaptersOf([42]), 40), 40),
  },
  {
    id: 'season-40-wisdom',
    title: '40 Days of Wisdom',
    description: 'Proverbs and James in forty days: practical wisdom for everyday life.',
    category: 'Seasonal',
    icon: 'lightbulb',
    tone: 'navy',
    topics: ['40 days', 'wisdom', 'proverbs', 'james'],
    ...fixed('season-40-wisdom', () => splitEvenly(chaptersOf([20, 59]), 40), 40),
  },
  ...CHARACTER_PLANS.map((p) => curated(p, 'Characters', 'gold')),

  // One plan for every book
  ...BOOKS.map<Plan>((b) => ({
    id: `book-${b.id}`,
    title: b.name,
    description: `Read ${b.name} at about one chapter a day${b.verses.length > 1 ? ` (${b.verses.length} chapters)` : ''}. Choose a faster or slower pace when you start.`,
    category: 'Books',
    icon: b.testament === 'NT' ? 'cross' : 'scroll',
    tone: bookTone(b.genre),
    topics: [b.name.toLowerCase(), b.genre.toLowerCase()],
    ...paced(`book-${b.id}`, () => chaptersOf([b.id]), b.verses.length),
  })),
];

export function getPlan(id: string) {
  return PLANS.find((p) => p.id === id);
}

/** A plan made in the custom builder. */
export function customPlan(id: string, options: PlanOptions): Plan {
  const books = options.books ?? [43];
  const days = options.days ?? 30;
  return {
    id,
    title: options.title || 'My Reading Plan',
    description: `${books.length} book${books.length === 1 ? '' : 's'} in ${days} days.`,
    category: 'Custom',
    icon: 'pen',
    tone: 'navy',
    topics: [],
    days: () => days,
    schedule: () => memo(`${id}:${books.join(',')}:${days}`, () => splitEvenly(chaptersOf(books), days)),
  };
}

/** Resolves any plan id (library or custom) with its saved options. */
export function resolvePlan(id: string, options: PlanOptions = {}): Plan | undefined {
  if (id.startsWith('custom-')) return customPlan(id, options);
  return getPlan(id);
}

export const LENGTH_BUCKETS = [7, 14, 21, 30, 40, 60, 90, 180, 365];

/** Which length chip a plan belongs under (e.g. 25 days → "30"). */
export function lengthBucket(days: number) {
  return LENGTH_BUCKETS.find((b) => days <= b) ?? 730;
}

export type { Pace };
