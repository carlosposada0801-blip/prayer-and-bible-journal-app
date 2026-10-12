import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/icons/icon';
import { AppText, Screen } from '@/components/ui';
import { achievementInfo } from '@/data/achievements';
import { unlockedIds } from '@/db/achievements';
import { useLive } from '@/db/live';
import { haptics } from '@/lib/haptics';
import { setPreference, usePreferences } from '@/store/preferences';
import { palette } from '@/theme/colors';
import { THEMES } from '@/theme/themes';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';

/** Unlockable color themes earned through consistency. */
export default function ThemesScreen() {
  const prefs = usePreferences();
  const { scheme, colors } = useTheme();
  const unlocked = useLive(unlockedIds, ['achievements']);

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Themes' }} />
      <AppText variant="callout" color="textSecondary">
        Earn new themes by showing up. Each one is unlocked by a badge.
      </AppText>
      {THEMES.map((t) => {
        const available = !t.unlockedBy || unlocked.has(t.unlockedBy);
        const selected = prefs.themeId === t.id;
        const look = { ...palette[scheme], ...t[scheme] };
        return (
          <Pressable
            key={t.id}
            disabled={!available}
            onPress={() => {
              haptics.success();
              setPreference('themeId', t.id);
            }}
            accessibilityState={{ selected, disabled: !available }}
            style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.98 : 1 }] })}>
            <View
              style={{
                borderRadius: radius.xl,
                borderCurve: 'continuous',
                borderWidth: 3,
                borderColor: selected ? look.gold : 'transparent',
                overflow: 'hidden',
                opacity: available ? 1 : 0.6,
              }}>
              <LinearGradient colors={look.gradientVerse} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: space.lg, gap: space.sm }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                  <AppText variant="title3" style={{ color: '#FBF6EA', flex: 1 }}>
                    {t.name}
                  </AppText>
                  {selected ? (
                    <View style={{ backgroundColor: look.gold, borderRadius: 14, padding: 4 }}>
                      <Icon name="check" size={16} color="#FFFFFF" strokeWidth={2.8} />
                    </View>
                  ) : !available ? (
                    <Icon name="lock" size={20} color="#FBF6EA" />
                  ) : null}
                </View>
                <AppText variant="subhead" style={{ color: 'rgba(251, 246, 234, 0.8)' }}>
                  {t.description}
                </AppText>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: space.xs }}>
                  {[look.gold, look.primary, look.background, look.surface].map((c, i) => (
                    <View key={i} style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: c, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }} />
                  ))}
                </View>
              </LinearGradient>
            </View>
            {!available && t.unlockedBy && (
              <AppText variant="footnote" color="textTertiary" style={{ marginTop: 6, paddingHorizontal: space.sm }}>
                Unlock with the “{achievementInfo(t.unlockedBy)?.title}” badge: {achievementInfo(t.unlockedBy)?.description}
              </AppText>
            )}
          </Pressable>
        );
      })}
      <View style={{ height: space.sm, backgroundColor: colors.background }} />
    </Screen>
  );
}
