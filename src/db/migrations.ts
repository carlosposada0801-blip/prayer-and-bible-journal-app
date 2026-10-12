/**
 * Database schema, one entry per version. NEVER edit a migration that has
 * shipped – add a new string to the end instead. The app runs any that the
 * device hasn't run yet, in order.
 */
export const migrations: string[] = [
  // v1 – initial schema
  `
  CREATE TABLE IF NOT EXISTS prayers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    body TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    answered_at TEXT,
    answer_note TEXT,
    person_id INTEGER
  );
  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE COLLATE NOCASE,
    builtin INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS prayer_tags (
    prayer_id INTEGER NOT NULL REFERENCES prayers(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (prayer_id, tag_id)
  );
  INSERT OR IGNORE INTO tags (name, builtin) VALUES
    ('Family', 1), ('Friends', 1), ('Relationships', 1), ('Work', 1), ('School', 1), ('Health', 1),
    ('Thanksgiving', 1), ('Confession', 1), ('Guidance', 1);

  CREATE TABLE IF NOT EXISTS people (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    relationship TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    last_prayed_at TEXT,
    archived INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS gratitude (
    date TEXT NOT NULL,
    position INTEGER NOT NULL,
    text TEXT NOT NULL,
    PRIMARY KEY (date, position)
  );

  CREATE TABLE IF NOT EXISTS guided_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    started_at TEXT NOT NULL,
    duration_sec INTEGER NOT NULL,
    entries TEXT NOT NULL DEFAULT '{}'
  );

  CREATE TABLE IF NOT EXISTS highlights (
    book INTEGER NOT NULL, chapter INTEGER NOT NULL, verse INTEGER NOT NULL,
    color TEXT NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (book, chapter, verse)
  );
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book INTEGER NOT NULL, chapter INTEGER NOT NULL, verse INTEGER NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS notes_verse ON notes (book, chapter, verse);
  CREATE TABLE IF NOT EXISTS bookmarks (
    book INTEGER NOT NULL, chapter INTEGER NOT NULL, verse INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (book, chapter, verse)
  );
  CREATE TABLE IF NOT EXISTS chapters_read (
    book INTEGER NOT NULL, chapter INTEGER NOT NULL,
    read_at TEXT NOT NULL,
    PRIMARY KEY (book, chapter)
  );

  CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY,
    start_date TEXT NOT NULL,
    started_at TEXT NOT NULL,
    completed_at TEXT,
    custom TEXT,
    active INTEGER NOT NULL DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS plan_days (
    plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    day INTEGER NOT NULL,
    completed_at TEXT NOT NULL,
    PRIMARY KEY (plan_id, day)
  );

  CREATE TABLE IF NOT EXISTS study_progress (
    lesson_id TEXT PRIMARY KEY,
    completed_at TEXT,
    answers TEXT NOT NULL DEFAULT '{}'
  );

  CREATE TABLE IF NOT EXISTS memory_verses (
    id TEXT PRIMARY KEY,
    reference TEXT NOT NULL,
    custom INTEGER NOT NULL DEFAULT 0,
    added_at TEXT NOT NULL,
    stage INTEGER NOT NULL DEFAULT 0,
    ease REAL NOT NULL DEFAULT 2.5,
    interval_days REAL NOT NULL DEFAULT 0,
    reps INTEGER NOT NULL DEFAULT 0,
    lapses INTEGER NOT NULL DEFAULT 0,
    due_at TEXT,
    last_reviewed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS xp_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    amount INTEGER NOT NULL,
    source TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS xp_log_date ON xp_log (date);

  CREATE TABLE IF NOT EXISTS trivia_answers (
    question_id TEXT NOT NULL,
    correct INTEGER NOT NULL,
    answered_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS fasts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    focus TEXT NOT NULL DEFAULT '',
    started_at TEXT NOT NULL,
    planned_hours REAL NOT NULL,
    ended_at TEXT,
    completed INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS fast_reflections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fast_id INTEGER NOT NULL REFERENCES fasts(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS activity (
    date TEXT NOT NULL,
    kind TEXT NOT NULL,
    PRIMARY KEY (date, kind)
  );

  CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    unlocked_at TEXT NOT NULL
  );
  `,
  // v2 – licensed translation chapters saved for offline reading
  `
  CREATE TABLE IF NOT EXISTS licensed_chapters (
    translation TEXT NOT NULL,
    book INTEGER NOT NULL,
    chapter INTEGER NOT NULL,
    verses TEXT NOT NULL,
    title TEXT,
    fetched_at TEXT NOT NULL,
    PRIMARY KEY (translation, book, chapter)
  );
  `,
];
