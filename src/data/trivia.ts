/**
 * Bible trivia questions. The FIRST option is always the correct answer –
 * the app shuffles options when showing them. Every question cites the
 * passage that answers it; run `npm run validate` after editing.
 */
export type TriviaLevel = 'easy' | 'medium' | 'hard';
export type TriviaTopic = 'People' | 'Places' | 'Events' | 'Stories' | 'Jesus';

export type TriviaQuestion = {
  id: string;
  level: TriviaLevel;
  topic: TriviaTopic;
  question: string;
  /** options[0] is correct. */
  options: [string, string, string, string];
  explanation: string;
  reference: string;
};

type Row = [TriviaTopic, string, [string, string, string, string], string, string];

const EASY: Row[] = [
  ['People', 'Who built an ark to survive the flood?', ['Noah', 'Abraham', 'Moses', 'Jonah'], 'God told Noah to build an ark for his family and the animals.', 'Genesis 6:13-22'],
  ['Events', 'How many days did God work in creation before resting on the seventh?', ['Six', 'Five', 'Seven', 'Three'], 'God finished His work in six days and rested on the seventh.', 'Genesis 2:1-3'],
  ['People', 'Who was swallowed by a great fish?', ['Jonah', 'Peter', 'Elijah', 'Paul'], 'Jonah spent three days and nights inside the fish before God had it release him.', 'Jonah 1:17'],
  ['Stories', 'What did David use to defeat Goliath?', ['A sling and a stone', 'A sword', 'A bow and arrow', 'A spear'], 'David trusted God and struck Goliath with a single stone from his sling.', '1 Samuel 17:48-50'],
  ['Places', 'In what town was Jesus born?', ['Bethlehem', 'Nazareth', 'Jerusalem', 'Capernaum'], 'Jesus was born in Bethlehem of Judea, the town of David.', 'Matthew 2:1'],
  ['People', 'Who was the first man God created?', ['Adam', 'Abel', 'Noah', 'Seth'], 'God formed Adam from the dust of the ground and breathed life into him.', 'Genesis 2:7'],
  ['People', 'Who led the Israelites out of slavery in Egypt?', ['Moses', 'Joshua', 'Aaron', 'Joseph'], 'God called Moses at the burning bush to bring His people out of Egypt.', 'Exodus 3:10'],
  ['Jesus', 'How many apostles did Jesus choose?', ['Twelve', 'Seven', 'Ten', 'Seventy'], 'Jesus appointed twelve to be with Him and to send out to preach.', 'Mark 3:13-19'],
  ['Jesus', 'What was Jesus’ first miracle in the Gospel of John?', ['Turning water into wine', 'Walking on water', 'Healing a blind man', 'Feeding 5,000 people'], 'At a wedding in Cana, Jesus turned water into wine, the first of His signs.', 'John 2:1-11'],
  ['People', 'Which disciple denied knowing Jesus three times?', ['Peter', 'John', 'Thomas', 'Judas'], 'Peter denied Jesus three times, then wept when the rooster crowed.', 'Luke 22:54-62'],
  ['Events', 'What did God give Moses on Mount Sinai?', ['Tablets with the Ten Commandments', 'A golden calf', 'A staff', 'The Ark of the Covenant'], 'God gave Moses two stone tablets written by the finger of God.', 'Exodus 31:18'],
  ['People', 'Who was thrown into a den of lions?', ['Daniel', 'David', 'Samson', 'Jeremiah'], 'Daniel kept praying to God, and God shut the lions’ mouths.', 'Daniel 6:16-22'],
  ['Events', 'What is the first book of the Bible?', ['Genesis', 'Exodus', 'Matthew', 'Psalms'], 'Genesis means “beginning” and opens with the creation of the world.', 'Genesis 1:1'],
  ['Events', 'What is the last book of the Bible?', ['Revelation', 'Jude', 'Malachi', 'Acts'], 'Revelation ends with the promise of a new heaven and a new earth.', 'Revelation 22:20-21'],
  ['People', 'Who was the mother of Jesus?', ['Mary', 'Elizabeth', 'Martha', 'Anna'], 'The angel Gabriel told Mary she would give birth to a son named Jesus.', 'Luke 1:30-31'],
  ['Events', 'For how many days and nights did it rain during the flood?', ['Forty', 'Seven', 'Twelve', 'One hundred'], 'Rain fell on the earth forty days and forty nights.', 'Genesis 7:12'],
  ['People', 'Who betrayed Jesus for thirty pieces of silver?', ['Judas Iscariot', 'Peter', 'Pilate', 'Barabbas'], 'Judas agreed to hand Jesus over to the chief priests for thirty pieces of silver.', 'Matthew 26:14-16'],
  ['Stories', 'What did Jesus use to feed a crowd of 5,000 men?', ['Five loaves and two fish', 'Seven loaves', 'Manna from heaven', 'Twelve baskets of bread'], 'A boy’s five barley loaves and two fish fed the whole crowd, with leftovers.', 'John 6:9-13'],
  ['People', 'Whose great strength was connected to his uncut hair?', ['Samson', 'Gideon', 'Goliath', 'Saul'], 'Samson told Delilah that his strength would leave if his head were shaved.', 'Judges 16:17'],
  ['Places', 'In which river was Jesus baptized?', ['The Jordan', 'The Nile', 'The Euphrates', 'The Tigris'], 'Jesus came from Galilee to the Jordan to be baptized by John.', 'Matthew 3:13'],
  ['People', 'Who interpreted Pharaoh’s dreams of cows and grain?', ['Joseph', 'Daniel', 'Moses', 'Jacob'], 'God gave Joseph the meaning: seven years of plenty, then seven of famine.', 'Genesis 41:25-32'],
  ['Jesus', 'What did Jesus call the greatest commandment?', ['Love the Lord your God with all your heart', 'Do not murder', 'Keep the Sabbath', 'Honor your parents'], 'Jesus said loving God with all your heart, soul and mind is the first and greatest commandment.', 'Matthew 22:36-38'],
  ['Jesus', 'On what day did Jesus rise from the dead?', ['The third day', 'The seventh day', 'The first day after He died', 'The fortieth day'], 'Christ died for our sins, was buried, and was raised on the third day.', '1 Corinthians 15:3-4'],
  ['People', 'Who was the first woman?', ['Eve', 'Sarah', 'Ruth', 'Miriam'], 'Adam named his wife Eve, because she would be the mother of all the living.', 'Genesis 3:20'],
  ['Events', 'What sign did God give as a promise never to flood the whole earth again?', ['A rainbow', 'A dove', 'A star', 'An olive branch'], 'God set His bow in the clouds as the sign of His covenant.', 'Genesis 9:12-15'],
  ['Places', 'In which garden did Adam and Eve live?', ['Eden', 'Gethsemane', 'Babylon', 'Goshen'], 'The LORD God planted a garden in Eden and placed the man there.', 'Genesis 2:8'],
  ['People', 'Which shepherd boy was anointed to be king of Israel?', ['David', 'Saul', 'Solomon', 'Samuel'], 'Samuel anointed David, the youngest son of Jesse, while he was tending sheep.', '1 Samuel 16:11-13'],
  ['Stories', 'In Jesus’ parable, what did the Good Samaritan do?', ['Cared for a wounded stranger', 'Built a house on rock', 'Found a lost coin', 'Sowed seed on good soil'], 'The Samaritan bandaged the man’s wounds, took him to an inn and paid for his care.', 'Luke 10:33-35'],
  ['Stories', 'What did the father do when the prodigal son came home?', ['Ran to him and embraced him', 'Sent him away', 'Made him a servant', 'Scolded him'], 'While the son was still far off, his father ran to him, embraced him and kissed him.', 'Luke 15:20-24'],
  ['People', 'Who climbed a sycamore tree to see Jesus?', ['Zacchaeus', 'Nicodemus', 'Bartimaeus', 'Lazarus'], 'Zacchaeus was short, so he climbed a tree. Jesus called him down and came to his house.', 'Luke 19:1-6'],
  ['Places', 'Which city’s walls fell after the Israelites marched around it?', ['Jericho', 'Jerusalem', 'Babylon', 'Nineveh'], 'After seven days of marching, the people shouted and the walls of Jericho collapsed.', 'Joshua 6:20'],
  ['People', 'Who was Abraham’s wife?', ['Sarah', 'Rebekah', 'Rachel', 'Leah'], 'God changed Sarai’s name to Sarah and promised her a son.', 'Genesis 17:15-16'],
  ['Stories', 'Which disciple walked on the water toward Jesus?', ['Peter', 'Andrew', 'James', 'John'], 'Peter stepped out of the boat and walked on the water, then began to sink when he feared.', 'Matthew 14:28-31'],
  ['Places', 'Where did Jesus pray on the night He was arrested?', ['Gethsemane', 'Golgotha', 'Bethany', 'The temple'], 'Jesus went with His disciples to a place called Gethsemane to pray.', 'Matthew 26:36'],
  ['Events', 'What did God create on the first day?', ['Light', 'Animals', 'The sun and moon', 'People'], 'God said, “Let there be light,” and there was light.', 'Genesis 1:3-5'],
  ['People', 'What was the name of the giant David fought?', ['Goliath', 'Og', 'Nimrod', 'Saul'], 'Goliath was a champion of the Philistines from Gath.', '1 Samuel 17:4'],
  ['Jesus', 'What animal did Jesus ride into Jerusalem?', ['A donkey', 'A horse', 'A camel', 'A chariot'], 'Jesus rode into Jerusalem on a young donkey, fulfilling Zechariah’s prophecy.', 'John 12:12-15'],
  ['People', 'Who was Moses’ brother who spoke for him?', ['Aaron', 'Joshua', 'Caleb', 'Levi'], 'God told Moses that his brother Aaron would speak to the people for him.', 'Exodus 4:14-16'],
  ['People', 'Who were the first two sons of Adam and Eve?', ['Cain and Abel', 'Jacob and Esau', 'Shem and Ham', 'Isaac and Ishmael'], 'Eve gave birth to Cain, and later to his brother Abel.', 'Genesis 4:1-2'],
  ['Stories', 'In Jesus’ parable, where did the wise man build his house?', ['On the rock', 'On the sand', 'By the sea', 'On a hill'], 'The wise man who hears and obeys Jesus’ words builds on the rock.', 'Matthew 7:24-27'],
];

