#!/usr/bin/env python3
"""
Builds the offline Bible databases bundled with the app.

    python3 scripts/build-bible-data.py

Downloads public-domain sources into scripts/.cache, then writes:
  assets/bible/<id>.db     one SQLite file per translation (verses table)
  assets/bible/xrefs.db    cross-references (OpenBible.info, CC-BY)
  src/data/bible/books.ts  book names, abbreviations and verse counts

Sources
  KJV, BSB, ASV, YLT, Darby: github.com/scrollmapper/bible_databases
  WEB:                       npm package "world-english-bible" (eBible.org text)
  Cross-references:          openbible.info via scrollmapper/bible_databases
"""
import io
import json
import os
import re
import sqlite3
import tarfile
import urllib.request
from collections import OrderedDict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, "scripts", ".cache")
OUT = os.path.join(ROOT, "assets", "bible")
SCROLLMAPPER = "https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats"
WEB_TGZ = "https://registry.npmjs.org/world-english-bible/-/world-english-bible-1.0.1.tgz"

# (name, abbreviation, testament, genre, WEB file name)
BOOKS = [
    ("Genesis", "Gen", "OT", "Law", "genesis"),
    ("Exodus", "Exod", "OT", "Law", "exodus"),
    ("Leviticus", "Lev", "OT", "Law", "leviticus"),
    ("Numbers", "Num", "OT", "Law", "numbers"),
    ("Deuteronomy", "Deut", "OT", "Law", "deuteronomy"),
    ("Joshua", "Josh", "OT", "History", "joshua"),
    ("Judges", "Judg", "OT", "History", "judges"),
    ("Ruth", "Ruth", "OT", "History", "ruth"),
    ("1 Samuel", "1 Sam", "OT", "History", "1samuel"),
    ("2 Samuel", "2 Sam", "OT", "History", "2samuel"),
    ("1 Kings", "1 Kgs", "OT", "History", "1kings"),
    ("2 Kings", "2 Kgs", "OT", "History", "2kings"),
    ("1 Chronicles", "1 Chr", "OT", "History", "1chronicles"),
    ("2 Chronicles", "2 Chr", "OT", "History", "2chronicles"),
    ("Ezra", "Ezra", "OT", "History", "ezra"),
    ("Nehemiah", "Neh", "OT", "History", "nehemiah"),
    ("Esther", "Esth", "OT", "History", "esther"),
    ("Job", "Job", "OT", "Wisdom", "job"),
    ("Psalms", "Ps", "OT", "Wisdom", "psalms"),
    ("Proverbs", "Prov", "OT", "Wisdom", "proverbs"),
    ("Ecclesiastes", "Eccl", "OT", "Wisdom", "ecclesiastes"),
    ("Song of Solomon", "Song", "OT", "Wisdom", "songofsolomon"),
    ("Isaiah", "Isa", "OT", "Major Prophets", "isaiah"),
    ("Jeremiah", "Jer", "OT", "Major Prophets", "jeremiah"),
    ("Lamentations", "Lam", "OT", "Major Prophets", "lamentations"),
    ("Ezekiel", "Ezek", "OT", "Major Prophets", "ezekiel"),
    ("Daniel", "Dan", "OT", "Major Prophets", "daniel"),
    ("Hosea", "Hos", "OT", "Minor Prophets", "hosea"),
    ("Joel", "Joel", "OT", "Minor Prophets", "joel"),
    ("Amos", "Amos", "OT", "Minor Prophets", "amos"),
    ("Obadiah", "Obad", "OT", "Minor Prophets", "obadiah"),
    ("Jonah", "Jonah", "OT", "Minor Prophets", "jonah"),
    ("Micah", "Mic", "OT", "Minor Prophets", "micah"),
    ("Nahum", "Nah", "OT", "Minor Prophets", "nahum"),
    ("Habakkuk", "Hab", "OT", "Minor Prophets", "habakkuk"),
    ("Zephaniah", "Zeph", "OT", "Minor Prophets", "zephaniah"),
    ("Haggai", "Hag", "OT", "Minor Prophets", "haggai"),
    ("Zechariah", "Zech", "OT", "Minor Prophets", "zechariah"),
    ("Malachi", "Mal", "OT", "Minor Prophets", "malachi"),
    ("Matthew", "Matt", "NT", "Gospels", "matthew"),
    ("Mark", "Mark", "NT", "Gospels", "mark"),
    ("Luke", "Luke", "NT", "Gospels", "luke"),
    ("John", "John", "NT", "Gospels", "john"),
    ("Acts", "Acts", "NT", "History", "acts"),
    ("Romans", "Rom", "NT", "Paul's Letters", "romans"),
    ("1 Corinthians", "1 Cor", "NT", "Paul's Letters", "1corinthians"),
    ("2 Corinthians", "2 Cor", "NT", "Paul's Letters", "2corinthians"),
    ("Galatians", "Gal", "NT", "Paul's Letters", "galatians"),
    ("Ephesians", "Eph", "NT", "Paul's Letters", "ephesians"),
    ("Philippians", "Phil", "NT", "Paul's Letters", "philippians"),
    ("Colossians", "Col", "NT", "Paul's Letters", "colossians"),
    ("1 Thessalonians", "1 Thess", "NT", "Paul's Letters", "1thessalonians"),
    ("2 Thessalonians", "2 Thess", "NT", "Paul's Letters", "2thessalonians"),
    ("1 Timothy", "1 Tim", "NT", "Paul's Letters", "1timothy"),
    ("2 Timothy", "2 Tim", "NT", "Paul's Letters", "2timothy"),
    ("Titus", "Titus", "NT", "Paul's Letters", "titus"),
    ("Philemon", "Phlm", "NT", "Paul's Letters", "philemon"),
    ("Hebrews", "Heb", "NT", "General Epistles", "hebrews"),
    ("James", "Jas", "NT", "General Epistles", "james"),
    ("1 Peter", "1 Pet", "NT", "General Epistles", "1peter"),
    ("2 Peter", "2 Pet", "NT", "General Epistles", "2peter"),
    ("1 John", "1 John", "NT", "General Epistles", "1john"),
    ("2 John", "2 John", "NT", "General Epistles", "2john"),
    ("3 John", "3 John", "NT", "General Epistles", "3john"),
    ("Jude", "Jude", "NT", "General Epistles", "jude"),
    ("Revelation", "Rev", "NT", "Prophecy", "revelation"),
]

