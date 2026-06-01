/* Ten Lists Day Reader — simple day-number calculator for GitHub Pages. */

const APP_VERSION = "2.0.0";
const STORAGE_KEY = "ten-lists-day-reader-v1";
const LEGACY_STORAGE_KEYS = ["ten-lists-tracker-v3", "ten-lists-tracker-v2", "ten-lists-tracker-v1"];

const TRANSLATIONS = ["KJV", "ESV", "LSB", "NASB", "NIV", "NKJV", "NLT"];

const LISTS = [
  {
    id: 1,
    title: "Gospels",
    subtitle: "Matthew, Mark, Luke, John",
    books: [["Matthew", 28], ["Mark", 16], ["Luke", 24], ["John", 21]],
  },
  {
    id: 2,
    title: "Pentateuch",
    subtitle: "Genesis through Deuteronomy",
    books: [["Genesis", 50], ["Exodus", 40], ["Leviticus", 27], ["Numbers", 36], ["Deuteronomy", 34]],
  },
  {
    id: 3,
    title: "Pauline & Hebrews",
    subtitle: "Romans through Hebrews",
    books: [["Romans", 16], ["1 Corinthians", 16], ["2 Corinthians", 13], ["Galatians", 6], ["Ephesians", 6], ["Philippians", 4], ["Colossians", 4], ["Hebrews", 13]],
  },
  {
    id: 4,
    title: "Other NT Letters",
    subtitle: "Thessalonians through Revelation",
    books: [["1 Thessalonians", 5], ["2 Thessalonians", 3], ["1 Timothy", 6], ["2 Timothy", 4], ["Titus", 3], ["Philemon", 1], ["James", 5], ["1 Peter", 5], ["2 Peter", 3], ["1 John", 5], ["2 John", 1], ["3 John", 1], ["Jude", 1], ["Revelation", 22]],
  },
  {
    id: 5,
    title: "Wisdom",
    subtitle: "Job, Ecclesiastes, Song of Solomon",
    books: [["Job", 42], ["Ecclesiastes", 12], ["Song of Solomon", 8]],
  },
  {
    id: 6,
    title: "Psalms",
    subtitle: "All 150 Psalms",
    books: [["Psalms", 150]],
  },
  {
    id: 7,
    title: "Proverbs",
    subtitle: "All 31 Proverbs",
    books: [["Proverbs", 31]],
  },
  {
    id: 8,
    title: "Old Testament History",
    subtitle: "Joshua through Esther",
    books: [["Joshua", 24], ["Judges", 21], ["Ruth", 4], ["1 Samuel", 31], ["2 Samuel", 24], ["1 Kings", 22], ["2 Kings", 25], ["1 Chronicles", 29], ["2 Chronicles", 36], ["Ezra", 10], ["Nehemiah", 13], ["Esther", 10]],
  },
  {
    id: 9,
    title: "Prophets",
    subtitle: "Isaiah through Malachi",
    books: [["Isaiah", 66], ["Jeremiah", 52], ["Lamentations", 5], ["Ezekiel", 48], ["Daniel", 12], ["Hosea", 14], ["Joel", 3], ["Amos", 9], ["Obadiah", 1], ["Jonah", 4], ["Micah", 7], ["Nahum", 3], ["Habakkuk", 3], ["Zephaniah", 3], ["Haggai", 2], ["Zechariah", 14], ["Malachi", 4]],
  },
  {
    id: 10,
    title: "Acts",
    subtitle: "The book of Acts",
    books: [["Acts", 28]],
  },
];

const EXPANDED_LISTS = LISTS.map((list) => ({ ...list, readings: expandReadings(list) }));

const $ = (selector) => document.querySelector(selector);
let state = loadState();
let toastTimer;

document.addEventListener("DOMContentLoaded", init);

function init() {
  cleanRefreshUrl();
  applyTheme();
  bindEvents();
  render();
  registerServiceWorker();
}

