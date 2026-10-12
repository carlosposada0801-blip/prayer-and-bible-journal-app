import type { IconName } from '@/components/icons/paths';

/**
 * Badges. Each one has an id (stored when unlocked), a look, and the text
 * shown on the Achievements screen. Unlock rules live in src/db/achievements.ts.
 */
export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  tone: 'gold' | 'sage' | 'rose' | 'sky' | 'navy';
  category: 'Consistency' | 'Prayer' | 'Bible' | 'Memorize' | 'Growth';
};

export const ACHIEVEMENTS: Achievement[] = [
  // Consistency
  { id: 'streak-3', title: 'Three in a Row', description: 'Spent time with God 3 days in a row.', icon: 'flame', tone: 'gold', category: 'Consistency' },
  { id: 'streak-7', title: 'A Full Week', description: 'A 7-day streak. Rest is holy too.', icon: 'flame', tone: 'gold', category: 'Consistency' },
  { id: 'streak-30', title: 'Thirty Days', description: 'A 30-day streak of showing up.', icon: 'flame', tone: 'rose', category: 'Consistency' },
  { id: 'streak-100', title: 'Faithful', description: '100 days in a row. Well done!', icon: 'crown', tone: 'gold', category: 'Consistency' },

  // Prayer
  { id: 'first-prayer', title: 'First Prayer', description: 'Wrote your first prayer.', icon: 'dove', tone: 'sage', category: 'Prayer' },
  { id: 'prayer-answered-1', title: 'He Answers', description: 'Marked your first answered prayer.', icon: 'sparkle', tone: 'sage', category: 'Prayer' },
  { id: 'prayer-answered-10', title: 'Remember His Faithfulness', description: '10 answered prayers recorded.', icon: 'sparkle', tone: 'gold', category: 'Prayer' },
  { id: 'prayer-streak-30', title: '30-Day Prayer Streak', description: 'Prayed 30 days in a row.', icon: 'hands', tone: 'sky', category: 'Prayer' },
  { id: 'guided-first', title: 'Be Still', description: 'Completed a guided ACTS prayer.', icon: 'hands', tone: 'navy', category: 'Prayer' },
  { id: 'gratitude-7', title: 'Grateful Heart', description: 'Logged gratitude on 7 different days.', icon: 'gift', tone: 'rose', category: 'Prayer' },
  { id: 'prayer-list-5', title: 'Standing in the Gap', description: 'Praying for 5 people.', icon: 'people', tone: 'sky', category: 'Prayer' },
  { id: 'fast-complete', title: 'Completed a Fast', description: 'Finished a fast you set out to keep.', icon: 'droplet', tone: 'sky', category: 'Prayer' },

  // Bible
  { id: 'first-chapter', title: 'Take Up and Read', description: 'Read your first chapter.', icon: 'openBook', tone: 'sky', category: 'Bible' },
  { id: 'finished-book', title: 'Finished a Book', description: 'Read every chapter of a book.', icon: 'bookClosed', tone: 'navy', category: 'Bible' },
  { id: 'finished-john', title: 'Finished John', description: 'Read all 21 chapters of John.', icon: 'bookClosed', tone: 'gold', category: 'Bible' },
  { id: 'finished-psalms', title: 'Songs of the Heart', description: 'Read all 150 Psalms.', icon: 'bookClosed', tone: 'rose', category: 'Bible' },
  { id: 'finished-nt', title: 'New Testament', description: 'Read the entire New Testament.', icon: 'crown', tone: 'sky', category: 'Bible' },
  { id: 'finished-bible', title: 'Genesis to Revelation', description: 'Read the whole Bible!', icon: 'crown', tone: 'gold', category: 'Bible' },
  { id: 'first-highlight', title: 'Treasure Hunter', description: 'Highlighted your first verse.', icon: 'palette', tone: 'gold', category: 'Bible' },
  { id: 'plan-complete', title: 'Plan Finished', description: 'Completed a reading plan.', icon: 'calendar', tone: 'sage', category: 'Bible' },

  // Memorize
  { id: 'memorize-1', title: 'Hidden in My Heart', description: 'Memorized your first verse.', icon: 'heart', tone: 'rose', category: 'Memorize' },
  { id: 'memorize-10', title: 'Ten Verses', description: 'Memorized 10 verses.', icon: 'heart', tone: 'gold', category: 'Memorize' },
  { id: 'memorize-psalm-23', title: 'Memorized Psalm 23', description: 'The Lord is my shepherd: by heart.', icon: 'star', tone: 'sage', category: 'Memorize' },
  { id: 'trivia-perfect', title: 'Perfect Round', description: 'Got every trivia question right.', icon: 'trophy', tone: 'gold', category: 'Memorize' },
  { id: 'trivia-100', title: 'Bible Scholar', description: 'Answered 100 trivia questions.', icon: 'lightbulb', tone: 'sky', category: 'Memorize' },

  // Growth
  { id: 'study-first', title: 'First Lesson', description: 'Completed your first Bible study.', icon: 'lightbulb', tone: 'sky', category: 'Growth' },
  { id: 'study-series', title: 'Series Complete', description: 'Finished a full study series.', icon: 'trophy', tone: 'gold', category: 'Growth' },
];

export function achievementInfo(id: string) {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
