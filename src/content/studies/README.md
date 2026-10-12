# Bible study lessons

Each file in this folder is one **series**. Edit them in any text editor.
Save the file and the app reloads on your phone.

## A series file

```json
{
  "id": "who-is-jesus",                 // unique, lowercase-with-dashes
  "title": "Who Is Jesus?",
  "subtitle": "The seven “I am” sayings in John",
  "description": "Shown on the series page.",
  "icon": "openBook",                   // any icon name from src/components/icons/paths.ts
  "tone": "sky",                        // gold | sage | rose | sky | navy
  "status": "planned",                  // optional: shows the series as "Coming soon"
  "lessons": [ ... ]
}
```

## A lesson

```json
{
  "id": "who-is-jesus-1",               // unique across ALL series – never change it once published
  "title": "The Bread of Life",
  "passage": "John 6:25-40",            // the app shows this in the reader's chosen translation
  "keyVerse": "John 6:35",
  "explanation": ["Paragraph one…", "Paragraph two…"],   // aim for ~500–700 words (a 5-minute read)
  "questions": ["Question 1", "Question 2", "Question 3"],
  "application": "One concrete thing to do today.",
  "prayer": "A short closing prayer."
}
```

## Tips

- **Don't paste Bible text into lessons.** Use `passage` and `keyVerse`, and the
  app shows them in whatever translation the reader chose. If you quote a short
  phrase in an explanation, use wording that matches the BSB (the default).
- **Keep it Bible-centered and non-denominational.** Focus on what the passage
  clearly says, and don't take sides on debated doctrines.
- To publish a planned series, write all of its lessons and delete the
  `"status": "planned"` line.
- New series file? Import it in `src/data/studies/index.ts`.
- Run `npm run validate` to check that every Bible reference is valid.
