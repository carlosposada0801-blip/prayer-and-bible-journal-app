import type { IconName } from '@/components/icons/paths';
import type { FastType } from '@/db/fasting';

export const FAST_TYPES: { type: FastType; name: string; icon: IconName; description: string; food: boolean }[] = [
  { type: 'food', name: 'Food Fast', icon: 'wheat', description: 'No food. Drink water and other liquids as you choose.', food: true },
  { type: 'water', name: 'Water Fast', icon: 'droplet', description: 'Water only.', food: true },
  { type: 'daniel', name: 'Daniel Fast', icon: 'leaf', description: 'Vegetables, fruits, whole grains and water, inspired by Daniel 1 and 10.', food: true },
  { type: 'social', name: 'Social Media', icon: 'smartphone', description: 'Set aside social media and screens to make room for God.', food: false },
  { type: 'custom', name: 'Custom', icon: 'pen', description: 'Choose something to set aside for a season.', food: false },
];

export const FAST_LENGTHS: { label: string; hours: number }[] = [
  { label: '12 hours', hours: 12 },
  { label: '16 hours', hours: 16 },
  { label: '24 hours', hours: 24 },
  { label: '3 days', hours: 72 },
  { label: '7 days', hours: 168 },
  { label: '21 days', hours: 504 },
  { label: '40 days', hours: 960 },
];

/** Passages about fasting – shown in the user's translation. */
export const FASTING_VERSES = ['Matthew 6:16-18', 'Isaiah 58:6-9', 'Joel 2:12-13', 'Ezra 8:21-23', 'Matthew 4:1-4', 'Acts 13:2-3', 'Daniel 10:2-3', 'Esther 4:16'];

export const HEALTH_NOTE =
  'A gentle health note: fasting from food isn’t right for everyone. If you are pregnant or nursing, have diabetes, a history of eating disorders or another medical condition, or take regular medication, please talk with your doctor before a food fast. Stay hydrated, listen to your body, and remember there are many ways to fast.';

export function fastTypeInfo(type: FastType) {
  return FAST_TYPES.find((t) => t.type === type) ?? FAST_TYPES[4];
}

export function formatDuration(hours: number) {
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min`;
  if (hours < 48) return `${Math.round(hours * 10) / 10} hours`.replace('.0 ', ' ');
  return `${Math.round((hours / 24) * 10) / 10} days`.replace('.0 ', ' ');
}
