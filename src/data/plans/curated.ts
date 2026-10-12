import type { IconName } from '@/components/icons/paths';

/**
 * Hand-picked reading plans. Each string in `days` is one day's reading;
 * separate multiple passages with ";". Edit freely, then run
 * `npm run validate` to check the references.
 */
export type CuratedPlan = {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  topics?: string[];
  days: string[];
};

export const TOPICAL_PLANS: CuratedPlan[] = [
  {
    id: 'topic-anxiety',
    title: 'Anxiety & Peace',
    description: 'Seven days of God’s promises for anxious hearts.',
    icon: 'leaf',
    topics: ['anxiety', 'peace', 'worry', 'fear'],
    days: ['Philippians 4:4-9', 'Matthew 6:25-34', '1 Peter 5:6-11', 'Psalm 23', 'John 14:25-27', 'Isaiah 26:3-4', 'Psalm 46'],
  },
  {
    id: 'topic-identity',
    title: 'Identity in Christ',
    description: 'Discover who God says you are.',
    icon: 'person',
    topics: ['identity', 'worth', 'self-image'],
    days: ['2 Corinthians 5:14-21', 'Ephesians 1:3-14', 'Ephesians 2:1-10', 'Romans 8:14-17', 'Galatians 2:15-21', '1 Peter 2:4-10', 'Psalm 139:13-18'],
  },
  {
    id: 'topic-forgiveness',
    title: 'Forgiveness',
    description: 'Receiving God’s forgiveness and learning to forgive others.',
    icon: 'droplet',
    topics: ['forgiveness', 'grace', 'reconciliation'],
    days: ['Psalm 32', 'Psalm 103:1-14', 'Matthew 18:21-35', 'Luke 15:11-32', 'Colossians 3:12-17', 'Ephesians 4:25-32', '1 John 1:5-2:2'],
  },
  {
    id: 'topic-purpose',
    title: 'Purpose',
    description: 'What God created you for, and how to live it.',
    icon: 'target',
    topics: ['purpose', 'calling', 'meaning'],
    days: ['Jeremiah 29:10-14', 'Micah 6:6-8', 'Matthew 22:34-40', 'Matthew 5:13-16', 'Ephesians 2:8-10', 'Romans 12:1-8', 'Matthew 28:16-20'],
  },
  {
    id: 'topic-relationships',
    title: 'Relationships & Dating',
    description: 'Love, wisdom and purity in your relationships.',
    icon: 'people',
    topics: ['dating', 'relationships', 'friendship', 'purity'],
    days: ['1 Corinthians 13', 'Proverbs 4:20-27', '2 Corinthians 6:14-18', '1 Thessalonians 4:1-8', 'Philippians 2:1-11', 'Ruth 2', 'Song of Solomon 8:6-7'],
  },
  {
    id: 'topic-marriage',
    title: 'Marriage',
    description: 'God’s design for a loving, lasting marriage.',
    icon: 'heart',
    topics: ['marriage', 'husband', 'wife', 'family'],
    days: ['Genesis 2:18-25', 'Ephesians 5:21-33', 'Colossians 3:12-19', '1 Peter 3:1-9', '1 Corinthians 13:4-8', 'Proverbs 31:10-31', 'Ecclesiastes 4:9-12'],
  },
  {
    id: 'topic-money',
    title: 'Money & Generosity',
    description: 'Contentment, stewardship and joyful giving.',
    icon: 'gift',
    topics: ['money', 'finances', 'generosity', 'contentment'],
    days: ['Matthew 6:19-24', 'Luke 12:13-21', 'Proverbs 3:1-10', '1 Timothy 6:6-19', '2 Corinthians 9:6-15', 'Philippians 4:10-19', 'Hebrews 13:1-8'],
  },
  {
    id: 'topic-grief',
    title: 'Grief & Loss',
    description: 'God’s comfort when your heart is broken.',
    icon: 'droplet',
    topics: ['grief', 'loss', 'death', 'comfort'],
    days: ['Psalm 34', 'John 11:30-44', 'Psalm 42', 'Lamentations 3:19-33', '2 Corinthians 1:3-11', '1 Thessalonians 4:13-18', 'Revelation 21:1-7'],
  },
  {
    id: 'topic-temptation',
    title: 'Overcoming Temptation',
    description: 'Strength and a way out when you’re tempted.',
    icon: 'mountain',
    topics: ['temptation', 'sin', 'purity', 'strength'],
    days: ['Genesis 3:1-13', 'Matthew 4:1-11', '1 Corinthians 10:1-13', 'James 1:12-18', 'Hebrews 4:14-16', 'Psalm 119:9-16', 'Galatians 5:16-26'],
  },
  {
    id: 'topic-prayer',
    title: 'Learning to Pray',
    description: 'Jesus and others teach us how to pray.',
    icon: 'hands',
    topics: ['prayer'],
    days: ['Matthew 6:5-15', 'Luke 11:1-13', 'Luke 18:1-14', 'Daniel 6:1-23', 'John 17', 'James 5:13-18', 'Psalm 145'],
  },
  {
    id: 'topic-faith',
    title: 'Faith',
    description: 'What it means to trust God, and how faith grows.',
    icon: 'mountain',
    topics: ['faith', 'trust', 'belief'],
    days: ['Hebrews 11:1-16', 'Hebrews 11:17-40', 'Genesis 15:1-6', 'Romans 4:16-25', 'Mark 9:14-29', 'Matthew 8:5-13', 'James 2:14-26'],
  },
  {
    id: 'topic-hope',
    title: 'Hope',
    description: 'An anchor for the soul in every season.',
    icon: 'sun',
    topics: ['hope', 'encouragement'],
    days: ['Romans 5:1-5', 'Romans 8:18-30', 'Lamentations 3:19-26', '1 Peter 1:3-9', 'Psalm 130', 'Isaiah 40:27-31', 'Hebrews 6:13-20'],
  },
  {
    id: 'topic-love',
    title: 'God’s Love',
    description: 'Rest in the deep, unfailing love of God.',
    icon: 'heart',
    topics: ['love'],
    days: ['1 Corinthians 13', '1 John 4:7-21', 'John 15:9-17', 'Romans 8:31-39', 'Luke 10:25-37', 'John 3:16-21', 'Romans 12:9-21'],
  },
  {
    id: 'topic-patience',
    title: 'Patience',
    description: 'Waiting on God with trust and hope.',
    icon: 'clock',
    topics: ['patience', 'waiting'],
    days: ['James 5:7-11', 'Psalm 37:1-11', 'Psalm 40:1-5', '2 Peter 3:8-15', 'Ecclesiastes 7:8-14', 'Colossians 3:12-15', 'Galatians 6:7-10'],
  },
  {
    id: 'topic-gratitude',
    title: 'Gratitude',
    description: 'Seven days of giving thanks.',
    icon: 'gift',
    topics: ['gratitude', 'thankfulness', 'praise'],
    days: ['Psalm 100', 'Psalm 103', 'Luke 17:11-19', '1 Thessalonians 5:12-24', 'Colossians 3:15-17', 'Psalm 136', 'Philippians 4:4-13'],
  },
  {
    id: 'topic-work',
    title: 'Faith at Work',
    description: 'Honoring God in your work and calling.',
    icon: 'target',
    topics: ['work', 'career', 'diligence'],
    days: ['Genesis 2:4-15', 'Colossians 3:17-24', 'Proverbs 6:6-11', 'Ecclesiastes 2:17-26', '2 Thessalonians 3:6-13', 'Nehemiah 4:6-23', 'Matthew 25:14-30'],
  },
  {
    id: 'topic-life-of-jesus',
    title: 'The Life of Jesus',
    description: 'Thirty days walking with Jesus, from His birth to His ascension.',
    icon: 'cross',
    topics: ['jesus', 'gospels'],
    days: [
      'Luke 1:26-38', 'Luke 2:1-20', 'Matthew 2:1-12', 'Luke 2:41-52', 'Matthew 3', 'Matthew 4:1-11',
      'John 2:1-11', 'John 3:1-21', 'John 4:1-26', 'Luke 5:1-11', 'Mark 2:1-12', 'Matthew 5:1-16',
      'Matthew 6:5-15', 'Luke 7:36-50', 'Mark 4:35-41', 'Mark 5:21-43', 'John 6:1-21', 'Matthew 16:13-28',
      'Matthew 17:1-13', 'Luke 10:38-42', 'Luke 15:1-10', 'Luke 19:1-10', 'John 11:1-44', 'Matthew 21:1-17',
      'John 13:1-17', 'Matthew 26:17-46', 'Luke 22:54-23:25', 'Luke 23:26-56', 'Luke 24:1-35', 'Acts 1:1-11',
    ],
  },
  {
    id: 'topic-miracles',
    title: 'The Miracles of Jesus',
    description: 'Fourteen signs that reveal who Jesus is.',
    icon: 'sparkle',
    topics: ['miracles', 'jesus', 'healing'],
    days: [
      'John 2:1-11', 'Mark 1:29-39', 'Luke 5:12-16', 'Mark 2:1-12', 'Luke 7:11-17', 'Mark 4:35-41', 'Mark 5:1-20',
      'Mark 5:21-43', 'Matthew 14:13-21', 'Matthew 14:22-33', 'Mark 10:46-52', 'John 9:1-12', 'John 11:38-44', 'Luke 17:11-19',
    ],
  },
  {
    id: 'topic-parables',
    title: 'The Parables of Jesus',
    description: 'The stories Jesus told about God’s kingdom.',
    icon: 'scroll',
    topics: ['parables', 'jesus', 'stories'],
    days: [
      'Matthew 13:1-23', 'Matthew 13:31-46', 'Luke 10:25-37', 'Luke 15:1-10', 'Luke 15:11-32', 'Luke 12:13-21', 'Luke 18:1-8',
      'Luke 18:9-14', 'Matthew 18:21-35', 'Matthew 20:1-16', 'Matthew 25:1-13', 'Matthew 25:14-30', 'Matthew 7:24-27', 'Luke 14:15-24',
    ],
  },
  {
    id: 'topic-prophecies',
    title: 'Prophecies About Jesus',
    description: 'Old Testament promises and their fulfillment in Christ.',
    icon: 'scroll',
    topics: ['prophecy', 'messiah', 'jesus'],
    days: [
      'Genesis 3:14-15; Galatians 4:4-5', 'Isaiah 7:14; Matthew 1:18-23', 'Micah 5:2; Matthew 2:1-6', 'Isaiah 9:1-7; Luke 1:30-33',
      'Isaiah 40:3-5; Mark 1:1-8', 'Zechariah 9:9; Matthew 21:1-11', 'Psalm 41:9; John 13:18-30', 'Zechariah 11:12-13; Matthew 26:14-16',
      'Isaiah 53:1-6; 1 Peter 2:21-25', 'Isaiah 53:7-12; Acts 8:26-35', 'Psalm 22:1-18; Matthew 27:35-46', 'Psalm 16:8-11; Acts 2:22-32',
      'Deuteronomy 18:15-19; Acts 3:17-26', 'Daniel 7:13-14; Matthew 26:62-64',
    ],
  },
  {
    id: 'topic-holy-spirit',
    title: 'The Holy Spirit',
    description: 'Who the Spirit is and what He does in us.',
    icon: 'dove',
    topics: ['holy spirit', 'spirit'],
    days: ['John 14:15-27', 'John 16:5-15', 'Acts 2:1-21', 'Romans 8:1-17', 'Galatians 5:16-26', '1 Corinthians 12:1-13', 'Ephesians 1:11-14'],
  },
  {
    id: 'topic-heaven',
    title: 'Heaven',
    description: 'The hope of eternity with God.',
    icon: 'sun',
    topics: ['heaven', 'eternity', 'hope'],
    days: ['John 14:1-6', '2 Corinthians 5:1-10', '1 Corinthians 15:35-58', 'Philippians 3:17-21', 'Isaiah 65:17-25', 'Revelation 21:1-8', 'Revelation 22:1-5'],
  },
  {
    id: 'topic-salvation',
    title: 'Salvation',
    description: 'The good news of what God has done for us in Jesus.',
    icon: 'cross',
    topics: ['salvation', 'gospel', 'grace'],
    days: ['John 3:1-21', 'Romans 3:21-26', 'Romans 5:6-11', 'Romans 10:5-13', 'Ephesians 2:1-10', 'Titus 3:3-8', 'Acts 16:25-34'],
  },
];

