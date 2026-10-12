import { ComingSoon } from '@/components/coming-soon';

export default function StudyScreen() {
  return (
    <ComingSoon
      icon="openBook"
      tone="sky"
      headline="Daily Bible Study"
      description="One short, Bible-centered lesson each day, organized into series."
      features={[
        'Scripture, a 5-minute explanation, and reflection questions',
        '"Live it out today" and a closing prayer prompt',
        'First series: "Who is Jesus?" in the Gospel of John',
        'Track completed lessons and series progress',
      ]}
      verse={{ text: 'Thy word is a lamp unto my feet, and a light unto my path.', reference: 'Psalm 119:105 · KJV' }}
    />
  );
}
