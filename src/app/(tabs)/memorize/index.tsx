import { ComingSoon } from '@/components/coming-soon';

export default function MemorizeScreen() {
  return (
    <ComingSoon
      icon="heart"
      tone="rose"
      headline="Hide God's Word in Your Heart"
      description="Bite-sized, playful practice that makes verses stick for life."
      features={[
        'A path of units: Salvation, Peace, Strength, Love and more',
        'Five quiz types that grow with you',
        'Hearts, XP, daily goals and confetti celebrations',
        'Spaced repetition and a friendly lamb to cheer you on',
      ]}
      verse={{ text: 'Thy word have I hid in mine heart, that I might not sin against thee.', reference: 'Psalm 119:11 · KJV' }}
    />
  );
}
