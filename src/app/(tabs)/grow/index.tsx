import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import { CharactersHome } from '@/components/characters/characters-home';
import { MemorizeHome } from '@/components/memorize/memorize-home';
import { TriviaHome } from '@/components/trivia/trivia-home';
import { Screen, SegmentedControl } from '@/components/ui';

type Section = 'memorize' | 'trivia' | 'characters';

/** Grow tab: Memorize · Trivia · People of the Bible. */
export default function GrowScreen() {
  const params = useLocalSearchParams<{ section?: Section }>();
  const [section, setSection] = useState<Section>(params.section ?? 'memorize');
  useEffect(() => {
    if (params.section) setSection(params.section);
  }, [params.section]);

  return (
    <Screen>
      <SegmentedControl
        options={[
          { value: 'memorize', label: 'Memorize' },
          { value: 'trivia', label: 'Trivia' },
          { value: 'characters', label: 'People' },
        ]}
        value={section}
        onChange={setSection}
      />
      {section === 'memorize' && <MemorizeHome />}
      {section === 'trivia' && <TriviaHome />}
      {section === 'characters' && <CharactersHome />}
    </Screen>
  );
}
