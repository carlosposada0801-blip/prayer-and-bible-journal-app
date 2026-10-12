import { ActivityIndicator, View } from 'react-native';

import { Icon, type IconName } from '@/components/icons/icon';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';

import { AppText } from './app-text';
import { PressableScale } from './pressable-scale';

type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
};

/** Pill-shaped button. `primary` is filled, `secondary` is a soft fill, `ghost` is text only. */
export function Button({ title, onPress, variant = 'primary', icon, loading, disabled }: ButtonProps) {
  const { colors } = useTheme();
  const bg =
    variant === 'primary' ? colors.primary : variant === 'secondary' ? colors.surfaceMuted : 'transparent';
  const fg = variant === 'primary' ? colors.onPrimary : colors.primary;

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityLabel={title}
      style={{
        backgroundColor: bg,
        borderRadius: radius.pill,
        paddingVertical: 15,
        paddingHorizontal: space.xl,
        opacity: disabled ? 0.45 : 1,
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm }}>
        {loading ? (
          <ActivityIndicator color={fg} />
        ) : (
          <>
            {icon && <Icon name={icon} size={20} color={fg} />}
            <AppText variant="headline" style={{ color: fg }}>
              {title}
            </AppText>
          </>
        )}
      </View>
    </PressableScale>
  );
}