const MEDIUM: Row[] = [
  ['People', 'Who is the oldest person recorded in the Bible?', ['Methuselah', 'Noah', 'Adam', 'Abraham'], 'Methuselah lived 969 years.', 'Genesis 5:27'],
  ['People', 'Which prophet was taken up to heaven in a whirlwind?', ['Elijah', 'Elisha', 'Isaiah', 'Enoch'], 'A chariot of fire appeared and Elijah went up to heaven in a whirlwind.', '2 Kings 2:11'],
  ['People', 'What was the name of the son born to Abraham when he was 100?', ['Isaac', 'Ishmael', 'Jacob', 'Esau'], 'Abraham was a hundred years old when his son Isaac was born.', 'Genesis 21:5'],
  ['Stories', 'Who was sold into slavery by his own brothers?', ['Joseph', 'Benjamin', 'Reuben', 'Moses'], 'Joseph’s brothers sold him to Ishmaelite traders for twenty shekels of silver.', 'Genesis 37:28'],
  ['People', 'Which queen risked her life to save the Jewish people?', ['Esther', 'Jezebel', 'The Queen of Sheba', 'Vashti'], 'Esther went to the king unsummoned, saying, “If I perish, I perish.”', 'Esther 4:16'],
  ['People', 'Who was Ruth’s mother-in-law?', ['Naomi', 'Orpah', 'Hannah', 'Leah'], 'Ruth refused to leave Naomi, promising to go wherever she went.', 'Ruth 1:14-16'],
  ['Stories', 'What did Esau sell to Jacob for a bowl of stew?', ['His birthright', 'His coat', 'His flocks', 'His blessing'], 'Esau despised his birthright and traded it for bread and lentil stew.', 'Genesis 25:33-34'],
  ['Places', 'On which mountain did Elijah challenge the prophets of Baal?', ['Mount Carmel', 'Mount Sinai', 'Mount of Olives', 'Mount Zion'], 'Elijah called the prophets of Baal to Mount Carmel, and God answered with fire.', '1 Kings 18:19-39'],
  ['People', 'Which tax collector did Jesus call to follow Him?', ['Matthew', 'Zacchaeus', 'Nicodemus', 'Thaddaeus'], 'Jesus saw Matthew at the tax booth and said, “Follow Me.”', 'Matthew 9:9'],
  ['People', 'What was the apostle Paul also called?', ['Saul', 'Simon', 'Silas', 'Stephen'], 'Saul, who was also called Paul, was filled with the Holy Spirit.', 'Acts 13:9'],
  ['Places', 'On the road to which city did Saul meet the risen Jesus?', ['Damascus', 'Jerusalem', 'Rome', 'Antioch'], 'As Saul neared Damascus, a light from heaven flashed around him.', 'Acts 9:3-6'],
  ['Jesus', 'Whom did Jesus raise from the dead after four days in the tomb?', ['Lazarus', 'Jairus’ daughter', 'The widow’s son', 'Dorcas'], 'Jesus called Lazarus out of the tomb, still wrapped in grave clothes.', 'John 11:39-44'],
  ['People', 'Which king asked God for wisdom to govern well?', ['Solomon', 'David', 'Saul', 'Hezekiah'], 'Solomon asked for an understanding heart, and God was pleased.', '1 Kings 3:9-12'],
  ['Stories', 'Who were Daniel’s three friends thrown into the fiery furnace?', ['Shadrach, Meshach and Abednego', 'Peter, James and John', 'Shem, Ham and Japheth', 'Aaron, Hur and Joshua'], 'The three refused to bow to the golden statue, and God delivered them from the fire.', 'Daniel 3:19-27'],
  ['Events', 'What was the final plague on Egypt?', ['The death of the firstborn', 'Darkness', 'Locusts', 'Frogs'], 'At midnight the LORD struck down the firstborn of Egypt, and Pharaoh let Israel go.', 'Exodus 12:29-31'],
  ['People', 'Which of Jacob’s wives did he love most?', ['Rachel', 'Leah', 'Bilhah', 'Zilpah'], 'Jacob loved Rachel more than Leah.', 'Genesis 29:30'],
  ['Events', 'What food did God provide from heaven in the wilderness?', ['Manna', 'Locusts', 'Figs', 'Barley loaves'], 'The Israelites called the bread from heaven manna. It tasted like wafers made with honey.', 'Exodus 16:31'],
  ['People', 'Which apostle doubted the resurrection until he saw Jesus?', ['Thomas', 'Philip', 'Bartholomew', 'Andrew'], 'When Thomas saw the risen Jesus, he declared, “My Lord and my God!”', 'John 20:24-28'],
  ['People', 'Who led Israel into the Promised Land after Moses died?', ['Joshua', 'Caleb', 'Aaron', 'Gideon'], 'God told Joshua to lead the people across the Jordan into the land.', 'Joshua 1:1-2'],
  ['People', 'What did John the Baptist eat in the wilderness?', ['Locusts and wild honey', 'Manna and quail', 'Bread and fish', 'Figs and dates'], 'John wore camel’s hair, and his food was locusts and wild honey.', 'Matthew 3:4'],
  ['People', 'Who was the first follower of Jesus to be killed for his faith?', ['Stephen', 'James', 'Peter', 'Paul'], 'Stephen prayed for his attackers as they stoned him.', 'Acts 7:59-60'],
  ['Stories', 'Which judge defeated Midian with 300 men, trumpets and jars?', ['Gideon', 'Samson', 'Deborah', 'Jephthah'], 'Gideon’s men blew trumpets and smashed jars, and the enemy fled in confusion.', 'Judges 7:19-22'],
  ['People', 'Which prophet anointed David as king?', ['Samuel', 'Nathan', 'Elijah', 'Isaiah'], 'Samuel anointed David with oil in the presence of his brothers.', '1 Samuel 16:13'],
  ['Events', 'What appeared over the disciples’ heads at Pentecost?', ['Tongues of fire', 'A dove', 'A rainbow', 'A bright cloud'], 'Tongues like fire rested on each of them, and they were filled with the Holy Spirit.', 'Acts 2:1-4'],
  ['People', 'What did Peter and Andrew do for work before following Jesus?', ['They were fishermen', 'They were tax collectors', 'They were carpenters', 'They were shepherds'], 'Jesus called them to leave their nets and become fishers of men.', 'Matthew 4:18-20'],
  ['People', 'Which woman hid two Israelite spies in Jericho?', ['Rahab', 'Deborah', 'Ruth', 'Miriam'], 'Rahab hid the spies on her roof under stalks of flax.', 'Joshua 2:1-6'],
  ['Places', 'What was the name of the place where Jesus was crucified?', ['Golgotha', 'Gethsemane', 'Bethany', 'Emmaus'], 'Golgotha means “the Place of the Skull.”', 'John 19:17'],
  ['Events', 'How many years did Israel wander in the wilderness?', ['Forty', 'Seven', 'Twelve', 'Seventy'], 'Because of unbelief, Israel wandered forty years in the wilderness.', 'Numbers 14:33-34'],
  ['People', 'Who was the father of John the Baptist?', ['Zechariah', 'Joseph', 'Simeon', 'Joachim'], 'An angel told Zechariah that his wife Elizabeth would bear a son named John.', 'Luke 1:13'],
  ['Stories', 'Who read the mysterious handwriting on the wall for King Belshazzar?', ['Daniel', 'Joseph', 'Ezekiel', 'Nehemiah'], 'Daniel explained the message: the king’s kingdom would end.', 'Daniel 5:17-28'],
  ['Events', 'In which two books are the Ten Commandments listed?', ['Exodus and Deuteronomy', 'Genesis and Exodus', 'Leviticus and Numbers', 'Exodus and Leviticus'], 'The commandments appear in Exodus 20 and again in Deuteronomy 5.', 'Deuteronomy 5:6-21'],
  ['Jesus', 'What did Jesus do for His disciples at the Last Supper to model humble service?', ['Washed their feet', 'Baked bread', 'Sang a psalm alone', 'Gave each a gift'], 'Jesus wrapped a towel around Himself and washed His disciples’ feet.', 'John 13:3-5'],
  ['People', 'Which Roman governor sentenced Jesus to be crucified?', ['Pontius Pilate', 'Herod', 'Caesar Augustus', 'Felix'], 'Pilate washed his hands before the crowd and handed Jesus over.', 'Matthew 27:24-26'],
  ['People', 'Who was made to carry Jesus’ cross?', ['Simon of Cyrene', 'Simon Peter', 'Joseph of Arimathea', 'John'], 'Soldiers forced Simon of Cyrene, who was passing by, to carry the cross.', 'Mark 15:21'],
  ['People', 'What new name did God give Jacob?', ['Israel', 'Abraham', 'Judah', 'Peter'], 'After wrestling through the night, Jacob was renamed Israel.', 'Genesis 32:28'],
  ['People', 'Who was Isaac’s wife?', ['Rebekah', 'Rachel', 'Sarah', 'Leah'], 'Isaac married Rebekah and loved her.', 'Genesis 24:67'],
  ['Jesus', 'What did Jesus overturn in the temple courts?', ['The tables of the money changers', 'The altar', 'The lampstand', 'The incense table'], 'Jesus drove out those buying and selling and overturned the money changers’ tables.', 'Matthew 21:12-13'],
  ['Places', 'To which great city did God send Jonah to preach?', ['Nineveh', 'Tarshish', 'Babylon', 'Tyre'], 'Jonah finally went to Nineveh, and the city repented.', 'Jonah 3:3-5'],
  ['People', 'Who laid hands on Saul so that he could see again?', ['Ananias', 'Barnabas', 'Peter', 'Silas'], 'Ananias placed his hands on Saul, and something like scales fell from his eyes.', 'Acts 9:17-18'],
  ['Stories', 'Besides gold and frankincense, what did the wise men bring Jesus?', ['Myrrh', 'Silver', 'Spices', 'Olive oil'], 'The Magi opened their treasures and gave gold, frankincense and myrrh.', 'Matthew 2:11'],
];

