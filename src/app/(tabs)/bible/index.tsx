import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import { ReadHome } from '@/components/bible/read-home';
import { PlansHome } from '@/components/plans/plans-home';
import { StudiesHome } from '@/components/study/studies-home';
import { Screen, SegmentedControl } from '@/components/ui';

type Section = 'read' | 'plans' | 'studies';

/** Bible tab: Read · Plans · Studies. */
export default function BibleScreen() {
  const params = useLocalSearchParams<{ section?: Section }>();
  const [section, setSection] = useState<Section>(params.section ?? 'read');

  useEffect(() => {
    if (params.section) setSection(params.section);
  }, [params.section]);

  return (
    <Screen>
      <SegmentedControl
        options={[
          { value: 'read', label: 'Read' },
          { value: 'plans', label: 'Plans' },
          { value: 'studies', label: 'Studies' },
        ]}
        value={section}
        onChange={setSection}
      />
      {section === 'read' && <ReadHome />}
      {section === 'plans' && <PlansHome />}
      {section === 'studies' && <StudiesHome />}
    </Screen>
  );
}
