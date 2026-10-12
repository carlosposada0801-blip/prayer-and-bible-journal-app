import type { IconName } from '@/components/icons/paths';

/**
 * Quick-read profiles of major Bible figures. Each links to a character
 * reading plan (see src/data/plans/curated.ts). Key verses are shown in the
 * reader's chosen translation.
 */
export type Character = {
  id: string;
  name: string;
  title: string;
  era: string;
  books: string;
  icon: IconName;
  tone: 'gold' | 'sage' | 'rose' | 'sky' | 'navy';
  story: string[];
  keyVerses: string[];
  lessons: string[];
  planId: string;
};

export const CHARACTERS: Character[] = [
  {
    id: 'noah',
    name: 'Noah',
    title: 'Faithful in a Faithless World',
    era: 'Before the patriarchs',
    books: 'Genesis 6–9',
    icon: 'droplet',
    tone: 'sky',
    story: [
      'When violence and corruption filled the earth, Noah stood out as a man who walked with God. God told him a flood was coming and gave him detailed instructions to build an ark for his family and the animals.',
      'Noah obeyed, even though the task was enormous and the rain hadn’t come yet. After the flood, God made a covenant with Noah and every living creature, and set the rainbow in the clouds as a sign of His promise.',
    ],
    keyVerses: ['Genesis 6:9', 'Genesis 6:22', 'Hebrews 11:7'],
    lessons: ['Faithfulness can stand out in a culture that has drifted from God.', 'Obedience often comes before we see the reason.', 'God keeps His promises, and the rainbow still reminds us.'],
    planId: 'character-noah',
  },
  {
    id: 'abraham',
    name: 'Abraham',
    title: 'The Father of Faith',
    era: 'Patriarchs',
    books: 'Genesis 12–25',
    icon: 'star',
    tone: 'gold',
    story: [
      'God called Abram to leave his country and family for a land He would show him, promising to make him a great nation and to bless all the families of the earth through him. Abram went, not knowing where he was going.',
      'The promise of a son seemed impossible as Abraham and Sarah grew old, and Abraham didn’t always get it right. Still, he believed God, and it was credited to him as righteousness. Isaac was born when Abraham was 100. Later, Abraham’s willingness to offer Isaac showed his deep trust that God would provide.',
    ],
    keyVerses: ['Genesis 12:1-3', 'Genesis 15:6', 'Hebrews 11:8'],
    lessons: ['Faith means trusting God’s promises before we see them fulfilled.', 'God is patient with us when our faith wavers.', 'God provides.'],
    planId: 'character-abraham',
  },
  {
    id: 'joseph',
    name: 'Joseph',
    title: 'From the Pit to the Palace',
    era: 'Patriarchs',
    books: 'Genesis 37–50',
    icon: 'crown',
    tone: 'gold',
    story: [
      'Joseph was his father Jacob’s favorite son, and his brothers hated him for it. They sold him into slavery in Egypt. There he was falsely accused and thrown into prison, yet the LORD was with him in every hardship.',
      'God gave Joseph the ability to interpret dreams, and he rose to become second only to Pharaoh, saving many lives during a severe famine. When his brothers came to buy food, Joseph forgave them, recognizing that God had worked even their evil intentions for good.',
    ],
    keyVerses: ['Genesis 39:2-3', 'Genesis 45:4-8', 'Genesis 50:20'],
    lessons: ['God is present in our hardest seasons.', 'Integrity matters, even when no one is watching.', 'Forgiveness can heal broken families.'],
    planId: 'character-joseph',
  },
  {
    id: 'moses',
    name: 'Moses',
    title: 'Deliverer and Lawgiver',
    era: 'Exodus',
    books: 'Exodus–Deuteronomy',
    icon: 'mountain',
    tone: 'navy',
    story: [
      'Born when Pharaoh ordered Hebrew baby boys killed, Moses was saved by his mother’s faith and raised in Pharaoh’s palace. After fleeing Egypt, he spent forty years as a shepherd until God spoke to him from a burning bush.',
      'Though he felt unqualified, Moses obeyed. God used him to confront Pharaoh, lead Israel out through the Red Sea, and receive the Law at Mount Sinai. Moses led a stubborn people through the wilderness for forty years, interceding for them again and again. The LORD spoke with him face to face, as with a friend.',
    ],
    keyVerses: ['Exodus 3:10-12', 'Exodus 14:13-14', 'Exodus 33:11'],
    lessons: ['God calls ordinary, even reluctant, people.', 'God’s presence is our greatest need.', 'Faithful leaders pray for the people they lead.'],
    planId: 'character-moses',
  },
  {
    id: 'joshua',
    name: 'Joshua',
    title: 'Strong and Courageous',
    era: 'Conquest',
    books: 'Exodus–Joshua',
    icon: 'mountain',
    tone: 'sage',
    story: [
      'Joshua served as Moses’ assistant and was one of only two spies who trusted that God would give Israel the land. After Moses died, God commissioned Joshua to lead the people across the Jordan.',
      'God repeatedly told him to be strong and courageous because He would be with him. Joshua led Israel at Jericho, where the walls fell, and through the settlement of the land. At the end of his life he challenged the people to choose whom they would serve: “As for me and my house, we will serve the LORD.”',
    ],
    keyVerses: ['Joshua 1:9', 'Joshua 24:15'],
    lessons: ['Courage grows from God’s presence, not our strength.', 'Meditating on God’s Word shapes our path.', 'Every generation must choose to serve the Lord.'],
    planId: 'character-joshua',
  },
  {
    id: 'gideon',
    name: 'Gideon',
    title: 'Mighty in God’s Strength',
    era: 'Judges',
    books: 'Judges 6–8',
    icon: 'target',
    tone: 'sky',
    story: [
      'When the Angel of the LORD found Gideon, he was threshing wheat in a winepress, hiding from the Midianites. Yet the angel greeted him as a mighty warrior. Gideon asked for signs, and God patiently gave them.',
      'God reduced Gideon’s army from thousands to just 300 men, so that Israel would know the victory came from Him. With trumpets, jars and torches, they routed a vast army.',
    ],
    keyVerses: ['Judges 6:12-16', 'Judges 7:2'],
    lessons: ['God sees who we can become in Him.', 'God is patient with our doubts.', 'God’s power shines brightest through our weakness.'],
    planId: 'character-gideon',
  },
  {
    id: 'ruth',
    name: 'Ruth',
    title: 'Loyal Love',
    era: 'Judges',
    books: 'Ruth',
    icon: 'wheat',
    tone: 'rose',
    story: [
      'Ruth was a Moabite woman whose husband died. Rather than return to her own people, she clung to her grieving mother-in-law Naomi, saying, “Your people will be my people, and your God will be my God.”',
      'In Bethlehem, Ruth gleaned grain in the fields of Boaz, a relative of Naomi’s, who treated her with great kindness. Boaz became her kinsman-redeemer and married her. Their son Obed became the grandfather of King David, placing Ruth in the family line of Jesus.',
    ],
    keyVerses: ['Ruth 1:16-17', 'Ruth 2:12'],
    lessons: ['Loyal love reflects the heart of God.', 'God welcomes outsiders into His family.', 'God works through ordinary faithfulness.'],
    planId: 'character-ruth',
  },
  {
    id: 'hannah-samuel',
    name: 'Hannah & Samuel',
    title: 'A Praying Mother and a Listening Son',
    era: 'End of the judges',
    books: '1 Samuel 1–12',
    icon: 'hands',
    tone: 'sage',
    story: [
      'Hannah longed for a child and poured out her heart to God at the tabernacle. God answered, and she dedicated her son Samuel to serve the LORD. Her prayer of praise celebrates a God who lifts up the humble.',
      'As a boy, Samuel heard God calling in the night and answered, “Speak, for Your servant is listening.” He became a prophet, judge and leader who anointed Israel’s first two kings, Saul and David.',
    ],
    keyVerses: ['1 Samuel 1:27-28', '1 Samuel 3:10', '1 Samuel 16:7'],
    lessons: ['Bring your deepest longings honestly to God.', 'A listening heart is the beginning of obedience.', 'God looks at the heart.'],
    planId: 'character-hannah-samuel',
  },
  {
    id: 'david',
    name: 'David',
    title: 'A Man After God’s Own Heart',
    era: 'Israel’s monarchy',
    books: '1 Samuel 16 – 1 Kings 2; Psalms',
    icon: 'crown',
    tone: 'gold',
    story: [
      'David was the youngest son of Jesse, a shepherd boy whom God chose because He looks at the heart. As a young man he faced the giant Goliath, trusting in the name of the LORD, and later became Israel’s greatest king.',
      'David wrote many psalms that pour out joy, fear, grief and praise. He also sinned seriously with Bathsheba. When confronted by the prophet Nathan, he repented, and Psalm 51 records his prayer for a clean heart. God promised that David’s throne would last forever, a promise fulfilled in Jesus, the Son of David.',
    ],
    keyVerses: ['1 Samuel 16:7', '1 Samuel 17:45', 'Psalm 51:10'],
    lessons: ['God values a heart devoted to Him.', 'Worship includes honest emotion.', 'Repentance restores us when we fall.'],
    planId: 'character-david',
  },
  {
    id: 'elijah',
    name: 'Elijah',
    title: 'Bold Faith and a Gentle Whisper',
    era: 'Kings & prophets',
    books: '1 Kings 17 – 2 Kings 2',
    icon: 'flame',
    tone: 'rose',
    story: [
      'Elijah confronted King Ahab and Queen Jezebel when Israel turned to Baal. On Mount Carmel he challenged the prophets of Baal, and God answered Elijah’s prayer with fire from heaven.',
      'Soon after, exhausted and afraid, Elijah fled into the wilderness and asked to die. God cared for him with food and rest, then met him not in wind, earthquake or fire, but in a gentle whisper. Elijah was later taken to heaven in a whirlwind.',
    ],
    keyVerses: ['1 Kings 18:36-39', '1 Kings 19:11-12', 'James 5:17-18'],
    lessons: ['God answers prayer with power.', 'Even strong believers get discouraged, and God is tender with them.', 'Listen for God’s quiet voice.'],
    planId: 'character-elijah',
  },
  {
    id: 'jonah',
    name: 'Jonah',
    title: 'Running From and Into Mercy',
    era: 'Kings & prophets',
    books: 'Jonah',
    icon: 'droplet',
    tone: 'sky',
    story: [
      'God told Jonah to preach to Nineveh, the capital of Israel’s enemy Assyria. Jonah ran the opposite way. In a storm at sea he was thrown overboard and swallowed by a great fish, where he prayed and God rescued him.',
      'When Jonah finally preached, the whole city repented and God spared them. Jonah was angry at God’s mercy toward his enemies. The book ends with God’s question about His compassion for the people of Nineveh.',
    ],
    keyVerses: ['Jonah 2:2', 'Jonah 4:2', 'Jonah 4:11'],
    lessons: ['You can’t outrun God’s love.', 'God gives second chances.', 'God’s mercy reaches even those we find hard to love.'],
    planId: 'character-jonah',
  },
  {
    id: 'esther',
    name: 'Esther',
    title: 'For Such a Time as This',
    era: 'Persian period',
    books: 'Esther',
    icon: 'crown',
    tone: 'rose',
    story: [
      'Esther, a young Jewish woman raised by her cousin Mordecai, became queen of Persia. When the official Haman plotted to destroy all the Jews, Mordecai urged her to speak up, suggesting she had come to her royal position for such a time as this.',
      'After fasting with her people, Esther risked her life by approaching the king uninvited. Through her courage and wisdom the plot was exposed and the Jews were saved, a deliverance still celebrated at the feast of Purim.',
    ],
    keyVerses: ['Esther 4:14', 'Esther 4:16'],
    lessons: ['God places us where we are for a purpose.', 'Courage often means speaking up for others.', 'God works behind the scenes, even when unseen.'],
    planId: 'character-esther',
  },
  {
    id: 'nehemiah',
    name: 'Nehemiah',
    title: 'Prayer and Rebuilding',
    era: 'Return from exile',
    books: 'Nehemiah',
    icon: 'home',
    tone: 'navy',
    story: [
      'Nehemiah served as cupbearer to the king of Persia. When he heard that Jerusalem’s walls lay in ruins, he wept, fasted and prayed, then asked the king for permission to rebuild.',
      'Facing mockery, threats and discouragement, Nehemiah organized the people, kept praying, and kept working. The wall was completed in just 52 days. Afterward Ezra read God’s Law to the people, and they celebrated with great joy.',
    ],
    keyVerses: ['Nehemiah 1:4', 'Nehemiah 6:15-16', 'Nehemiah 8:10'],
    lessons: ['Let what breaks God’s heart break yours.', 'Pray and work together.', 'The joy of the LORD is your strength.'],
    planId: 'character-nehemiah',
  },
  {
    id: 'daniel',
    name: 'Daniel',
    title: 'Faithful in a Foreign Land',
    era: 'Babylonian exile',
    books: 'Daniel',
    icon: 'star',
    tone: 'gold',
    story: [
      'Taken to Babylon as a young man, Daniel resolved not to defile himself and served faithfully under several kings. God gave him wisdom to interpret dreams and visions.',
      'When a law forbade prayer to anyone but the king, Daniel kept praying three times a day by his open window, as he always had. He was thrown into the lions’ den, and God shut the lions’ mouths.',
    ],
    keyVerses: ['Daniel 1:8', 'Daniel 6:10', 'Daniel 6:22'],
    lessons: ['You can stay faithful in a culture that doesn’t share your faith.', 'Steady habits of prayer prepare us for hard days.', 'God is sovereign over kings and kingdoms.'],
    planId: 'character-daniel',
  },
  {
    id: 'mary',
    name: 'Mary, Mother of Jesus',
    title: 'Humble Trust',
    era: 'Life of Jesus',
    books: 'Luke 1–2; John 2, 19; Acts 1',
    icon: 'heart',
    tone: 'rose',
    story: [
      'The angel Gabriel told Mary, a young woman engaged to Joseph, that she would give birth to the Son of God by the power of the Holy Spirit. She answered with humble trust: “I am the Lord’s servant.”',
      'Mary praised God in her song, the Magnificat, treasured what happened in her heart, and followed her Son through His ministry. She stood near the cross when Jesus died, and was with the disciples praying after His resurrection.',
    ],
    keyVerses: ['Luke 1:38', 'Luke 1:46-49', 'Luke 2:19'],
    lessons: ['Say yes to God, even when you don’t understand everything.', 'Praise God for His faithfulness to the humble.', 'Treasure and reflect on what God is doing.'],
    planId: 'character-mary',
  },
  {
    id: 'john-baptist',
    name: 'John the Baptist',
    title: 'Preparing the Way',
    era: 'Life of Jesus',
    books: 'The Gospels',
    icon: 'droplet',
    tone: 'sage',
    story: [
      'Born to Zechariah and Elizabeth in their old age, John grew up to preach in the wilderness, calling people to repent and be baptized. He prepared the way for the Messiah, as Isaiah had foretold.',
      'When Jesus came, John pointed his followers to Him: “Look, the Lamb of God, who takes away the sin of the world!” John said that Jesus must increase and he must decrease. He was imprisoned and executed by Herod for speaking the truth.',
    ],
    keyVerses: ['John 1:29', 'John 3:30', 'Luke 3:4'],
    lessons: ['Point others to Jesus, not yourself.', 'Humility makes room for Christ.', 'Speak truth with courage.'],
    planId: 'character-john-baptist',
  },
  {
    id: 'peter',
    name: 'Peter',
    title: 'From Fisherman to Shepherd',
    era: 'Life of Jesus & early church',
    books: 'Gospels, Acts, 1–2 Peter',
    icon: 'people',
    tone: 'sky',
    story: [
      'Simon was a fisherman when Jesus called him to become a fisher of people and named him Peter. He was bold and impulsive. He walked on water, declared that Jesus is the Christ, and also denied Him three times on the night of His arrest.',
      'After the resurrection, Jesus restored Peter by the Sea of Galilee, asking three times, “Do you love Me?” and telling him to feed His sheep. Filled with the Spirit at Pentecost, Peter preached boldly and about three thousand believed. He became a leader in the early church.',
    ],
    keyVerses: ['Matthew 16:15-16', 'John 21:15-17', '1 Peter 5:7'],
    lessons: ['Jesus calls imperfect people.', 'Failure is not the end of your story.', 'The Holy Spirit gives courage.'],
    planId: 'character-peter',
  },
  {
    id: 'paul',
    name: 'Paul',
    title: 'Transformed by Grace',
    era: 'Early church',
    books: 'Acts 7–28; Paul’s letters',
    icon: 'globe',
    tone: 'navy',
    story: [
      'Saul was a zealous Pharisee who persecuted the early church. On the road to Damascus, the risen Jesus appeared to him, and everything changed. Saul, also called Paul, became an apostle to the Gentiles.',
      'Paul traveled thousands of miles planting churches, enduring beatings, shipwrecks and imprisonment. His letters, about thirteen books of the New Testament, explain the gospel of grace and how to live it out. Near the end of his life he wrote that he had fought the good fight, finished the race, and kept the faith.',
    ],
    keyVerses: ['Acts 9:3-6', 'Galatians 2:20', '2 Timothy 4:7'],
    lessons: ['No one is beyond the reach of God’s grace.', 'God’s strength is made perfect in weakness.', 'Run your race with endurance.'],
    planId: 'character-paul',
  },
];

export function getCharacter(id: string) {
  return CHARACTERS.find((c) => c.id === id);
}
