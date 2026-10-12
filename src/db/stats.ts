import { currentStreak, longestStreak, totalActiveDays } from './activity';
import { totalChaptersRead } from './bible-notes';
import { completedFastCount } from './fasting';
import { levelFor, memorizedCount, totalXp } from './memorize';
import { prayerCounts } from './prayers';
import { completedLessonCount } from './study';
import { triviaStats } from './trivia';
import { first } from './database';

/** Everything the Profile tab summarizes. */
export function getStats() {
  const xp = totalXp();
  const prayers = prayerCounts();
  return {
    currentStreak: currentStreak(),
    longestStreak: Math.max(longestStreak(), currentStreak()),
    daysActive: totalActiveDays(),
    versesMemorized: memorizedCount(),
    lessonsCompleted: completedLessonCount(),
    prayersWritten: prayers.total,
    prayersAnswered: prayers.answered,
    chaptersRead: totalChaptersRead(),
    plansCompleted: first<{ n: number }>('SELECT COUNT(*) AS n FROM plans WHERE completed_at IS NOT NULL')?.n ?? 0,
    fastsCompleted: completedFastCount(),
    triviaCorrect: triviaStats().correct,
    xp,
    level: levelFor(xp),
  };
}
