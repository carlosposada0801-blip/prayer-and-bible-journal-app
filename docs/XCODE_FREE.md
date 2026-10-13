# Install Abide on your iPhone with Xcode (free Apple ID)

This installs Abide as a real app on your Home Screen. It runs without your computer and costs nothing. You need a **Mac**.

**The catch:** Apple makes apps signed with a free Apple ID stop opening after **7 days**. To refresh it, plug in your phone and run the same command again (about 2 minutes). Your prayers, notes and progress stay as long as you don't delete the app.

**Free mode leaves out:** Home Screen widgets (they need a paid account). Everything else works, including reminders, Face ID, read-aloud and all the tabs.

## One-time setup

1. **Install Xcode** from the Mac App Store (it's large, so give it a while). Open it once and let it install its extra components.
2. **Add your Apple ID to Xcode:** Xcode → Settings → Accounts → **+** → Apple ID. It will show up as "(Personal Team)".
3. **Install the tools** (if you haven't already): [Node.js LTS](https://nodejs.org), then in Terminal:
   ```bash
   xcode-select --install          # command-line tools (skip if it says they're installed)
   brew install cocoapods          # needs Homebrew (brew.sh); or: sudo gem install cocoapods
   ```
4. **Get the code** (skip if you already did):
   ```bash
   git clone https://github.com/carlosposada0801-blip/prayer-and-bible-journal-app.git
   cd prayer-and-bible-journal-app
   git checkout claude/dazzling-cray-5ymcro
   npm install
   ```
5. **Give the app your own ID.** Open `app.json` and change
   `"bundleIdentifier": "com.yourname.abide"` to something unique, like `"com.carlosposada.abide"`. Apple won't let two people use the same one.
6. **On your iPhone:** Settings → Privacy & Security → **Developer Mode** → on, then restart when asked. (The switch appears after you've plugged the phone into a Mac with Xcode once.)

## Install it

1. Plug your iPhone into the Mac with a cable, unlock it, and tap **Trust** if asked.
2. In the project folder run:
   ```bash
   npm run ios:free
   ```
   - Pick your iPhone from the list.
   - If it asks for a signing team, pick your **Personal Team**.
   - The first build takes 5–15 minutes. Later ones are faster.
3. The first time, iPhone will say "Untrusted Developer". Go to **Settings → General → VPN & Device Management**, tap your Apple ID, and tap **Trust**.
4. Open Abide from your Home Screen. 🎉

## Every 7 days

Plug in the phone and run `npm run ios:free` again. Do the same after you pull new changes from GitHub.

## Want live editing instead?

`npm run ios:free:dev` installs a development version that loads the app from your Mac (run `npx expo start --dev-client` alongside it). Changes appear instantly, but it needs the Mac running, just like Expo Go.

## If something goes wrong

- **"No profiles for … were found" or "Failed to register bundle identifier"**: the bundle ID is taken. Change it in `app.json` (step 5) and try again.
- **"Personal development teams do not support …"**: make sure you ran `npm run ios:free` (not `npx expo run:ios`). The `ios:free` script turns off the features free accounts can't use.
- **Signing errors after changing things**: delete the generated `ios` folder (`rm -rf ios`) and run the command again.
- **Limits:** a free Apple ID can have 3 of your own apps installed on a device at once.
