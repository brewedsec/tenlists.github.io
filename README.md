# Ten Lists Bible Tracker

A static GitHub Pages Progressive Web App for tracking the Grant Horner Ten Lists Bible reading plan.

## What this is

This is a tracker-first app. It does **not** include copyrighted Bible text. It saves your progress locally and links each reading to BibleGateway and Blue Letter Bible.

## Features

- Today’s 10 readings
- Mark individual chapters complete
- Mark all complete
- Independent bookmark/pointer for each list
- Previous/next controls per list
- Current / rest / all chapter views
- Reading history
- Start-date recalculation
- Translation setting for reading links
- Light/dark/system theme
- Export/import backup
- Offline-capable PWA shell
- iPhone Home Screen friendly

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

Progress is saved in your browser’s local storage. If you clear Safari website data, change devices, or use a different browser, the app will not automatically know your progress. Use **Settings → Export backup** before wiping data or switching devices.

## Customization ideas

- Change colors in `styles.css`.
- Change the default translation in `app.js`.
- Add your own homepage text in `index.html`.
- Replace the generated icon PNGs in `assets/`.
