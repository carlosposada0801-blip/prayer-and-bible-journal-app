import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

import { Icon } from '@/components/icons/icon';
import { AppText } from '@/components/ui';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';

type VerseCardProps = {
  text: string;
  reference: string;
  translation: string;
  label?: string;
};

/** The deep-navy "Verse of the Day" card with serif Scripture and gold accents. */
export function VerseCard({ text, reference, translation, label = 'Verse of the Day' }: VerseCardProps) {
  const { colors, shadow } = useTheme();
  return (
    <View style={[{ borderRadius: radius.xl, borderCurve: 'continuous' }, shadow.medium]}>
      <LinearGradient
        colors={colors.gradientVerse}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: radius.xl, borderCurve: 'continuous', padding: space.xl, gap: space.lg, overflow: 'hidden' }}>
        {/* A large, faint olive branch watermark */}
        <View style={{ position: 'absolute', right: -24, bottom: -24, opacity: 0.08 }} pointerEvents="none">
          <Icon name="oliveBranch" size={180} color="#F5EAD0" strokeWidth={1.2} />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
          <Icon name="sparkle" size={16} color="#E2BE6A" />
          <AppText variant="overline" style={{ color: '#E2BE6A' }}>
            {label}
          </AppText>
        </View>

        <AppText variant="scripture" style={{ color: colors.textOnDark }} accessibilityRole="text">
          {text}
        </AppText>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
          <View style={{ width: 20, height: 1, backgroundColor: '#E2BE6A' }} />
          <AppText variant="subhead" weight="600" style={{ color: '#E2BE6A' }}>
            {reference}
          </AppText>
          <AppText variant="footnote" style={{ color: 'rgba(251, 246, 234, 0.55)' }}>
            {translation}
          </AppText>
        </View>
      </LinearGradient>
    </View>
  );
}
