import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

import { formatReference } from '@/data/bible/references';
import { verseOfTheDay } from '@/data/verses-of-the-day';
import { currentStreak, didToday, lastSevenDays } from '@/db/activity';
import { addDays } from '@/lib/dates';
import { getPreferences } from '@/store/preferences';

import { getPassageText } from './bible/engine';

/**
 * Keeps the Home Screen / Lock Screen widgets up to date.
 *
 * Widgets need a development build (they are not in Expo Go), so the widget
 * module is loaded lazily and everything here quietly does nothing in Expo Go.
 */

type Widgets = {
  verse: typeof import('@/widgets/verse-widget').default;
  streak: typeof import('@/widgets/streak-widget').default;
};

let cached: Widgets | null | undefined;

function widgets(): Widgets | null {
  if (cached !== undefined) return cached;
  if (Platform.OS !== 'ios' || Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    cached = null;
    return cached;
  }
  try {
    cached = {
      verse: require('@/widgets/verse-widget').default,
      streak: require('@/widgets/streak-widget').default,
    };
  } catch {
    cached = null;
  }
  return cached;
}

export async function updateWidgets() {
  const w = widgets();
  if (!w) return;
  try {
    const { translation } = getPreferences();
    // A week of verses, each switching at midnight.
    const entries = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(new Date(), d);
      if (d > 0) date.setHours(0, 0, 0, 0);
      const ref = verseOfTheDay(date);
      entries.push({ date, props: { text: await getPassageText(translation, ref), reference: formatReference(ref), translation } });
    }
    w.verse.updateTimeline(entries);
    w.streak.updateSnapshot({ streak: currentStreak(), doneToday: didToday(), week: lastSevenDays().map((d) => d.active) });
  } catch {
    // Widgets are a bonus; never let them break the app.
  }
}
