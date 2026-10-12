import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { View } from 'react-native';

import { Icon } from '@/components/icons/icon';
import { Appear, AppText, Card, IconBadge, PressableScale } from '@/components/ui';
import { activeFast } from '@/db/fasting';
import { guidedSessionCount } from '@/db/gratitude';
import { useLive } from '@/db/live';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';

export function PraySection() {
  const { colors, shadow } = useTheme();
  const sessions = useLive(guidedSessionCount, ['guided_sessions']);
  const fast = useLive(activeFast, ['fasts']);

  return (
    <View style={{ gap: space.lg }}>
      <Appear index={0}>
        <PressableScale onPress={() => router.push('/guided-prayer')} accessibilityLabel="Start guided prayer">
          <View style={[{ borderRadius: radius.xl, borderCurve: 'continuous' }, shadow.medium]}>
            <LinearGradient
              colors={colors.gradientVerse}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: radius.xl, borderCurve: 'continuous', padding: space.xl, gap: space.md, overflow: 'hidden' }}>
              <View style={{ position: 'absolute', right: -16, bottom: -16, opacity: 0.1 }}>
                <Icon name="dove" size={150} color="#F5EAD0" strokeWidth={1.1} />
              </View>
              <AppText variant="overline" style={{ color: '#E2BE6A' }}>
                Guided prayer
              </AppText>
              <AppText variant="title1" style={{ color: colors.textOnDark }}>
                Pray with ACTS
              </AppText>
              <View style={{ flexDirection: 'row', gap: space.sm }}>
                {['Adoration', 'Confession', 'Thanksgiving', 'Supplication'].map((w) => (
                  <View key={w} style={{ alignItems: 'center', gap: 2 }}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: 'rgba(226, 190, 106, 0.16)',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <AppText variant="headline" style={{ color: '#E2BE6A' }}>
                        {w[0]}
                      </AppText>
                    </View>
                  </View>
                ))}
              </View>
              <AppText variant="subhead" style={{ color: 'rgba(251, 246, 234, 0.75)' }}>
                A gentle, step-by-step time with God, with an optional timer.
                {sessions > 0 ? ` You've prayed this way ${sessions} time${sessions === 1 ? '' : 's'}.` : ''}
              </AppText>
            </LinearGradient>
          </View>
        </PressableScale>
      </Appear>

      <Appear index={1}>
        <Card onPress={() => router.push('/prayer/fasting')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            <IconBadge name="droplet" tone="sky" />
            <View style={{ flex: 1 }}>
              <AppText variant="headline">{fast ? 'Fast in progress' : 'Fasting'}</AppText>
              <AppText variant="subhead" color="textSecondary">
                {fast ? fast.title : 'Set aside something to seek God more fully'}
              </AppText>
            </View>
            <Icon name="chevronRight" size={18} color={colors.textTertiary} />
          </View>
        </Card>
      </Appear>

      <Appear index={2}>
        <Card onPress={() => router.push('/prayer-editor')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            <IconBadge name="pen" tone="sage" />
            <View style={{ flex: 1 }}>
              <AppText variant="headline">Write a Prayer</AppText>
              <AppText variant="subhead" color="textSecondary">
                Pour out your heart in your journal
              </AppText>
            </View>
            <Icon name="chevronRight" size={18} color={colors.textTertiary} />
          </View>
        </Card>
      </Appear>
    </View>
  );
}
