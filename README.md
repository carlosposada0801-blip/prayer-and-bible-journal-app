# Abide

A calm, Apple-style iPhone app to help you grow closer to God every day. It brings together the Bible, reading plans, Bible studies, a prayer journal, fasting, verse memorization, and trivia in one quiet place.

Built with React Native + Expo (SDK 57) and Expo Router. Everything is stored on your device with SQLite. There are no accounts and no tracking.

## What's inside

| Tab | Features |
| --- | --- |
| **Today** | Greeting, verse of the day (listen, share, open in the Bible), today's plan reading and lesson, a gentle streak, quick links |
| **Bible** | **Read:** six offline translations (BSB, WEB, KJV, ASV, YLT, Darby) plus NIV, ESV, NLT, NKJV, CSB and NASB with free keys, quick switcher, side-by-side compare, highlights, notes, bookmarks, cross-references, read-aloud with speed and auto-continue, search. **Plans:** about 135 reading plans (chronological, whole Bible, each book, topical, seasonal, character plans), catch-up tools, reminders, and a custom plan builder. **Studies:** daily lesson series with questions, application, and prayer |
| **Prayer** | Journal with tags, answered prayers and a timeline, search and filters, Face ID lock, PDF export. Guided ACTS prayer with a timer. A prayer list for people with a daily "pray for" reminder. A gratitude log. A fasting tracker with a live timer, reflections, and history |
| **Grow** | **Memorize:** a Duolingo-style path with Grace the lamb, five quiz types, hearts, XP, spaced review, and My Verses. **Trivia:** Easy/Medium/Hard by book and topic, with explanations. **People:** 18 Bible character profiles linked to plans |
| **Profile** | Stats, 27 badges, unlockable themes, separate reminder times, translation, text size, appearance, haptics, Quiet Mode, Siri & Shortcuts |

On Apple devices, a development build adds Home and Lock Screen widgets (Verse of the Day, Daily Rhythm) and a Siri Shortcut: "Give me today's verse." See [docs/DEVELOPMENT_BUILD.md](docs/DEVELOPMENT_BUILD.md).

## Run it on your iPhone (Expo Go)

1. **Install once on your computer:** [Node.js LTS](https://nodejs.org) (v20 or newer) and [Git](https://git-scm.com).
2. **On your iPhone:** install **Expo Go** from the App Store.
3. **Get the code:**
   ```bash
   git clone https://github.com/carlosposada0801-blip/prayer-and-bible-journal-app.git
   cd prayer-and-bible-journal-app
   git checkout claude/dazzling-cray-5ymcro
   npm install
   ```
4. **Start it:** `npx expo start`
5. **Open it:** scan the QR code with your iPhone's Camera and tap the banner. Your phone and computer need to be on the same Wi-Fi; if they aren't, use `npx expo start --tunnel`.

Shake the phone to open the developer menu.

## Project layout

```
src/
  app/                  Screens (Expo Router: every file is a route)
    _layout.tsx         Root stack: sheets and modals, reminders, widgets, badges
    (tabs)/             Native iOS tab bar: (today), bible, prayer, grow, profile
    *.tsx               Sheets: chapter-picker, verse-note, prayer-editor, practice, votd…
  components/           Design system (ui/), icons, and feature components
  content/studies/      Bible study series (editable JSON; see the README there)
  data/                 Books, translations, plans, trivia, characters, badges, memory verses
  db/                   SQLite tables and queries (prayers, plans, memorize, fasting…)
  lib/                  Bible engine, audio, notifications, widgets, quiz logic, PDF export
  store/                Preferences
  theme/                Colors (light + dark), typography, spacing, themes
  widgets/              iOS widgets (development build only)
assets/bible/           Bundled translations as SQLite files, plus cross-references
scripts/                Bible data builder and content validator
```

## Editing content

- **Bible studies:** add or edit a JSON file in `src/content/studies/`. Instructions are in `src/content/studies/README.md`.
- **Reading plans:** `src/data/plans/curated.ts` (topical, seasonal, and character plans) and `src/data/plans/index.ts` (generated plans).
- **Trivia:** `src/data/trivia.ts`. The correct answer always goes first in `options`; the app shuffles them.
- **Memory verses:** `src/data/memorize.ts`. **Verses of the day:** `src/data/verses-of-the-day.ts`.

After editing, check every Bible reference:

```bash
npm run validate     # checks that every reference exists in the Bible
npm run typecheck
```

## Bible translations

The six bundled translations are public domain (the BSB was dedicated to the public domain in 2023). To rebuild them: `npm run build:bible` (needs Python 3 and internet).

NIV, ESV, NLT, NKJV, CSB, and NASB also work: add your free personal keys to `.env` (copy `.env.example`). Chapters you open are saved on your phone for offline reading. Steps are in [docs/LICENSED_TRANSLATIONS.md](docs/LICENSED_TRANSLATIONS.md).

## Later (planned, not built)

Accounts and cloud sync, prayer groups, App Intents for Siri and Focus Filters, Apple Watch, and App Store release. The folders and data model are kept simple so these can be added without rewrites.
