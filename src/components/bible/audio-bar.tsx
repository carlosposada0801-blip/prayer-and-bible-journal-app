import { Pressable, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { Icon } from '@/components/icons/icon';
import { AppText } from '@/components/ui';
import { formatReference } from '@/data/bible/references';
import { audio, useAudio } from '@/lib/bible/audio';
import { haptics } from '@/lib/haptics';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';

const RATES = [0.75, 1, 1.25, 1.5];

/** Mini player for the audio Bible: play/pause, speed and close. */
export function AudioBar() {
  const { colors, shadow, isDark } = useTheme();
  const state = useAudio();
  if (state.status === 'idle') return null;

  const playing = state.status === 'playing' || state.status === 'loading';
  const nextRate = RATES[(RATES.indexOf(state.rate) + 1) % RATES.length] ?? 1;

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(18)}
      exiting={FadeOutDown.duration(180)}
      style={[
        {
          position: 'absolute',
          left: space.md,
          right: space.md,
          bottom: 96,
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.md,
          backgroundColor: isDark ? colors.surfaceRaised : colors.surface,
          borderRadius: radius.pill,
          paddingLeft: space.sm,
          paddingRight: space.md,
          paddingVertical: space.sm,
        },
        shadow.medium,
      ]}>
      <Pressable
        onPress={() => {
          haptics.tap();
          audio.toggle();
        }}
        accessibilityLabel={playing ? 'Pause' : 'Play'}
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Icon name={playing ? 'pause' : 'play'} size={20} color={colors.onPrimary} strokeWidth={2.4} />
      </Pressable>
      <View style={{ flex: 1 }}>
        <AppText variant="headline" numberOfLines={1}>
          {formatReference({ book: state.book, chapter: state.chapter })}
        </AppText>
        <AppText variant="footnote" color="textSecondary">
          {state.status === 'loading' ? 'Preparing…' : `Verse ${state.verse}`}
        </AppText>
      </View>
      <Pressable
        onPress={() => {
          haptics.select();
          audio.setRate(nextRate);
        }}
        accessibilityLabel={`Speed ${state.rate} times. Tap to change.`}
        hitSlop={8}
        style={{ paddingHorizontal: space.sm, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted }}>
        <AppText variant="subhead" weight="700">
          {state.rate}×
        </AppText>
      </Pressable>
      <Pressable onPress={() => audio.stop()} accessibilityLabel="Stop audio" hitSlop={10}>
        <Icon name="close" size={20} color={colors.textSecondary} />
      </Pressable>
    </Animated.View>
  );
}
