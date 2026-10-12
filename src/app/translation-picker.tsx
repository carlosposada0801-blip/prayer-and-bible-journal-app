import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Icon } from '@/components/icons/icon';
import { AppText } from '@/components/ui';
import { API_TRANSLATIONS, BUNDLED_TRANSLATIONS, type Translation, type TranslationId } from '@/data/bible/translations';
import { availableLicensed } from '@/lib/bible/licensed';
import { haptics } from '@/lib/haptics';
import { setPreference, usePreferences } from '@/store/preferences';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';

/** Sheet: choose the reading translation (or the comparison translation). */
export default function TranslationPicker() {
  const { target } = useLocalSearchParams<{ target?: 'compare' }>();
  const prefs = usePreferences();
  const { colors } = useTheme();
  const current = target === 'compare' ? prefs.compareTranslation : prefs.translation;
  const [apiAvailable, setApiAvailable] = useState<TranslationId[]>([]);

  useEffect(() => {
    availableLicensed()
      .then(setApiAvailable)
      .catch(() => setApiAvailable([]));
  }, []);

  const choose = (id: TranslationId) => {
    haptics.select();
    setPreference(target === 'compare' ? 'compareTranslation' : 'translation', id);
    router.back();
  };

  const row = (t: Translation, i: number, enabled = true) => (
    <Pressable
      key={t.id}
      disabled={!enabled}
      onPress={() => choose(t.id)}
      accessibilityState={{ selected: t.id === current, disabled: !enabled }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
        padding: space.lg,
        borderTopWidth: i === 0 ? 0 : 1,
        borderTopColor: colors.separator,
        backgroundColor: pressed ? colors.surfaceMuted : 'transparent',
        opacity: enabled ? 1 : 0.45,
      })}>
      <View style={{ width: 52 }}>
        <AppText variant="headline" color="gold">
          {t.id === 'DARBY' ? 'Darby' : t.id}
        </AppText>
      </View>
      <View style={{ flex: 1 }}>
        <AppText variant="body">{t.name}</AppText>
        <AppText variant="footnote" color="textSecondary">
          {t.year} · {t.description}
        </AppText>
      </View>
      {t.id === current && <Icon name="check" size={20} color={colors.gold} strokeWidth={2.4} />}
    </Pressable>
  );

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ padding: space.lg, gap: space.lg }}>
      <AppText variant="title2">{target === 'compare' ? 'Compare With' : 'Translation'}</AppText>
      <AppText variant="overline" color="textTertiary">
        Included · works offline
      </AppText>
      <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, borderCurve: 'continuous', overflow: 'hidden' }}>
        {BUNDLED_TRANSLATIONS.map((t, i) => row(t, i))}
      </View>

      <AppText variant="overline" color="textTertiary">
        More translations · saved as you read
      </AppText>
      <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, borderCurve: 'continuous', overflow: 'hidden' }}>
        {API_TRANSLATIONS.map((t, i) => row(t, i, apiAvailable.includes(t.id)))}
      </View>
      <AppText variant="footnote" color="textTertiary">
        Chapters you open are saved on your phone, so they work offline afterward. Greyed-out translations need a free key. See
        docs/LICENSED_TRANSLATIONS.md.
      </AppText>
    </ScrollView>
  );
}
