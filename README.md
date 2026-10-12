# Abide

A calm, Apple-style iPhone app to help you grow closer to God every day: Today, Prayer Journal, Bible Study, Verse Memorization, and Profile.

Built with React Native + Expo (SDK 57) and Expo Router. Everything is stored on your device.

## Run it on your iPhone

1. **Install once on your computer**
   - [Node.js LTS](https://nodejs.org) (v20 or newer)
   - [Git](https://git-scm.com)
2. **Install on your iPhone:** **Expo Go** from the App Store.
3. **Get the code and install packages**
   ```bash
   git clone https://github.com/carlosposada0801-blip/prayer-and-bible-journal-app.git
   cd prayer-and-bible-journal-app
   git checkout claude/dazzling-cray-5ymcro
   npm install
   ```
4. **Start the dev server**
   ```bash
   npx expo start
   ```
5. **Open it:** scan the QR code in the terminal with your iPhone's **Camera** app and tap the banner to open it in Expo Go. Your phone and computer must be on the same Wi-Fi. If they aren't, run `npx expo start --tunnel`.

Saving a file reloads the app on your phone right away. To open the developer menu, shake the phone.

## Project layout

```
src/
  app/                    Screens (Expo Router: every file is a route)
    _layout.tsx           Root stack (sheets will open on top of the tabs)
    (tabs)/_layout.tsx    Native iOS tab bar
    (tabs)/(today)/       Today tab
    (tabs)/prayer/        Prayer Journal tab
    (tabs)/study/         Bible Study tab
    (tabs)/memorize/      Memorize tab
    (tabs)/settings/      Profile / Settings tab
  components/
    ui/                   Design system: AppText, Card, Button, ListGroup, SegmentedControl…
    icons/                Original line icons (cross, dove, olive branch, book, flame…)
  theme/                  Colors (light + dark), typography, spacing, shadows, useTheme()
  store/                  Preferences (saved on-device with SQLite)
  lib/haptics.ts          Haptics that respect the Settings switch
```

## Design system basics

- **Colors:** `src/theme/colors.ts` (cream, gold, navy, sage; each one has a light and a dark value)
- **Text:** `<AppText variant="title2" color="textSecondary">`. Use the `scripture` variants for Bible text (Apple's New York serif).
- **Cards:** `<Card onPress={…}>` gives you the rounded shape, soft shadow, spring press and haptic tap.
- **Icons:** `<Icon name="dove" color={colors.gold} />`. To add one, put a new entry in `icons/paths.ts`.

## Checks

```bash
npm run typecheck
```