function bindEvents() {
  $("#dayInput").addEventListener("input", handleDayInput);
  $("#dayForm").addEventListener("submit", (event) => event.preventDefault());
  $("#prevDayBtn").addEventListener("click", () => changeDay(-1));
  $("#nextDayBtn").addEventListener("click", () => changeDay(1));
  $("#copyBtn").addEventListener("click", copyReadings);
  $("#translationSelect").addEventListener("change", (event) => {
    state.translation = normalizeTranslation(event.target.value);
    saveState();
    render();
  });
  $("#themeToggle").addEventListener("click", toggleTheme);
  $("#refreshFilesBtn").addEventListener("click", refreshAppFiles);
}

function expandReadings(list) {
  const readings = [];
  list.books.forEach(([book, chapters]) => {
    for (let chapter = 1; chapter <= chapters; chapter += 1) {
      readings.push({ book, chapter, display: `${book} ${chapter}` });
    }
  });
  return readings;
}

function defaultState() {
  return {
    version: APP_VERSION,
    dayToRead: inferDayFromLegacyStorage() || 1,
    translation: "ESV",
    theme: "system",
  };
}

function loadState() {
  const fallback = defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return {
      ...fallback,
      ...parsed,
      dayToRead: validDay(parsed.dayToRead) ? Number(parsed.dayToRead) : fallback.dayToRead,
      translation: normalizeTranslation(parsed.translation || fallback.translation),
      theme: ["system", "light", "dark"].includes(parsed.theme) ? parsed.theme : fallback.theme,
    };
  } catch {
    return fallback;
  }
}

function inferDayFromLegacyStorage() {
  try {
    for (const key of LEGACY_STORAGE_KEYS) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed.history) && parsed.history.length >= 10) {
        return Math.floor(parsed.history.length / 10) + 1;
      }

      if (parsed.progress && typeof parsed.progress === "object") {
        const values = Object.values(parsed.progress)
          .map((value) => Number(value))
          .filter((value) => Number.isFinite(value) && value >= 0);
        if (values.length) return Math.max(...values) + 1;
      }
    }
  } catch {
    return null;
  }
  return null;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, version: APP_VERSION }));
}

function handleDayInput(event) {
  const value = Number(event.target.value);
  if (!validDay(value)) {
    $("#dayError").hidden = false;
    return;
  }
  $("#dayError").hidden = true;
  state.dayToRead = Math.floor(value);
  saveState();
  render();
}

function validDay(value) {
  return Number.isFinite(Number(value)) && Number(value) >= 1 && Number.isInteger(Number(value));
}

function changeDay(delta) {
  state.dayToRead = Math.max(1, Number(state.dayToRead || 1) + delta);
  saveState();
  render({ focusInput: true });
}

function render(options = {}) {
  const day = Math.max(1, Number(state.dayToRead || 1));
  const readings = readingsForDay(day);

  $("#dayInput").value = String(day);
  $("#translationSelect").value = state.translation;
  $("#readingsTitle").textContent = `Day ${formatNumber(day)} readings`;
  $("#readingsSummary").textContent = `These are the ten chapters for Day ${formatNumber(day)}. Each list advances one chapter and wraps at its own length.`;
  $("#cycleSummary").textContent = buildCycleSummary(readings, day);
  $("#appVersionLabel").textContent = `Version ${APP_VERSION}`;
  $("#readingGrid").innerHTML = readings.map(readingCard).join("");

  if (options.focusInput) {
    $("#dayInput").focus({ preventScroll: true });
    $("#dayInput").select();
  }
}

function readingsForDay(day) {
  return EXPANDED_LISTS.map((list) => {
    const index = (day - 1) % list.readings.length;
    const reading = list.readings[index];
    return {
      listId: list.id,
      listTitle: list.title,
      listSubtitle: list.subtitle,
      cycleDay: index + 1,
      cycleLength: list.readings.length,
      book: reading.book,
      chapter: reading.chapter,
      display: reading.display,
    };
  });
}

