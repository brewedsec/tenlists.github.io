# Ten Lists Bible Tracker

A static GitHub Pages Progressive Web App for tracking and studying the Grant Horner Ten Lists Bible reading plan.

## What this is

This is a tracker-first app. It does **not** include copyrighted Bible text. It saves your progress locally and links each reading to BibleGateway and Blue Letter Bible.

## Features

- Today’s 10 readings
- Mark individual chapters complete
- Mark all complete
- Independent bookmark/pointer for each list
- Previous/next controls per list
- Study notes per chapter with simple reflection prompts
- Calendar planner for future reading previews
- Current / rest / all chapter views
- Reading history
- Start-date recalculation
- Translation setting for reading links
- Light/dark/system theme
- Export/import backup
- Offline-capable PWA shell
- iPhone Home Screen friendly

## New in this version

- Added app update handling so GitHub Pages changes show up without clearing Safari cookies/site data.
- The service worker now uses network-first fetching for HTML, CSS, JavaScript, and the web app manifest.
- Added cache-busted CSS/JS references.
- Added **Settings → App updates → Check for updates**.
- Added **Settings → App updates → Refresh app files**, which clears only this app’s cached shell and service worker while keeping progress/notes in local storage.
- Kept the study notes, planner, and responsive layout improvements from v3.

## How the Planner works

The Planner is preview-only. It does not change your saved bookmarks.

Future dates assume you complete one full ten-list day per calendar day. For example, tomorrow shows the readings you would see after completing today’s set. If you have already completed some lists today, the Planner accounts for that list-by-list.

## Deploy to GitHub Pages

1. Create a GitHub repository.
2. Copy all files in this folder into the repository root.
3. Commit and push.
4. Go to **Settings → Pages**.
5. Set the source to your `main` branch and `/root`.
6. Save.
7. Open the GitHub Pages URL.

GitHub Pages normally expects an `index.html` file at the top level of the publishing source.

## Add to iPhone Home Screen

1. Open the published site in Safari on your iPhone.
2. Tap the Share button.
3. Tap **Add to Home Screen**.
4. Tap **Add**.

The app will open like a standalone web app and save progress on that device.

## Important storage note

Progress and notes are saved in your browser’s local storage. If you clear Safari website data, change devices, or use a different browser, the app will not automatically know your progress. Use **Settings → Export backup** before wiping data or switching devices.

## Updating from the first version

Copy these new files over your existing GitHub Pages files and commit the changes. Your saved progress should migrate automatically from the first local storage key when you open the app on the same device/browser.

This version should update much more cleanly. If your iPhone still shows old files after a deploy, open **Settings → App updates** inside the tracker and tap **Check for updates**. If that still does not do it, tap **Refresh app files**. That clears only the PWA app-shell cache/service worker and reloads from GitHub Pages; it does **not** wipe your reading progress or notes.

## Customization ideas

- Change colors in `styles.css`.
- Change the default translation in `app.js`.
- Add your own homepage text in `index.html`.
- Replace the generated icon PNGs in `assets/`.

## Study notes

Each reading card has a **Study** button. Notes are saved per chapter, included in exports, and intentionally kept local to the device. This is useful for observations, cross references, questions, and prayer/application notes.
