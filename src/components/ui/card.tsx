import { View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';

import { PressableScale } from './pressable-scale';

type CardProps = ViewProps & {
  /** Makes the card tappable with the spring + haptic press effect. */
  onPress?: () => void;
  elevated?: 'low' | 'medium';
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

/** Rounded, softly shadowed surface used for almost every block of content. */
export function Card({
  onPress,
  elevated = 'low',
  padded = true,
  style,
  children,
  accessibilityLabel,
  ...rest
}: CardProps) {
  const { colors, shadow } = useTheme();
  const cardStyle: StyleProp<ViewStyle> = [
    {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      padding: padded ? space.lg : 0,
    },
    shadow[elevated],
    style,
  ];

  if (onPress) {
    return (
      <PressableScale onPress={onPress} style={cardStyle} accessibilityLabel={accessibilityLabel}>
        {children}
      </PressableScale>
    );
  }
  return (
    <View style={cardStyle} {...rest}>
      {children}
    </View>
  );
}
