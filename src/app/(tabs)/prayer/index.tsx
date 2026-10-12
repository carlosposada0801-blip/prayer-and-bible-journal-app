import { ComingSoon } from '@/components/coming-soon';

export default function PrayerScreen() {
  return (
    <ComingSoon
      icon="dove"
      tone="sage"
      headline="Your Prayer Journal"
      description="A quiet, private place to talk with God and remember His faithfulness."
      features={[
        'Write prayers with a title, date and tags',
        'Mark prayers answered and note how God answered',
        'Answered Prayers timeline',
        'Search, filter, Face ID lock and PDF export',
      ]}
      verse={{
        text: 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.',
        reference: 'Philippians 4:6 · KJV',
      }}
    />
  );
}