export const SEASONAL_PLANS: CuratedPlan[] = [
  {
    id: 'season-advent',
    title: 'Advent',
    description: 'Twenty-five days of promise and fulfillment leading to Christmas. Start December 1.',
    icon: 'star',
    topics: ['advent', 'christmas'],
    days: [
      'Isaiah 9:2-7', 'Isaiah 11:1-10', 'Isaiah 40:1-11', 'Jeremiah 23:1-8', 'Micah 5:2-5', 'Isaiah 7:10-14', 'Genesis 12:1-3',
      '2 Samuel 7:8-16', 'Psalm 98', 'Malachi 3:1-4', 'Luke 1:5-25', 'Luke 1:26-38', 'Luke 1:39-56', 'Matthew 1:18-25',
      'Luke 1:57-80', 'John 1:1-14', 'Isaiah 52:7-10', 'Galatians 4:4-7', 'Philippians 2:5-11', 'Isaiah 60:1-6', 'Luke 2:1-7',
      'Luke 2:8-20', 'Luke 2:21-40', 'Matthew 2:1-12', 'John 3:16-21',
    ],
  },
  {
    id: 'season-holy-week',
    title: 'Holy Week & Easter',
    description: 'Walk with Jesus from Palm Sunday to the empty tomb.',
    icon: 'cross',
    topics: ['easter', 'holy week', 'resurrection'],
    days: [
      'Matthew 21:1-17', 'Mark 11:12-25', 'Mark 12:28-44', 'Matthew 26:1-16', 'John 13:1-17; Luke 22:7-30', 'John 19', 'Matthew 27:57-66', 'John 20:1-18',
    ],
  },
  {
    id: 'season-new-year',
    title: 'A Fresh Start',
    description: 'Seven days to begin the new year with God.',
    icon: 'sun',
    topics: ['new year', 'fresh start', 'goals'],
    days: ['Lamentations 3:22-26', 'Isaiah 43:18-21', '2 Corinthians 5:17-21', 'Philippians 3:12-16', 'Proverbs 3:1-12', 'Psalm 90', 'Joshua 1:1-9'],
  },
];

