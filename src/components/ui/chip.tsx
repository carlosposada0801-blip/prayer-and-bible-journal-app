import { ScrollView, View } from 'react-native';

import { Icon, type IconName } from '@/components/icons/icon';
import { haptics } from '@/lib/haptics';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';

import { AppText } from './app-text';
import { PressableScale } from './pressable-scale';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
  small?: boolean;
};

/** Rounded pill for tags and filters. */
export function Chip({ label, selected, onPress, icon, small }: ChipProps) {
  const { colors } = useTheme();
  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.xs,
        paddingHorizontal: small ? 10 : 14,
        paddingVertical: small ? 4 : 8,
        borderRadius: radius.pill,
        backgroundColor: selected ? colors.primary : colors.surfaceMuted,
      }}>
      {icon && <Icon name={icon} size={small ? 12 : 15} color={selected ? colors.onPrimary : colors.textSecondary} />}
      <AppText
        variant={small ? 'caption' : 'subhead'}
        weight={selected ? '600' : '500'}
        style={{ color: selected ? colors.onPrimary : colors.textSecondary }}>
        {label}
      </AppText>
    </View>
  );
  if (!onPress) return content;
  return (
    <PressableScale
      haptic={false}
      scaleTo={0.94}
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={() => {
        haptics.select();
        onPress();
      }}>
      {content}
    </PressableScale>
  );
}

/** Horizontally scrolling row of chips that bleeds to the screen edges. */
export function ChipRow({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginHorizontal: -space.lg }}
      contentContainerStyle={{ paddingHorizontal: space.lg, gap: space.sm }}>
      {children}
    </ScrollView>
  );
}
