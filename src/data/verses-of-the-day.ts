import { dayOfYear } from '@/lib/dates';

import { ref, type Reference } from './bible/references';

/**
 * One verse per day, rotating through this list. Only references are stored;
 * the text comes from the translation chosen in Settings. Add or reorder freely.
 */
export const VERSES_OF_THE_DAY = [
  'Lamentations 3:22-23', 'Psalm 46:1', 'John 3:16', 'Philippians 4:6-7', 'Isaiah 41:10', 'Proverbs 3:5-6',
  'Romans 8:28', 'Joshua 1:9', 'Matthew 11:28-29', 'Psalm 23:1-3', 'Jeremiah 29:11', '2 Corinthians 5:17',
  'Galatians 2:20', 'Ephesians 2:8-9', 'Psalm 119:105', 'Romans 12:2', 'Hebrews 11:1', '1 Peter 5:7',
  'Matthew 6:33', 'Psalm 37:4', 'Isaiah 40:31', 'John 14:27', 'Romans 15:13', 'Psalm 34:18',
  'Micah 6:8', '1 John 4:19', 'Colossians 3:23', 'James 1:5', 'Psalm 121:1-2', 'John 15:5',
  'Zephaniah 3:17', 'Psalm 139:14', '2 Timothy 1:7', 'Romans 5:8', 'Psalm 27:1', 'Matthew 5:16',
  'Hebrews 12:1-2', 'Psalm 16:11', 'John 8:12', 'Isaiah 26:3', 'Philippians 4:13', '1 Corinthians 13:4-5',
  'Psalm 91:1-2', 'Romans 8:38-39', 'John 10:10', 'Psalm 51:10', 'Deuteronomy 31:8', 'Matthew 28:20',
  'Psalm 100:4-5', 'Ephesians 3:20', 'Psalm 62:1-2', 'John 11:25', 'Isaiah 43:2', 'Galatians 5:22-23',
  'Psalm 30:5', '1 Thessalonians 5:16-18', 'Proverbs 16:3', 'Psalm 145:18', 'John 16:33', 'Romans 10:9',
  'Psalm 55:22', '2 Corinthians 12:9', 'Hebrews 13:5', 'Psalm 103:2-4', 'Isaiah 9:6', 'Luke 1:37',
  'Psalm 18:2', 'Matthew 6:34', 'John 1:12', 'Psalm 4:8', 'Romans 12:12', 'James 1:2-3',
  'Psalm 73:26', 'Ephesians 4:32', 'Psalm 42:11', '1 John 1:9', 'Nahum 1:7', 'Psalm 40:1-2',
  'Matthew 22:37-39', 'Colossians 3:15', 'Psalm 118:24', 'Isaiah 53:5', 'John 13:34-35', 'Psalm 9:9-10',
  'Hebrews 4:16', 'Psalm 32:8', 'Romans 8:1', 'Psalm 84:11', 'Philippians 1:6', 'Psalm 136:1',
  'Proverbs 18:10', '1 Corinthians 10:13', 'Psalm 5:3', 'Isaiah 30:15', 'Matthew 7:7', 'Psalm 94:19',
  'Ephesians 6:10', 'Psalm 143:8', 'John 6:35', 'Exodus 14:14', 'Psalm 63:1', '1 Peter 2:9',
  'Psalm 28:7', 'Romans 8:31', 'Psalm 31:24', 'Isaiah 55:8-9', '2 Thessalonians 3:16', 'Psalm 86:5',
  'Revelation 21:4', 'Psalm 147:3', 'John 14:6', 'Psalm 19:14', 'Proverbs 4:23', 'Psalm 116:1-2',
  'Mark 10:27', 'Psalm 20:7', 'Colossians 2:6-7', 'Psalm 112:7', 'Romans 6:23', 'Psalm 57:10',
  'Ruth 1:16', 'Psalm 25:4-5', 'John 4:14', 'Habakkuk 3:17-18', 'Psalm 8:3-4', '1 Chronicles 16:11',
  'Psalm 33:20-22', 'Hebrews 10:23', 'Isaiah 12:2', 'Psalm 61:2', 'Matthew 5:3-4', 'Psalm 65:11',
];

export function verseOfTheDay(date = new Date()): Reference {
  const index = (dayOfYear(date) - 1 + date.getFullYear()) % VERSES_OF_THE_DAY.length;
  return ref(VERSES_OF_THE_DAY[index]);
}
