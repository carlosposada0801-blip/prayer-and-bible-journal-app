import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { haptics } from '@/lib/haptics';
import { useTheme } from '@/theme/use-theme';
import { radius, springs } from '@/theme/tokens';

import { AppText } from './app-text';

type Option<T extends string> = { value: T; label: string };

type SegmentedControlProps<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** iOS-style segmented control with a sliding, springy thumb. */
export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  const { colors, shadow, isDark } = useTheme();
  const [width, setWidth] = useState(0);
  const segment = width / options.length;
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const x = useSharedValue(0);

  useEffect(() => {
    x.value = withSpring(index * segment, springs.press);
  }, [index, segment, x]);

  const thumbStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width - 4)}
      accessibilityRole="tablist"
      style={{ flexDirection: 'row', backgroundColor: colors.surfaceMuted, borderRadius: radius.sm, padding: 2 }}>
      {width > 0 && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 2,
              bottom: 2,
              left: 2,
              width: segment,
              borderRadius: radius.sm - 2,
              backgroundColor: isDark ? colors.surfaceRaised : colors.surface,
            },
            shadow.low,
            thumbStyle,
          ]}
        />
      )}
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => {
              if (!selected) {
                haptics.select();
                onChange(option.value);
              }
            }}
            style={{ flex: 1, paddingVertical: 8, alignItems: 'center' }}>
            <AppText variant="subhead" weight={selected ? '600' : '500'} color={selected ? 'text' : 'textSecondary'}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
