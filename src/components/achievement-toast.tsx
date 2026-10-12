import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeOutUp, SlideInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Confetti, IconBadge } from '@/components/ui';
import { dismissAchievement, useAchievementQueue } from '@/db/achievements';
import { useIsQuiet } from '@/lib/focus';
import { haptics } from '@/lib/haptics';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';

/** Celebrates newly unlocked badges with a banner and a burst of confetti. */
export function AchievementToast() {
  const queue = useAchievementQueue();
  const quiet = useIsQuiet();
  // Celebrations wait until a quiet focus session (prayer, study, reading) ends.
  const current = quiet ? undefined : queue[0];
  const insets = useSafeAreaInsets();
  const { colors, shadow, isDark } = useTheme();
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    if (!current) return;
    haptics.success();
    setBurst((b) => b + 1);
    const t = setTimeout(dismissAchievement, 3600);
    return () => clearTimeout(t);
  }, [current]);

  return (
    <>
      <Confetti burstKey={burst} count={28} />
      {current && (
        <Animated.View
          key={current.id}
          entering={SlideInUp.springify().damping(16)}
          exiting={FadeOutUp.duration(250)}
          style={{ position: 'absolute', top: insets.top + space.sm, left: space.md, right: space.md }}>
          <Pressable
            onPress={() => {
              dismissAchievement();
              router.push('/profile/achievements');
            }}
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
                gap: space.md,
                padding: space.md,
                borderRadius: radius.xl,
                backgroundColor: isDark ? colors.surfaceRaised : colors.surface,
              },
              shadow.medium,
            ]}>
            <IconBadge name={current.icon} tone={current.tone} size={48} />
            <View style={{ flex: 1 }}>
              <AppText variant="overline" color="gold">
                Badge unlocked
              </AppText>
              <AppText variant="headline">{current.title}</AppText>
              <AppText variant="footnote" color="textSecondary" numberOfLines={1}>
                {current.description}
              </AppText>
            </View>
          </Pressable>
        </Animated.View>
      )}
    </>
  );
}
