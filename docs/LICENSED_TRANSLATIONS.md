# Licensed Bible translations (NIV, ESV, NLT, NKJV, CSB, NASB)

Abide includes six **public-domain** translations that work offline and can
be published freely: BSB, WEB, KJV, ASV, YLT and Darby.

Popular modern translations like the NIV and ESV are **copyrighted**. The app
can show them through [API.Bible](https://scripture.api.bible) (run by the
American Bible Society), but only with a key, and publishing an app that
shows them needs permission from each publisher.

## Turning it on (for personal testing)

1. Create a free account at <https://scripture.api.bible> and register an app
   to get an **API key**.
2. In the project folder, copy `.env.example` to a new file named `.env` and
   paste your key:
   ```
   EXPO_PUBLIC_API_BIBLE_KEY=your-key-here
   ```
3. Stop and restart `npx expo start`.
4. In the reader, tap the translation button (e.g. **BSB**). Translations your
   key can access become selectable. The ones it can't access stay greyed out.

Notes:
- Licensed text needs an internet connection and is not stored offline.
- Search, verse of the day and quizzes use the bundled translations.
- Variables starting with `EXPO_PUBLIC_` are built into the app. Before you
  publish, move API calls to your own small server so your key stays private.

## What each translation needs before you publish

Which translations API.Bible offers changes over time, and each publisher sets
its own terms. **Always confirm the current terms with the publisher before
you release.** In general:

| Translation | Publisher / rights holder | What to expect |
|---|---|---|
| **NIV** | Biblica (with Zondervan/HarperCollins in North America) | Written permission is needed for app use. Biblica controls digital licensing, and API.Bible access to the NIV is limited. |
| **ESV** | Crossway | Crossway runs its own ESV API (api.esv.org) with free non-commercial use under quotation limits. A commercial or published app needs a license from Crossway. |
| **NLT** | Tyndale House | Tyndale grants app permissions on request (they also offer an NLT API). You must show the copyright notice. |
| **NKJV** | Thomas Nelson (HarperCollins Christian Publishing) | Written permission from HarperCollins is needed for app use. |
| **CSB** | Holman Bible Publishers (Lifeway) | Holman has fairly generous quotation rules but asks that apps request permission. Show the copyright notice. |
| **NASB** | The Lockman Foundation | Lockman requires permission for electronic and app use. Show the copyright notice. |

Common requirements across publishers:
- **Copyright notice**: show the publisher's exact notice wherever the text
  appears (API.Bible returns it with each passage).
- **Quotation limits**: typically no more than a set number of verses at once
  and never a complete book, unless you have a full license.
- **No changes**: the text can't be edited.
- **API.Bible terms**: some publishers require API.Bible's usage reporting
  (FUMS) and its attribution to be included.

**Recommended path:** launch with the bundled public-domain translations (the
BSB reads like a modern translation). After launch, contact the publishers of
the translations your users ask for most.
