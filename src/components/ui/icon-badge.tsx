import { View } from 'react-native';

import { Icon, type IconName } from '@/components/icons/icon';
import { useTheme } from '@/theme/use-theme';

type Tone = 'gold' | 'sage' | 'rose' | 'sky' | 'navy';

/** A line icon inside a soft tinted circle – used on cards and list rows. */
export function IconBadge({ name, tone = 'gold', size = 44 }: { name: IconName; tone?: Tone; size?: number }) {
  const { colors, isDark } = useTheme();
  const tones: Record<Tone, { bg: string; fg: string }> = {
    gold: { bg: colors.goldSoft, fg: colors.gold },
    sage: { bg: colors.sageSoft, fg: colors.sage },
    rose: { bg: colors.roseSoft, fg: colors.rose },
    sky: { bg: colors.skySoft, fg: colors.sky },
    navy: { bg: isDark ? colors.skySoft : colors.surfaceMuted, fg: isDark ? colors.sky : colors.primary },
  };
  const { bg, fg } = tones[tone];
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Icon name={name} size={size * 0.52} color={fg} />
    </View>
  );
}
