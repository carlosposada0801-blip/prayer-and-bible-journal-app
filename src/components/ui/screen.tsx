import type { ReactNode } from 'react';
import { ScrollView, type ScrollViewProps } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useTheme } from '@/theme/use-theme';
import { space } from '@/theme/tokens';

type ScreenProps = ScrollViewProps & { children: ReactNode };

/**
 * Scrollable page that sits under the native large-title header.
 * `contentInsetAdjustmentBehavior="automatic"` lets iOS collapse the
 * large title smoothly as you scroll, exactly like Apple's own apps.
 */
export function Screen({ children, contentContainerStyle, ...rest }: ScreenProps) {
  const { colors } = useTheme();
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        { paddingHorizontal: space.lg, paddingTop: space.sm, paddingBottom: 120, gap: space.lg },
        contentContainerStyle,
      ]}
      {...rest}>
      {children}
    </ScrollView>
  );
}

/** Fades and lifts its content in. Pass a growing `index` for a stagger. */
export function Appear({ index = 0, children }: { index?: number; children: ReactNode }) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 70).duration(450).springify().damping(18)}>
      {children}
    </Animated.View>
  );
}