function readingCard(reading) {
  return `
    <article class="reading-card">
      <div class="reading-card__top">
        <div>
          <div class="list-meta">List ${reading.listId} · ${escapeHtml(reading.listTitle)}</div>
          <h3 class="reading-title">${escapeHtml(reading.display)}</h3>
          <p class="reading-subtitle">${escapeHtml(reading.listSubtitle)} · position ${reading.cycleDay}/${reading.cycleLength}</p>
        </div>
        <div class="list-number" aria-hidden="true">${reading.listId}</div>
      </div>
      <div class="link-row">
        <a class="link-button" href="${bibleGatewayUrl(reading)}" target="_blank" rel="noopener">BibleGateway</a>
        <a class="ghost-button" href="${blueLetterBibleUrl(reading)}" target="_blank" rel="noopener">BLB</a>
      </div>
    </article>
  `;
}

function buildCycleSummary(readings, day) {
  const shortest = readings.reduce((min, reading) => reading.cycleLength < min.cycleLength ? reading : min, readings[0]);
  const longest = readings.reduce((max, reading) => reading.cycleLength > max.cycleLength ? reading : max, readings[0]);
  return `Day ${formatNumber(day)} is position ${shortest.cycleDay}/${shortest.cycleLength} in ${shortest.listTitle} and position ${longest.cycleDay}/${longest.cycleLength} in ${longest.listTitle}.`;
}

async function copyReadings() {
  const day = Number(state.dayToRead || 1);
  const lines = readingsForDay(day).map((reading) => `${reading.listId}. ${reading.display}`);
  const text = `Ten Lists — Day ${day}\n${lines.join("\n")}`;

  try {
    await navigator.clipboard.writeText(text);
    showToast("Readings copied.");
  } catch {
    showToast("Copy failed. Long-press and copy from the page instead.");
  }
}

function bibleGatewayUrl(reading) {
  const passage = encodeURIComponent(`${reading.book} ${reading.chapter}`);
  const version = encodeURIComponent(state.translation);
  return `https://www.biblegateway.com/passage/?search=${passage}&version=${version}`;
}

function blueLetterBibleUrl(reading) {
  const version = state.translation.toLowerCase();
  const book = encodeURIComponent(reading.book.replace(/\s+/g, ""));
  return `https://www.blueletterbible.org/${version}/${book}/${reading.chapter}/1/`;
}

function normalizeTranslation(value) {
  return TRANSLATIONS.includes(value) ? value : "ESV";
}

function toggleTheme() {
  const next = document.documentElement.classList.contains("dark") ? "light" : "dark";
  state.theme = next;
  saveState();
  applyTheme();
}

function applyTheme() {
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const shouldUseDark = state.theme === "dark" || (state.theme === "system" && prefersDark);
  document.documentElement.classList.toggle("dark", shouldUseDark);
  $("#themeToggle span").textContent = shouldUseDark ? "☼" : "☾";
}

async function refreshAppFiles() {
  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key.startsWith("ten-lists")).map((key) => caches.delete(key)));
    }

    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.update()));
    }

    const url = new URL(window.location.href);
    url.searchParams.set("refresh", String(Date.now()));
    window.location.replace(url.toString());
  } catch {
    window.location.reload();
  }
}

function cleanRefreshUrl() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("refresh")) return;
  url.searchParams.delete("refresh");
  window.history.replaceState({}, document.title, url.pathname + url.search + url.hash);
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  let reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloaded) return;
    reloaded = true;
    window.location.reload();
  });

  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register(`./sw.js?v=${APP_VERSION}`, { updateViaCache: "none" });
      if (registration.waiting) registration.waiting.postMessage({ type: "SKIP_WAITING" });
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            worker.postMessage({ type: "SKIP_WAITING" });
          }
        });
      });
      await registration.update();
    } catch {
      // Local file testing may fail. GitHub Pages deployment is supported.
    }
  });
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function formatNumber(value) {
  return new Intl.NumberFormat().format(value);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