const HARD: Row[] = [
  ['People', 'Who was the left-handed judge who defeated King Eglon of Moab?', ['Ehud', 'Othniel', 'Shamgar', 'Jair'], 'Ehud hid a short sword on his right thigh and delivered Israel from Moab.', 'Judges 3:15-21'],
  ['People', 'Which prophet married Gomer as a picture of God’s faithful love?', ['Hosea', 'Amos', 'Micah', 'Joel'], 'God told Hosea to marry Gomer to illustrate His love for unfaithful Israel.', 'Hosea 1:2-3'],
  ['People', 'What was the name of Moses’ wife?', ['Zipporah', 'Miriam', 'Jochebed', 'Keturah'], 'Jethro gave his daughter Zipporah to Moses in marriage.', 'Exodus 2:21'],
  ['People', 'Who was the high priest when Jesus was put on trial?', ['Caiaphas', 'Annas', 'Eli', 'Zadok'], 'Jesus was taken first to Annas, the father-in-law of Caiaphas, the high priest that year.', 'John 18:13'],
  ['People', 'Which king became king at age eight and later found the Book of the Law?', ['Josiah', 'Joash', 'Hezekiah', 'Uzziah'], 'Josiah was eight when he became king; during his reign the Book of the Law was found.', '2 Kings 22:1-8'],
  ['People', 'Who walked with God and then was no more, because God took him?', ['Enoch', 'Elijah', 'Methuselah', 'Lamech'], 'Enoch walked with God, and he was no more, for God took him.', 'Genesis 5:21-24'],
  ['People', 'Which prophetess and judge led Israel with Barak?', ['Deborah', 'Huldah', 'Miriam', 'Anna'], 'Deborah judged Israel and summoned Barak to lead the army against Sisera.', 'Judges 4:4-9'],
  ['People', 'Who killed the commander Sisera with a tent peg?', ['Jael', 'Deborah', 'Delilah', 'Abigail'], 'Jael drove a tent peg through Sisera’s temple while he slept.', 'Judges 4:21'],
  ['Events', 'How many people were saved in Noah’s ark?', ['Eight', 'Two', 'Twelve', 'Seven'], 'Only a few people, eight in all, were saved through water.', '1 Peter 3:20'],
  ['People', 'Who explained the good news about Jesus to the Ethiopian official?', ['Philip', 'Peter', 'Paul', 'Stephen'], 'Philip began with the passage from Isaiah and told him the good news about Jesus.', 'Acts 8:26-35'],
  ['People', 'Who was Timothy’s grandmother, known for her sincere faith?', ['Lois', 'Eunice', 'Lydia', 'Priscilla'], 'Paul remembered the faith that lived first in Timothy’s grandmother Lois and mother Eunice.', '2 Timothy 1:5'],
  ['Places', 'Which church did Jesus describe as lukewarm?', ['Laodicea', 'Ephesus', 'Smyrna', 'Philadelphia'], 'The church in Laodicea was neither hot nor cold.', 'Revelation 3:14-16'],
  ['People', 'Which king of Salem and priest of God Most High blessed Abram?', ['Melchizedek', 'Abimelech', 'Jethro', 'Balaam'], 'Melchizedek brought out bread and wine and blessed Abram.', 'Genesis 14:18-20'],
  ['Stories', 'What did Samson find in the carcass of the lion he had killed?', ['Bees and honey', 'A golden ring', 'A jawbone', 'A sword'], 'Samson found a swarm of bees and honey in the lion’s body.', 'Judges 14:8-9'],
  ['People', 'Who was chosen to replace Judas as an apostle?', ['Matthias', 'Barnabas', 'Silas', 'Joseph called Barsabbas'], 'The lot fell to Matthias, and he was added to the eleven apostles.', 'Acts 1:23-26'],
  ['People', 'Who was the cousin who raised Esther?', ['Mordecai', 'Haman', 'Hegai', 'Xerxes'], 'Mordecai raised Esther as his own daughter.', 'Esther 2:7'],
  ['People', 'Which prophet confronted David after his sin with Bathsheba?', ['Nathan', 'Gad', 'Samuel', 'Elijah'], 'Nathan told a parable about a stolen lamb, then said, “You are that man!”', '2 Samuel 12:1-7'],
  ['Places', 'On which island was John when he received the visions of Revelation?', ['Patmos', 'Crete', 'Cyprus', 'Malta'], 'John was on the island of Patmos because of the word of God.', 'Revelation 1:9'],
  ['Places', 'In which city did people examine the Scriptures daily to check Paul’s teaching?', ['Berea', 'Thessalonica', 'Corinth', 'Athens'], 'The Bereans received the message eagerly and examined the Scriptures every day.', 'Acts 17:10-11'],
  ['People', 'Who was the seller of purple cloth in Philippi whose heart the Lord opened?', ['Lydia', 'Dorcas', 'Priscilla', 'Phoebe'], 'The Lord opened Lydia’s heart to respond to Paul’s message.', 'Acts 16:14'],
  ['Stories', 'Who fell asleep and fell from a window during Paul’s long message?', ['Eutychus', 'Tychicus', 'Trophimus', 'Erastus'], 'Eutychus fell from the third story, and Paul embraced him and he was alive.', 'Acts 20:9-12'],
  ['People', 'Who was the mother of the prophet Samuel?', ['Hannah', 'Peninnah', 'Naomi', 'Elizabeth'], 'Hannah prayed for a son and named him Samuel.', '1 Samuel 1:20'],
  ['People', 'Who succeeded Elijah as prophet?', ['Elisha', 'Gehazi', 'Jonah', 'Micaiah'], 'Elijah threw his cloak around Elisha, who followed him.', '1 Kings 19:16-21'],
  ['Stories', 'Which king dreamed of a statue of gold, silver, bronze, iron and clay?', ['Nebuchadnezzar', 'Belshazzar', 'Darius', 'Cyrus'], 'Daniel explained King Nebuchadnezzar’s dream of the great statue.', 'Daniel 2:31-36'],
  ['People', 'What was the name of the runaway slave Paul wrote to Philemon about?', ['Onesimus', 'Epaphras', 'Archippus', 'Demas'], 'Paul appealed to Philemon for Onesimus, who had become like a son to him.', 'Philemon 1:10-16'],
  ['Places', 'At which pool did Jesus heal a man who had been ill for 38 years?', ['Bethesda', 'Siloam', 'Gihon', 'Hezekiah’s pool'], 'At the pool of Bethesda, Jesus told the man to get up, pick up his mat and walk.', 'John 5:2-9'],
  ['Events', 'How many years in total did Jacob work for Rachel?', ['Fourteen', 'Seven', 'Twenty', 'Ten'], 'Jacob worked seven years, then seven more, to marry Rachel.', 'Genesis 29:20-30'],
  ['People', 'Which prophet saw a valley of dry bones come to life?', ['Ezekiel', 'Jeremiah', 'Daniel', 'Zechariah'], 'God breathed life into the bones as a picture of restoring His people.', 'Ezekiel 37:1-10'],
  ['People', 'Which Persian king allowed the Jews to return and rebuild the temple?', ['Cyrus', 'Xerxes', 'Darius', 'Artaxerxes'], 'Cyrus decreed that the house of the LORD in Jerusalem should be rebuilt.', 'Ezra 1:1-3'],
  ['People', 'Who was the mother of Ishmael?', ['Hagar', 'Sarah', 'Keturah', 'Bilhah'], 'Hagar bore Abram a son, and he named him Ishmael.', 'Genesis 16:15'],
  ['People', 'Who served as cupbearer to King Artaxerxes before rebuilding Jerusalem’s walls?', ['Nehemiah', 'Ezra', 'Zerubbabel', 'Daniel'], 'Nehemiah was the king’s cupbearer when he heard Jerusalem’s walls were broken down.', 'Nehemiah 1:11'],
  ['People', 'Which disciple was known as “the Zealot”?', ['Simon', 'Judas', 'Thaddaeus', 'James'], 'Luke lists Simon who was called the Zealot among the twelve.', 'Luke 6:15'],
  ['Places', 'Where did God confuse the language of the whole earth?', ['Babel', 'Ur', 'Haran', 'Shinar’s river'], 'The city was called Babel because there the LORD confused the language of the world.', 'Genesis 11:9'],
  ['Stories', 'Whose servant was shown hills full of horses and chariots of fire?', ['Elisha’s', 'Elijah’s', 'David’s', 'Gideon’s'], 'Elisha prayed, and the LORD opened his servant’s eyes to see the army of fire.', '2 Kings 6:15-17'],
  ['People', 'What was the name of Abraham’s nephew who settled near Sodom?', ['Lot', 'Laban', 'Nahor', 'Terah'], 'Lot pitched his tent toward Sodom.', 'Genesis 13:10-12'],
  ['People', 'Who was Ruth’s second husband, a relative of Naomi?', ['Boaz', 'Obed', 'Elimelech', 'Mahlon'], 'Boaz redeemed the land and married Ruth.', 'Ruth 4:9-13'],
  ['People', 'Who was the first king of Israel?', ['Saul', 'David', 'Samuel', 'Solomon'], 'Samuel anointed Saul as ruler over the LORD’s inheritance.', '1 Samuel 10:1'],
  ['People', 'Which apostle was Simon Peter’s brother?', ['Andrew', 'John', 'Philip', 'James'], 'Andrew heard John the Baptist and followed Jesus, then brought his brother Simon.', 'John 1:40-42'],
  ['Events', 'Which tribe of Israel was set apart to serve at the tabernacle?', ['Levi', 'Judah', 'Benjamin', 'Ephraim'], 'God told Moses to bring the tribe of Levi to serve Aaron and the tabernacle.', 'Numbers 3:5-9'],
  ['Jesus', 'In which town did Jesus grow up?', ['Nazareth', 'Bethlehem', 'Capernaum', 'Bethsaida'], 'After returning from Egypt, Joseph settled the family in Nazareth.', 'Matthew 2:22-23'],
];

function build(rows: Row[], level: TriviaLevel): TriviaQuestion[] {
  return rows.map(([topic, question, options, explanation, reference], i) => ({
    id: `${level}-${i + 1}`,
    level,
    topic,
    question,
    options,
    explanation,
    reference,
  }));
}

export const TRIVIA: TriviaQuestion[] = [...build(EASY, 'easy'), ...build(MEDIUM, 'medium'), ...build(HARD, 'hard')];

export const TRIVIA_TOPICS: TriviaTopic[] = ['People', 'Places', 'Events', 'Stories', 'Jesus'];