export const CHARACTER_PLANS: CuratedPlan[] = [
  {
    id: 'character-noah',
    title: 'Noah',
    description: 'Faithfulness in a faithless world.',
    icon: 'droplet',
    days: ['Genesis 6', 'Genesis 7', 'Genesis 8', 'Genesis 9:1-17'],
  },
  {
    id: 'character-abraham',
    title: 'Abraham',
    description: 'The journey of the father of faith.',
    icon: 'star',
    days: ['Genesis 12', 'Genesis 13', 'Genesis 15', 'Genesis 16', 'Genesis 17', 'Genesis 18', 'Genesis 21', 'Genesis 22', 'Genesis 24', 'Hebrews 11:8-19'],
  },
  {
    id: 'character-joseph',
    title: 'Joseph',
    description: 'From the pit to the palace: God’s purpose through hardship.',
    icon: 'crown',
    days: ['Genesis 37', 'Genesis 39', 'Genesis 40', 'Genesis 41:1-36', 'Genesis 41:37-57', 'Genesis 42', 'Genesis 43', 'Genesis 44', 'Genesis 45', 'Genesis 46', 'Genesis 47', 'Genesis 50'],
  },
  {
    id: 'character-moses',
    title: 'Moses',
    description: 'An ordinary man who led God’s people to freedom.',
    icon: 'mountain',
    days: [
      'Exodus 1-2', 'Exodus 3', 'Exodus 4', 'Exodus 5:1-6:13', 'Exodus 7-9', 'Exodus 10-11', 'Exodus 12',
      'Exodus 13:17-14:31', 'Exodus 16-17', 'Exodus 19-20', 'Exodus 32', 'Exodus 33-34', 'Numbers 13-14', 'Deuteronomy 34',
    ],
  },
  {
    id: 'character-joshua',
    title: 'Joshua',
    description: 'Strong and courageous in the Promised Land.',
    icon: 'mountain',
    days: ['Joshua 1', 'Joshua 2', 'Joshua 3-4', 'Joshua 5:13-6:27', 'Joshua 7', 'Joshua 14:6-15', 'Joshua 24'],
  },
  {
    id: 'character-gideon',
    title: 'Gideon',
    description: 'God’s strength in our weakness.',
    icon: 'target',
    days: ['Judges 6:1-24', 'Judges 6:25-40', 'Judges 7', 'Judges 8:22-35'],
  },
  {
    id: 'character-ruth',
    title: 'Ruth',
    description: 'Loyalty, kindness and redemption.',
    icon: 'wheat',
    days: ['Ruth 1', 'Ruth 2', 'Ruth 3', 'Ruth 4'],
  },
  {
    id: 'character-hannah-samuel',
    title: 'Hannah & Samuel',
    description: 'A mother’s prayer and a boy who listened to God.',
    icon: 'hands',
    days: ['1 Samuel 1', '1 Samuel 2:1-21', '1 Samuel 3', '1 Samuel 7', '1 Samuel 8', '1 Samuel 12'],
  },
  {
    id: 'character-david',
    title: 'David',
    description: 'Shepherd, warrior, king and a man after God’s own heart.',
    icon: 'crown',
    days: [
      '1 Samuel 16', '1 Samuel 17', '1 Samuel 18', '1 Samuel 20', '1 Samuel 24', 'Psalm 23', '2 Samuel 5',
      '2 Samuel 6', '2 Samuel 7', '2 Samuel 9', '2 Samuel 11', '2 Samuel 12', 'Psalm 51', '1 Kings 2:1-12',
    ],
  },
  {
    id: 'character-elijah',
    title: 'Elijah',
    description: 'Bold faith, deep discouragement, and a God who whispers.',
    icon: 'flame',
    days: ['1 Kings 17', '1 Kings 18:1-19', '1 Kings 18:20-46', '1 Kings 19', '1 Kings 21', '2 Kings 2:1-14', 'Luke 9:28-36'],
  },
  {
    id: 'character-jonah',
    title: 'Jonah',
    description: 'Running from God and running into His mercy.',
    icon: 'droplet',
    days: ['Jonah 1', 'Jonah 2', 'Jonah 3', 'Jonah 4'],
  },
  {
    id: 'character-esther',
    title: 'Esther',
    description: 'Courage “for such a time as this.”',
    icon: 'crown',
    days: ['Esther 1', 'Esther 2', 'Esther 3', 'Esther 4', 'Esther 5', 'Esther 6', 'Esther 7', 'Esther 8-10'],
  },
  {
    id: 'character-nehemiah',
    title: 'Nehemiah',
    description: 'Prayer, leadership and rebuilding what was broken.',
    icon: 'home',
    days: ['Nehemiah 1', 'Nehemiah 2', 'Nehemiah 4', 'Nehemiah 6', 'Nehemiah 8', 'Nehemiah 9:1-21', 'Nehemiah 12:27-43'],
  },
  {
    id: 'character-daniel',
    title: 'Daniel',
    description: 'Faithful in a foreign land.',
    icon: 'star',
    days: ['Daniel 1', 'Daniel 2:1-23', 'Daniel 2:24-49', 'Daniel 3', 'Daniel 4', 'Daniel 5', 'Daniel 6', 'Daniel 9:1-23'],
  },
  {
    id: 'character-mary',
    title: 'Mary, Mother of Jesus',
    description: 'Humble trust in God’s surprising plan.',
    icon: 'heart',
    days: ['Luke 1:26-38', 'Luke 1:39-56', 'Luke 2:1-20', 'Luke 2:41-52', 'John 2:1-12', 'John 19:25-27; Acts 1:12-14'],
  },
  {
    id: 'character-john-baptist',
    title: 'John the Baptist',
    description: 'Preparing the way for Jesus.',
    icon: 'droplet',
    days: ['Luke 1:5-25', 'Luke 1:57-80', 'Matthew 3', 'John 1:19-37', 'Matthew 11:1-19', 'Mark 6:14-29'],
  },
  {
    id: 'character-peter',
    title: 'Peter',
    description: 'From impulsive fisherman to faithful shepherd.',
    icon: 'people',
    days: [
      'Luke 5:1-11', 'Matthew 14:22-33', 'Matthew 16:13-23', 'Matthew 17:1-13', 'John 13:1-17', 'Luke 22:31-62',
      'John 21:1-19', 'Acts 2:14-41', 'Acts 3', 'Acts 10', 'Acts 12:1-19', '1 Peter 5:1-11',
    ],
  },
  {
    id: 'character-paul',
    title: 'Paul',
    description: 'From persecutor to apostle: grace that transforms.',
    icon: 'globe',
    days: [
      'Acts 7:54-8:3', 'Acts 9:1-31', 'Acts 13:1-12', 'Acts 16:11-40', 'Acts 17:16-34', 'Acts 20:17-38', 'Acts 22:1-21',
      'Acts 26', 'Acts 27', 'Acts 28:11-31', 'Philippians 3:1-14', '2 Corinthians 11:21-12:10', 'Romans 8:28-39', '2 Timothy 4:1-8',
    ],
  },
];
