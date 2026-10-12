import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { Icon } from '@/components/icons/icon';
import { GratitudeSection } from '@/components/prayer/gratitude-section';
import { JournalSection } from '@/components/prayer/journal-section';
import { PeopleSection } from '@/components/prayer/people-section';
import { PraySection } from '@/components/prayer/pray-section';
import { Screen, SegmentedControl } from '@/components/ui';
import { exportPrayerJournalPdf } from '@/lib/pdf';
import { useTheme } from '@/theme/use-theme';
import { space } from '@/theme/tokens';

type Section = 'journal' | 'pray' | 'people' | 'gratitude';

/** Prayer tab: Journal · Pray · People · Gratitude. */
export default function PrayerScreen() {
  const params = useLocalSearchParams<{ section?: Section }>();
  const [section, setSection] = useState<Section>(params.section ?? 'journal');
  const { colors } = useTheme();

  useEffect(() => {
    if (params.section) setSection(params.section);
  }, [params.section]);

  return (
    <Screen>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: space.lg }}>
              <Pressable
                hitSlop={8}
                accessibilityLabel="Export journal as PDF"
                onPress={() =>
                  exportPrayerJournalPdf().catch(() => Alert.alert('Export failed', 'Please try again.'))
                }>
                <Icon name="share" size={22} color={colors.gold} />
              </Pressable>
              <Pressable hitSlop={8} accessibilityLabel="Write a prayer" onPress={() => router.push('/prayer-editor')}>
                <Icon name="plus" size={24} color={colors.gold} strokeWidth={2.2} />
              </Pressable>
            </View>
          ),
        }}
      />
      <SegmentedControl
        options={[
          { value: 'journal', label: 'Journal' },
          { value: 'pray', label: 'Pray' },
          { value: 'people', label: 'People' },
          { value: 'gratitude', label: 'Thanks' },
        ]}
        value={section}
        onChange={setSection}
      />
      {section === 'journal' && <JournalSection />}
      {section === 'pray' && <PraySection />}
      {section === 'people' && <PeopleSection />}
      {section === 'gratitude' && <GratitudeSection />}
    </Screen>
  );
}