# scrollmapper uses roman numerals and a few long names
SCROLLMAPPER_NAMES = {
    "I Samuel": "1 Samuel", "II Samuel": "2 Samuel", "I Kings": "1 Kings", "II Kings": "2 Kings",
    "I Chronicles": "1 Chronicles", "II Chronicles": "2 Chronicles", "I Corinthians": "1 Corinthians",
    "II Corinthians": "2 Corinthians", "I Thessalonians": "1 Thessalonians",
    "II Thessalonians": "2 Thessalonians", "I Timothy": "1 Timothy", "II Timothy": "2 Timothy",
    "I Peter": "1 Peter", "II Peter": "2 Peter", "I John": "1 John", "II John": "2 John",
    "III John": "3 John", "Revelation of John": "Revelation",
}
BOOK_INDEX = {b[0]: i + 1 for i, b in enumerate(BOOKS)}

TRANSLATIONS = ["KJV", "BSB", "ASV", "YLT", "Darby"]


def fetch(url, name):
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, name)
    if not os.path.exists(path):
        print("downloading", url)
        with urllib.request.urlopen(url) as r, open(path, "wb") as f:
            f.write(r.read())
    return path


def book_id(name):
    return BOOK_INDEX[SCROLLMAPPER_NAMES.get(name, name)]


def clean(text, tid):
    text = text.replace("[Selah", "Selah")
    if tid in ("Darby", "KJV", "ASV"):
        text = text.replace("[", "").replace("]", "")
    if tid == "Darby":
        # The source joins some words ("ofGod"); lower→upper never happens inside an English word.
        text = re.sub(r"([a-z])([A-Z])", r"\1 \2", text)
    if tid == "YLT":
        text = text.replace("`", "\u2018")  # YLT marks opening quotes with a backtick
    text = text.replace("*", "")
    return re.sub(r"\s+", " ", text).strip()


def load_scrollmapper(tid):
    data = json.load(open(fetch(f"{SCROLLMAPPER}/json/{tid}.json", f"{tid}.json"), encoding="utf-8"))
    rows = []
    for b in data["books"]:
        bid = book_id(b["name"])
        for ch in b["chapters"]:
            for v in ch["verses"]:
                rows.append((bid, ch["chapter"], v["verse"], clean(v["text"], tid)))
    return rows


def load_web():
    tgz = fetch(WEB_TGZ, "world-english-bible.tgz")
    rows = []
    with tarfile.open(tgz) as tar:
        for i, b in enumerate(BOOKS):
            member = tar.getmember(f"package/json/{b[4]}.json")
            items = json.load(io.TextIOWrapper(tar.extractfile(member), encoding="utf-8"))
            verses = OrderedDict()
            for x in items:
                if x.get("type") in ("paragraph text", "line text") and "verseNumber" in x:
                    key = (x["chapterNumber"], x["verseNumber"])
                    verses[key] = verses.get(key, "") + " " + x["value"]
            for (c, v), text in verses.items():
                rows.append((i + 1, c, v, clean(text, "WEB")))
    return rows


