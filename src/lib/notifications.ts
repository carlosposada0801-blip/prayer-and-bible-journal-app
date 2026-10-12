import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { formatReference } from '@/data/bible/references';
import { verseOfTheDay } from '@/data/verses-of-the-day';
import { listPeople } from '@/db/people';
import { activePlans } from '@/db/plans';
import { todaysLesson } from '@/db/study';
import { addDays } from '@/lib/dates';
import { getPreferences, type ReminderKind } from '@/store/preferences';

import { isQuiet } from './focus';

/**
 * Daily reminders (study, prayer, practice, person to pray for, plan
 * reading). Local notifications work in Expo Go on iPhone.
 *
 * We schedule the next 7 days individually so each reminder can carry
 * fresh content (today's verse, today's person). Rescheduling happens every
 * time the app opens, so as long as you open Abide once a week, reminders
 * stay up to date.
 */

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => {
      const quiet = isQuiet();
      return { shouldShowBanner: !quiet, shouldShowList: true, shouldPlaySound: !quiet, shouldSetBadge: false };
    },
  });
}

export async function requestPermission() {
  if (Platform.OS === 'web') return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowSound: true, allowBadge: false } });
  return asked.granted;
}

const DAYS_AHEAD = 7;

function content(kind: ReminderKind, dayOffset: number): { title: string; body: string } {
  const date = addDays(new Date(), dayOffset);
  switch (kind) {
    case 'study': {
      const lesson = todaysLesson();
      return lesson
        ? { title: 'Today’s study is ready', body: `${lesson.lesson.title} · ${lesson.series.title}. Five quiet minutes with God’s Word.` }
        : { title: 'A moment in the Word', body: `Today’s verse: ${formatReference(verseOfTheDay(date))}` };
    }
    case 'prayer':
      return { title: 'Time to pray', body: 'Take a few minutes to talk with God. He is listening.' };
    case 'practice':
      return { title: 'Hide God’s Word in your heart', body: 'Grace the lamb is ready when you are. A quick practice keeps your verses fresh!' };
    case 'person': {
      const people = listPeople();
      if (people.length === 0) return { title: 'Who can you pray for today?', body: 'Add someone to your prayer list in Abide.' };
      const sorted = [...people].sort((a, b) => (a.last_prayed_at ?? '').localeCompare(b.last_prayed_at ?? ''));
      const person = sorted[dayOffset % sorted.length];
      return { title: `Pray for ${person.name} today`, body: person.notes ? person.notes : 'Lift them up to God by name.' };
    }
    case 'plan': {
      const plan = activePlans()[0];
      return plan
        ? { title: 'Your reading plan', body: `Day ${Math.min(plan.nextDay + dayOffset, plan.totalDays)} of ${plan.plan.title} is waiting.` }
        : { title: 'Read the Bible today', body: 'Pick up where you left off in the reader.' };
    }
  }
}

/** Cancels and re-creates every enabled reminder for the next week. */
export async function rescheduleReminders() {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const { reminders } = getPreferences();
    const enabled = (Object.keys(reminders) as ReminderKind[]).filter((k) => reminders[k].enabled);
    if (enabled.length === 0) return;
    const { granted } = await Notifications.getPermissionsAsync();
    if (!granted) return;
    const now = Date.now();
    for (const kind of enabled) {
      const { hour, minute } = reminders[kind];
      for (let d = 0; d < DAYS_AHEAD; d++) {
        const at = addDays(new Date(), d);
        at.setHours(hour, minute, 0, 0);
        if (at.getTime() <= now) continue;
        await Notifications.scheduleNotificationAsync({
          content: { ...content(kind, d), data: { kind } },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at },
        });
      }
    }
  } catch {
    // Scheduling is best-effort; never break the app over a reminder.
  }
}

/** Where tapping a reminder takes you. */
export function routeForReminder(kind: ReminderKind | undefined) {
  switch (kind) {
    case 'study':
      return '/bible?section=studies';
    case 'prayer':
      return '/prayer';
    case 'practice':
      return '/grow';
    case 'person':
      return '/prayer?section=people';
    case 'plan':
      return '/bible?section=plans';
    default:
      return '/';
  }
}
