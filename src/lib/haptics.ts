import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { getPreferences } from '@/store/preferences';

/**
 * Haptic feedback that respects the "Haptics" switch in Settings.
 *
 * haptics.tap()      – light tap on buttons and cards
 * haptics.select()   – changing a picker or segmented control
 * haptics.success()  – correct answer, prayer marked answered
 * haptics.warning()  – gentle nudge (e.g. lost a heart)
 * haptics.error()    – wrong answer
 */

function enabled() {
  return Platform.OS !== 'web' && getPreferences().haptics;
}

export const haptics = {
  tap: () => enabled() && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => enabled() && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  select: () => enabled() && Haptics.selectionAsync(),
  success: () => enabled() && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () => enabled() && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  error: () => enabled() && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
};
