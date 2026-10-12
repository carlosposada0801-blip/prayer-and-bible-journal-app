# More translations: NIV, ESV, NLT, NKJV, CSB, NASB

Abide includes six public-domain translations that work offline: BSB, WEB, KJV, ASV, YLT and Darby.

The popular modern translations are copyrighted, so they aren't stored in this project. Abide loads them from each publisher's official source, using free keys that you get for personal use. After you open a chapter, Abide saves it on your phone, so it loads instantly and works offline from then on.

| Translation | Source | Key in `.env` |
| --- | --- | --- |
| **ESV** | Crossway's ESV API | `EXPO_PUBLIC_ESV_API_KEY` |
| **NLT** | Tyndale's NLT API | `EXPO_PUBLIC_NLT_API_KEY` (works lightly without one) |
| **NIV, NKJV, CSB, NASB** | API.Bible (American Bible Society) | `EXPO_PUBLIC_API_BIBLE_KEY` |

## Setup (about 10 minutes)

1. In the project folder, copy `.env.example` to a new file named `.env`.
2. **ESV:** sign up at <https://api.esv.org>, create an application (choose non-commercial / personal), and copy its token into `EXPO_PUBLIC_ESV_API_KEY`.
3. **NLT:** request a free key at <https://api.nlt.to> and put it in `EXPO_PUBLIC_NLT_API_KEY`. Without a key, Abide uses Tyndale's public test key, which is fine for light reading.
4. **NIV, NKJV, CSB, NASB:** create a free account at <https://scripture.api.bible>, add an app, and copy the key into `EXPO_PUBLIC_API_BIBLE_KEY`.
5. Stop and restart `npx expo start` so the keys are picked up.
6. In the reader, tap the translation button (e.g. **BSB**). Translations with a working key are selectable; the rest stay greyed out.

`.env` is in `.gitignore`, so your keys never get pushed to GitHub.

### If one stays greyed out

API.Bible decides which Bibles each key can read, and its free plan doesn't include every translation. The NIV in particular is often missing. To check which of the four your key can read, open the translation picker. To ask for more, see API.Bible's dashboard (some publishers approve access on request).

## Good to know

- Search, trivia and the verse widget's fallback use the bundled translations. The verse of the day, Bible studies, cross-references and memory verses use whatever translation you've picked, and fall back to the BSB if you're offline and that passage hasn't been saved yet.
- Each publisher's copyright notice appears under the chapter. The publishers ask for this.
- This setup is for your personal copy of the app. If you ever publish Abide for others, you'd need a license from each publisher, and the API keys would need to move to a server (variables starting with `EXPO_PUBLIC_` are built into the app).
