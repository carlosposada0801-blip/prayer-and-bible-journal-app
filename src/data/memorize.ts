import type { IconName } from '@/components/icons/paths';

/**
 * Memorization courses: units of verses laid out as a path. Only references
 * are stored – the text comes from the user's chosen translation.
 * Shorter verses make the best early levels.
 */
export type MemoryUnit = {
  id: string;
  title: string;
  subtitle: string;
  icon: IconName;
  tone: 'gold' | 'sage' | 'rose' | 'sky' | 'navy';
  verses: string[];
};

export const MEMORY_UNITS: MemoryUnit[] = [
  {
    id: 'famous',
    title: 'Famous Verses',
    subtitle: 'Start with the classics',
    icon: 'star',
    tone: 'gold',
    verses: ['John 3:16', 'Psalm 23:1-3', 'Psalm 23:4-6', 'Proverbs 3:5-6', 'Jeremiah 29:11', 'Philippians 4:13', 'Romans 8:28'],
  },
  {
    id: 'salvation',
    title: 'Salvation',
    subtitle: 'The good news by heart',
    icon: 'cross',
    tone: 'sky',
    verses: ['Romans 3:23', 'Romans 6:23', 'Romans 5:8', 'Ephesians 2:8-9', 'Romans 10:9', 'John 14:6', '2 Corinthians 5:17'],
  },
  {
    id: 'peace',
    title: 'Peace & Anxiety',
    subtitle: 'Words for worried moments',
    icon: 'leaf',
    tone: 'sage',
    verses: ['1 Peter 5:7', 'Philippians 4:6-7', 'Matthew 11:28', 'John 14:27', 'Isaiah 26:3', 'Psalm 56:3', 'Matthew 6:34'],
  },
  {
    id: 'strength',
    title: 'Strength',
    subtitle: 'Courage for hard days',
    icon: 'mountain',
    tone: 'navy',
    verses: ['Joshua 1:9', 'Isaiah 41:10', 'Isaiah 40:31', 'Psalm 46:1', '2 Corinthians 12:9', 'Nehemiah 8:10', 'Psalm 18:2'],
  },
  {
    id: 'love',
    title: 'Love',
    subtitle: 'Loved by God, loving others',
    icon: 'heart',
    tone: 'rose',
    verses: ['1 John 4:19', 'John 13:34', '1 John 4:8', 'John 15:13', '1 Corinthians 16:14', 'Lamentations 3:22-23', 'Romans 8:38-39'],
  },
  {
    id: 'identity',
    title: 'Identity in Christ',
    subtitle: 'Who God says you are',
    icon: 'person',
    tone: 'gold',
    verses: ['Psalm 139:14', 'John 1:12', 'Ephesians 2:10', 'Romans 8:1', 'Galatians 2:20', '1 John 3:1'],
  },
];

export const COURSE_VERSES = MEMORY_UNITS.flatMap((u) => u.verses);

export function unitFor(reference: string) {
  return MEMORY_UNITS.find((u) => u.verses.includes(reference));
}

/** Friendly words from Grace the lamb. */
export const CHEERS = {
  correct: ['Wonderful!', 'Beautiful!', 'You got it!', 'Yes! Well done!', 'Amazing!', 'That’s it!', 'Hidden in your heart!'],
  wrong: ['Almost! Let’s look again.', 'So close! You’ve got this.', 'That’s okay. Learning takes practice.', 'Nice try! Here’s the answer.'],
  start: ['Ready to learn?', 'Let’s hide God’s Word in our hearts!', 'A few minutes with Scripture. Let’s go!', 'I’m so glad you’re here!'],
  done: ['You did it!', 'Way to go!', 'Faithful and growing!', 'Well done, friend!'],
};

export function pick<T>(list: T[]) {
  return list[Math.floor(Math.random() * list.length)];
}
