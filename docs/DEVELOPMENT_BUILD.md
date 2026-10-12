# Development build (for widgets, Siri, and your own app icon)

Almost all of Abide runs in **Expo Go**. A few Apple features need native code that Expo Go doesn't include. For those, you make a **development build**: your own copy of the app installed on your iPhone. It works like Expo Go, but it carries Abide's native pieces too.

| Feature | Expo Go | Development build |
| --- | --- | --- |
| Every tab, Bible, plans, prayer, fasting, trivia, memorize, themes | ✅ | ✅ |
| Notifications and reminders | ✅ | ✅ |
| Prayer lock | Passcode only (Expo Go doesn’t allow Face ID) | ✅ Face ID |
| Home and Lock Screen widgets (Verse of the Day, Daily Rhythm) | ❌ | ✅ |
| `abide://` links (the Siri Shortcut, widget taps) | ❌ | ✅ |
| Your own app name and icon on the Home Screen | ❌ | ✅ |
| True Siri App Intents, Focus Filters, Apple Watch | ❌ | Needs extra native Swift code (not built yet) |

## What you need

1. **An Apple Developer account**, $99/year: <https://developer.apple.com/programs/>. A free Apple ID can't install widgets with app groups through EAS.
2. **A free Expo account**: <https://expo.dev/signup>
3. Node.js on your computer (you already have it).

## One-time setup

1. **Pick a unique bundle identifier.** In `app.json`, change `ios.bundleIdentifier` from `com.yourname.abide` to something that's yours, for example `com.carlosposada.abide`. The widgets automatically use the app group `group.<your bundle id>`. EAS creates it for you.
2. **Log in to EAS** (Expo's build service):
   ```bash
   npx eas-cli@latest login
   npx eas-cli@latest init
   ```
   `init` links the project to your Expo account and adds a `projectId` to `app.json`.
3. **Register your iPhone:**
   ```bash
   npx eas-cli@latest device:create
   ```
   Open the link it shows on your iPhone and install the profile (Settings → General → VPN & Device Management). On iOS 16 and newer, also turn on **Settings → Privacy & Security → Developer Mode** and restart when asked.

## Build and install

```bash
npx eas-cli@latest build --profile development --platform ios
```

- When asked, let EAS sign in to your Apple account and create certificates, the app group, and provisioning profiles for you. Answer "yes" to the defaults.
- The build runs in the cloud and takes about 10–20 minutes. You don't need a Mac.
- When it finishes, open the link or QR code on your iPhone and tap **Install**.

`eas.json` already has the `development` profile (`developmentClient: true`, internal distribution).

## Run it

```bash
npx expo start --dev-client
```

Open the new **Abide** app on your iPhone (not Expo Go). It finds your computer's dev server, just like Expo Go did. JavaScript changes still reload instantly. You only rebuild when you add a native package or change `app.json` plugins.

## Add the widgets

1. Open Abide once so it can save today's verse and streak for the widgets.
2. Long-press the Home Screen → **Edit** → **Add Widget** → search **Abide**.
3. Pick **Verse of the Day** (small, medium, or large) or **Daily Rhythm**.
4. For the Lock Screen: long-press the Lock Screen → **Customize** → **Lock Screen** → tap the widget row and add Abide's widgets.

Widgets refresh when you open or leave the app. The verse switches by itself at midnight for the next 7 days.

## Siri: "Give me today's verse"

In Abide go to **Profile → Siri & Shortcuts** and follow the steps there. You make a Shortcut that opens `abide://votd?speak=1`. Abide opens to today's verse and reads it aloud.

A true built-in Siri phrase that works without the Shortcuts app needs an **App Intent** written in Swift (an Expo native module). The same goes for an iOS **Focus Filter**, which lets Focus modes turn on Abide's Quiet Mode by themselves. Until then, Quiet Mode can be switched on in Profile, and it pauses Abide's notifications and celebrations.

## Later: TestFlight and the App Store

```bash
npx eas-cli@latest build --profile production --platform ios
npx eas-cli@latest submit --platform ios
```

Before you submit, add a real app icon (`assets/images/icon.png`, 1024×1024), a privacy policy, and screenshots in App Store Connect.