def write_translation(tid, rows):
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, f"{tid.lower()}.db")
    if os.path.exists(path):
        os.remove(path)
    db = sqlite3.connect(path)
    db.execute(
        "CREATE TABLE verses (book INTEGER NOT NULL, chapter INTEGER NOT NULL, verse INTEGER NOT NULL,"
        " text TEXT NOT NULL, PRIMARY KEY (book, chapter, verse)) WITHOUT ROWID"
    )
    db.executemany("INSERT OR REPLACE INTO verses VALUES (?,?,?,?)", rows)
    db.execute("CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT)")
    db.execute("INSERT INTO meta VALUES ('translation', ?)", (tid,))
    db.commit()
    db.execute("VACUUM")
    db.close()
    print(f"{tid}: {len(rows)} verses, {os.path.getsize(path) // 1024} KB")


def write_xrefs():
    path = os.path.join(OUT, "xrefs.db")
    if os.path.exists(path):
        os.remove(path)
    out = sqlite3.connect(path)
    out.execute(
        "CREATE TABLE xrefs (book INTEGER, chapter INTEGER, verse INTEGER,"
        " to_book INTEGER, to_chapter INTEGER, to_verse INTEGER, to_verse_end INTEGER, votes INTEGER)"
    )
    total = 0
    for i in range(7):
        src = sqlite3.connect(fetch(f"{SCROLLMAPPER}/sqlite/extras/cross_references_{i}.db", f"xref_{i}.db"))
        rows = []
        for fb, fc, fv, tb, tc, ts, te, votes in src.execute(
            "SELECT from_book, from_chapter, from_verse, to_book, to_chapter, to_verse_start, to_verse_end, votes"
            " FROM cross_references WHERE votes >= 3"
        ):
            try:
                rows.append((book_id(fb), fc, fv, book_id(tb), tc, ts, te or ts, votes))
            except KeyError:
                continue
        out.executemany("INSERT INTO xrefs VALUES (?,?,?,?,?,?,?,?)", rows)
        total += len(rows)
    # The source files overlap, so de-duplicate, then keep the 10 strongest references per verse.
    out.execute("CREATE TABLE dedup AS SELECT DISTINCT * FROM xrefs")
    out.execute("DROP TABLE xrefs")
    out.execute("ALTER TABLE dedup RENAME TO xrefs")
    out.execute(
        "DELETE FROM xrefs WHERE rowid IN (SELECT rowid FROM (SELECT rowid, ROW_NUMBER() OVER"
        " (PARTITION BY book, chapter, verse ORDER BY votes DESC) AS rn FROM xrefs) WHERE rn > 10)"
    )
    out.execute("CREATE INDEX xrefs_from ON xrefs (book, chapter, verse)")
    out.commit()
    kept = out.execute("SELECT COUNT(*) FROM xrefs").fetchone()[0]
    out.execute("VACUUM")
    out.close()
    print(f"xrefs: {kept} of {total} kept, {os.path.getsize(path) // 1024} KB")


def write_books_ts(kjv_rows):
    counts = {}
    for b, c, v, _ in kjv_rows:
        counts.setdefault(b, {}).setdefault(c, 0)
        counts[b][c] = max(counts[b][c], v)
    lines = [
        "// Generated by scripts/build-bible-data.py – do not edit by hand.",
        "",
        "export type Testament = 'OT' | 'NT';",
        "",
        "export type BookInfo = {",
        "  /** 1 = Genesis … 66 = Revelation */",
        "  id: number;",
        "  name: string;",
        "  abbr: string;",
        "  testament: Testament;",
        "  genre: string;",
        "  /** Number of verses in each chapter (index 0 = chapter 1). */",
        "  verses: number[];",
        "};",
        "",
        "export const BOOKS: BookInfo[] = [",
    ]
    for i, (name, abbr, testament, genre, _) in enumerate(BOOKS):
        bid = i + 1
        verses = [counts[bid][c] for c in sorted(counts[bid])]
        lines.append(
            f"  {{ id: {bid}, name: {json.dumps(name)}, abbr: {json.dumps(abbr)}, testament: '{testament}',"
            f" genre: {json.dumps(genre)}, verses: {json.dumps(verses, separators=(',', ':')).replace(',', ', ')} }},"
        )
    lines.append("];")
    lines.append("")
    path = os.path.join(ROOT, "src", "data", "bible", "books.ts")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print("wrote", os.path.relpath(path, ROOT))


def main():
    kjv = None
    for tid in TRANSLATIONS:
        rows = load_scrollmapper(tid)
        write_translation(tid, rows)
        if tid == "KJV":
            kjv = rows
    write_translation("WEB", load_web())
    write_xrefs()
    write_books_ts(kjv)


if __name__ == "__main__":
    main()
