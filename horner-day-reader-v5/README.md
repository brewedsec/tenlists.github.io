# Ten Lists Day Reader

A simplified GitHub Pages PWA inspired by Professor Grant Horner's Ten Lists Bible reading system.

## What changed in this refresh

This version removes the old tracker/dashboard/history workflow. Instead, it works from one number:

> Type the day you are reading, and the app shows the ten chapters for that day.

If you just finished Day 9, enter Day 10.

## Files

- `index.html` — app shell
- `styles.css` — responsive dark/neutral UI
- `app.js` — day-number calculator and links
- `sw.js` — network-first service worker with old-cache cleanup
- `manifest.webmanifest` — Home Screen/PWA metadata
- `assets/` — icons

## Deploy to GitHub Pages

1. Unzip this package.
2. Copy all files into your GitHub Pages repo root.
3. Commit and push.
4. Open your Pages URL.
5. On iPhone, open in Safari and use Share → Add to Home Screen.

## Day logic

Day 1 is the first chapter in every list. Day 2 is the second chapter in every list. When a list reaches its end, it wraps back to the beginning.

For example, the Gospels list has 89 chapters. Day 90 returns to Matthew 1 for that list.

## Notes

The app does not store Bible text. It opens BibleGateway and Blue Letter Bible links for the selected chapter/translation.
