/* Ten Lists Bible Tracker
   Static, offline-capable PWA. No dependencies, no backend, GitHub Pages friendly.
*/

const STORAGE_KEY = "ten-lists-tracker-v1";

const TRANSLATIONS = ["KJV", "ESV", "LSB", "NASB", "NIV", "NKJV", "NLT"];

const LISTS = [
  {
    id: 1,
    title: "Gospels",
    subtitle: "Matthew, Mark, Luke, John",
    accent: "#4f46e5",
    books: [["Matthew", 28], ["Mark", 16], ["Luke", 24], ["John", 21]],
  },
  {
    id: 2,
    title: "Pentateuch",
    subtitle: "Genesis through Deuteronomy",
    accent: "#0f766e",
    books: [["Genesis", 50], ["Exodus", 40], ["Leviticus", 27], ["Numbers", 36], ["Deuteronomy", 34]],
  },
  {
    id: 3,
    title: "Pauline & Hebrews",
    subtitle: "Romans through Hebrews",
    accent: "#7c3aed",
    books: [["Romans", 16], ["1 Corinthians", 16], ["2 Corinthians", 13], ["Galatians", 6], ["Ephesians", 6], ["Philippians", 4], ["Colossians", 4], ["Hebrews", 13]],
  },
  {
    id: 4,
    title: "Other NT Letters",
    subtitle: "Thessalonians through Revelation",
    accent: "#be123c",
    books: [["1 Thessalonians", 5], ["2 Thessalonians", 3], ["1 Timothy", 6], ["2 Timothy", 4], ["Titus", 3], ["Philemon", 1], ["James", 5], ["1 Peter", 5], ["2 Peter", 3], ["1 John", 5], ["2 John", 1], ["3 John", 1], ["Jude", 1], ["Revelation", 22]],
  },
  {
    id: 5,
    title: "Wisdom",
    subtitle: "Job, Ecclesiastes, Song of Solomon",
    accent: "#a16207",
    books: [["Job", 42], ["Ecclesiastes", 12], ["Song of Solomon", 8]],
  },
  {
    id: 6,
    title: "Psalms",
    subtitle: "All 150 Psalms",
    accent: "#2563eb",
    books: [["Psalms", 150]],
  },
  {
    id: 7,
    title: "Proverbs",
    subtitle: "All 31 Proverbs",
    accent: "#ea580c",
    books: [["Proverbs", 31]],
  },
  {
    id: 8,
    title: "Old Testament History",
    subtitle: "Joshua through Esther",
    accent: "#16a34a",
    books: [["Joshua", 24], ["Judges", 21], ["Ruth", 4], ["1 Samuel", 31], ["2 Samuel", 24], ["1 Kings", 22], ["2 Kings", 25], ["1 Chronicles", 29], ["2 Chronicles", 36], ["Ezra", 10], ["Nehemiah", 13], ["Esther", 10]],
  },
  {
    id: 9,
    title: "Prophets",
    subtitle: "Isaiah through Malachi",
    accent: "#9333ea",
    books: [["Isaiah", 66], ["Jeremiah", 52], ["Lamentations", 5], ["Ezekiel", 48], ["Daniel", 12], ["Hosea", 14], ["Joel", 3], ["Amos", 9], ["Obadiah", 1], ["Jonah", 4], ["Micah", 7], ["Nahum", 3], ["Habakkuk", 3], ["Zephaniah", 3], ["Haggai", 2], ["Zechariah", 14], ["Malachi", 4]],
  },
  {
    id: 10,
    title: "Acts",
    subtitle: "The book of Acts",
    accent: "#0891b2",
    books: [["Acts", 28]],
  },
];

const EXPANDED_LISTS = LISTS.map((list) => ({
  ...list,
  readings: expandReadings(list),
}));

let state = loadState();
let currentView = "today";
let listMode = "current";
let toastTimer;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

document.addEventListener("DOMContentLoaded", init);

function init() {
  applyTheme();
  bindEvents();
  updateInstallBanner();
  renderAll();

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {
        // Service worker registration can fail during local file testing. GitHub Pages is fine.
      });
    });
  }
}

function bindEvents() {
  $("#markAllBtn").addEventListener("click", markAllComplete);
  $("#themeToggle").addEventListener("click", toggleTheme);
  $("#hideInstallTip").addEventListener("click", () => {
    state.settings.showInstallTip = false;
    saveState();
    updateInstallBanner();
  });

  $$(".nav-item").forEach((button) => {
    button.addEventListener("click", () => {
      setView(button.dataset.view);
    });
  });

  $$(".segment").forEach((button) => {
    button.addEventListener("click", () => {
      listMode = button.dataset.listMode;
      $$(".segment").forEach((b) => b.classList.toggle("active", b === button));
      renderLists();
    });
  });

  $("#translationSelect").addEventListener("change", (event) => {
    state.settings.translation = event.target.value;
    saveState();
    renderAll();
    showToast(`Reading links now use ${event.target.value}.`);
  });

  $("#themeSelect").addEventListener("change", (event) => {
    state.settings.theme = event.target.value;
    saveState();
    applyTheme();
  });

  $("#applyStartDateBtn").addEventListener("click", applyStartDate);
  $("#exportBtn").addEventListener("click", exportBackup);
  $("#importInput").addEventListener("change", importBackup);
  $("#resetBtn").addEventListener("click", resetAll);
  $("#clearHistoryBtn").addEventListener("click", clearHistory);
}

function expandReadings(list) {
  const readings = [];
  list.books.forEach(([book, chapters]) => {
    for (let chapter = 1; chapter <= chapters; chapter += 1) {
      readings.push({
        book,
        chapter,
        display: `${book} ${chapter}`,
        search: `${book} ${chapter}`,
      });
    }
  });
  return readings;
}

function defaultState() {
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    startDate: todayKey(),
    progress: Object.fromEntries(LISTS.map((list) => [list.id, 0])),
    completions: {},
    history: [],
    settings: {
      translation: "ESV",
      theme: "system",
      showInstallTip: true,
    },
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
      progress: { ...fallback.progress, ...(parsed.progress || {}) },
      completions: parsed.completions || {},
      history: Array.isArray(parsed.history) ? parsed.history : [],
      settings: { ...fallback.settings, ...(parsed.settings || {}) },
    };
  } catch {
    return fallback;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function todayKey(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function prettyDate(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function todayCompletions() {
  const key = todayKey();
  return state.completions[key] || {};
}

function listById(listId) {
  return EXPANDED_LISTS.find((list) => Number(list.id) === Number(listId));
}

function currentIndex(listId) {
  const list = listById(listId);
  const raw = Number(state.progress[listId] ?? 0);
  return ((raw % list.readings.length) + list.readings.length) % list.readings.length;
}

function readingAt(listId, index = currentIndex(listId)) {
  const list = listById(listId);
  return list.readings[index % list.readings.length];
}

function isCompleteToday(listId) {
  return Boolean(todayCompletions()[listId]);
}

function setView(view) {
  currentView = view;
  $$(".view").forEach((section) => section.classList.toggle("active", section.id === `view-${view}`));
  $$(".nav-item").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
  renderAll();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderAll() {
  renderHeader();
  renderToday();
  renderLists();
  renderHistory();
  renderSettings();
}

function renderHeader() {
  const completeCount = Object.keys(todayCompletions()).length;
  const remaining = 10 - completeCount;
  const circumference = 2 * Math.PI * 52;
  const offset = circumference * (1 - completeCount / 10);

  $("#todayLabel").textContent = prettyDate(todayKey());
  $("#doneCount").textContent = completeCount;
  $("#dailyMessage").textContent =
    completeCount === 10
      ? "All ten readings are complete. Tomorrow picks up right where your bookmarks landed."
      : `${remaining} reading${remaining === 1 ? "" : "s"} left today. No guilt, just keep moving the bookmarks.`;

  const ringFill = $("#ringFill");
  ringFill.style.strokeDasharray = `${circumference}`;
  ringFill.style.strokeDashoffset = `${offset}`;
}

function renderToday() {
  const container = $("#readingGrid");
  container.innerHTML = EXPANDED_LISTS.map(renderReadingCard).join("");

  container.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", handleReadingAction);
  });
}

function renderReadingCard(list) {
  const complete = todayCompletions()[list.id];
  const current = readingAt(list.id);
  const shown = complete || current;
  const status = complete ? "Completed today" : "Current chapter";
  const title = shown.display;
  const upNext = complete ? current.display : null;

  return `
    <article class="reading-card ${complete ? "complete" : ""}" style="--card-accent: ${list.accent}">
      <div class="reading-card__top">
        <div>
          <div class="list-label">List ${list.id} · ${escapeHtml(list.title)}</div>
          <h3 class="reading-title">${escapeHtml(title)}</h3>
          <p class="reading-subtitle">${escapeHtml(status)} · ${escapeHtml(list.subtitle)}</p>
        </div>
        <div class="checkmark" aria-hidden="true">${complete ? "✓" : list.id}</div>
      </div>

      ${complete ? `<div class="up-next"><strong>Up next:</strong> ${escapeHtml(upNext)}</div>` : ""}

      <div class="reading-actions">
        ${
          complete
            ? `<button class="small-button" data-action="undo" data-list-id="${list.id}" type="button">Undo</button>`
            : `<button class="small-button primary" data-action="complete" data-list-id="${list.id}" type="button">Complete</button>`
        }
        <a class="link-button" href="${bibleGatewayUrl(current)}" target="_blank" rel="noopener">BibleGateway</a>
        <a class="link-button" href="${blueLetterBibleUrl(current)}" target="_blank" rel="noopener">BLB</a>
        <button class="small-button" data-action="previous" data-list-id="${list.id}" type="button">Back</button>
        <button class="small-button" data-action="next" data-list-id="${list.id}" type="button">Next</button>
      </div>
    </article>
  `;
}

function handleReadingAction(event) {
  const action = event.currentTarget.dataset.action;
  const listId = Number(event.currentTarget.dataset.listId);

  if (action === "complete") completeReading(listId);
  if (action === "undo") undoComplete(listId);
  if (action === "next") movePointer(listId, 1);
  if (action === "previous") movePointer(listId, -1);
}

function completeReading(listId) {
  if (isCompleteToday(listId)) return;

  const list = listById(listId);
  const index = currentIndex(listId);
  const reading = readingAt(listId, index);
  const date = todayKey();
  const completedAt = new Date().toISOString();
  const historyId = `${date}-${listId}-${Date.now()}`;

  if (!state.completions[date]) state.completions[date] = {};

  state.completions[date][listId] = {
    historyId,
    listId,
    listTitle: list.title,
    index,
    book: reading.book,
    chapter: reading.chapter,
    display: reading.display,
    completedAt,
  };

  state.history.unshift({
    historyId,
    date,
    listId,
    listTitle: list.title,
    book: reading.book,
    chapter: reading.chapter,
    display: reading.display,
    completedAt,
  });

  state.progress[listId] = (index + 1) % list.readings.length;

  saveState();
  renderAll();
  showToast(`${reading.display} marked complete.`);
}

function undoComplete(listId) {
  const date = todayKey();
  const entry = state.completions[date]?.[listId];
  if (!entry) return;

  state.progress[listId] = entry.index;
  state.history = state.history.filter((item) => item.historyId !== entry.historyId);
  delete state.completions[date][listId];

  if (Object.keys(state.completions[date]).length === 0) {
    delete state.completions[date];
  }

  saveState();
  renderAll();
  showToast(`${entry.display} restored.`);
}

function markAllComplete() {
  const remaining = EXPANDED_LISTS.filter((list) => !isCompleteToday(list.id));
  if (!remaining.length) {
    showToast("All ten readings are already complete today.");
    return;
  }

  remaining.forEach((list) => completeReading(list.id));
  showToast("All remaining readings marked complete.");
}

function movePointer(listId, delta) {
  const list = listById(listId);
  const nextIndex = (currentIndex(listId) + delta + list.readings.length) % list.readings.length;
  state.progress[listId] = nextIndex;
  saveState();
  renderAll();
  showToast(`List ${listId} moved to ${readingAt(listId).display}.`);
}

function renderLists() {
  const container = $("#listsContainer");
  container.innerHTML = EXPANDED_LISTS.map(renderListCard).join("");
}

function renderListCard(list) {
  const idx = currentIndex(list.id);
  const progressPercent = Math.round((idx / list.readings.length) * 100);
  const readings =
    listMode === "current"
      ? [list.readings[idx]]
      : listMode === "rest"
        ? list.readings.slice(idx)
        : list.readings;

  const modeLabel =
    listMode === "current" ? "Current chapter" : listMode === "rest" ? "Rest of this list before it loops" : "All chapters";

  return `
    <article class="list-card">
      <div class="list-card__top">
        <div>
          <div class="list-label">List ${list.id}</div>
          <h3>${escapeHtml(list.title)}</h3>
          <p class="muted">${escapeHtml(list.subtitle)} · ${list.readings.length} chapters</p>
        </div>
        <span class="badge">${escapeHtml(modeLabel)}</span>
      </div>
      <div class="list-progress" aria-label="${progressPercent}% through ${escapeHtml(list.title)}">
        <span style="--list-progress: ${progressPercent}%"></span>
      </div>
      <div class="chapter-list">
        ${readings.map((reading, offset) => {
          const globalIndex = listMode === "rest" ? idx + offset : listMode === "current" ? idx : offset;
          const isCurrent = globalIndex === idx;
          return `<a class="chapter-chip ${isCurrent ? "current" : ""}" href="${bibleGatewayUrl(reading)}" target="_blank" rel="noopener">${escapeHtml(reading.display)}</a>`;
        }).join("")}
      </div>
    </article>
  `;
}

function renderHistory() {
  const stats = $("#historyStats");
  const history = state.history || [];
  const uniqueDays = new Set(history.map((item) => item.date)).size;
  const completedToday = Object.keys(todayCompletions()).length;

  stats.innerHTML = `
    <div class="stat-card"><strong>${history.length}</strong><span>Total chapters completed</span></div>
    <div class="stat-card"><strong>${uniqueDays}</strong><span>Reading days logged</span></div>
    <div class="stat-card"><strong>${completedToday}</strong><span>Completed today</span></div>
    <div class="stat-card"><strong>${EXPANDED_LISTS.reduce((sum, list) => sum + list.readings.length, 0)}</strong><span>Chapters in one full ten-list cycle</span></div>
  `;

  const container = $("#historyContainer");
  if (!history.length) {
    container.innerHTML = `<div class="empty-state">No readings logged yet. Complete a chapter and it will show up here.</div>`;
    return;
  }

  const grouped = history.reduce((acc, item) => {
    acc[item.date] = acc[item.date] || [];
    acc[item.date].push(item);
    return acc;
  }, {});

  container.innerHTML = Object.entries(grouped)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => `
      <section class="history-day">
        <h3>${prettyDate(date)} <span>${items.length}/10</span></h3>
        <div class="history-items">
          ${items
            .sort((a, b) => Number(a.listId) - Number(b.listId))
            .map((item) => `
              <div class="history-item">
                <div>
                  <strong>${escapeHtml(item.display)}</strong>
                  <small>List ${item.listId} · ${escapeHtml(item.listTitle)}</small>
                </div>
                <small>${new Date(item.completedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</small>
              </div>
            `)
            .join("")}
        </div>
      </section>
    `)
    .join("");
}

function renderSettings() {
  $("#translationSelect").value = state.settings.translation || "ESV";
  $("#themeSelect").value = state.settings.theme || "system";
  $("#startDateInput").value = state.startDate || todayKey();
}

function bibleGatewayUrl(reading) {
  const version = encodeURIComponent(state.settings.translation || "ESV");
  const passage = encodeURIComponent(reading.search);
  return `https://www.biblegateway.com/passage/?search=${passage}&version=${version}`;
}

function blueLetterBibleUrl(reading) {
  const version = encodeURIComponent(state.settings.translation || "KJV");
  const passage = encodeURIComponent(reading.search);
  return `https://www.blueletterbible.org/search/search.cfm?Criteria=${passage}&t=${version}`;
}

function applyStartDate() {
  const value = $("#startDateInput").value;
  if (!value) {
    showToast("Choose a starting date first.");
    return;
  }

  const ok = confirm("This will recalculate all ten bookmarks from the starting date and clear reading history. Continue?");
  if (!ok) return;

  const start = new Date(`${value}T00:00:00`);
  const now = new Date(`${todayKey()}T00:00:00`);
  const daysElapsed = Math.max(0, Math.floor((now - start) / 86400000));

  state.startDate = value;
  state.progress = Object.fromEntries(
    EXPANDED_LISTS.map((list) => [list.id, daysElapsed % list.readings.length])
  );
  state.completions = {};
  state.history = [];

  saveState();
  renderAll();
  showToast("Progress recalculated from your start date.");
}

function exportBackup() {
  const payload = {
    exportedAt: new Date().toISOString(),
    app: "Ten Lists Bible Tracker",
    state,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ten-lists-backup-${todayKey()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Backup exported.");
}

function importBackup(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const importedState = parsed.state || parsed;

      if (!importedState.progress || !importedState.settings) {
        throw new Error("Invalid backup file.");
      }

      const ok = confirm("Import this backup and replace current progress?");
      if (!ok) return;

      state = {
        ...defaultState(),
        ...importedState,
        progress: { ...defaultState().progress, ...(importedState.progress || {}) },
        completions: importedState.completions || {},
        history: Array.isArray(importedState.history) ? importedState.history : [],
        settings: { ...defaultState().settings, ...(importedState.settings || {}) },
      };

      saveState();
      applyTheme();
      renderAll();
      showToast("Backup imported.");
    } catch (error) {
      showToast("That backup file could not be imported.");
    } finally {
      event.target.value = "";
    }
  };

  reader.readAsText(file);
}

function resetAll() {
  const ok = confirm("Reset every list back to day one and clear today's progress?");
  if (!ok) return;

  state = {
    ...defaultState(),
    settings: { ...state.settings },
  };

  saveState();
  renderAll();
  showToast("All progress reset.");
}

function clearHistory() {
  const ok = confirm("Clear reading history? Current bookmarks will stay where they are.");
  if (!ok) return;

  state.history = [];
  saveState();
  renderAll();
  showToast("History cleared.");
}

function toggleTheme() {
  const current = state.settings.theme || "system";
  state.settings.theme = current === "dark" ? "light" : "dark";
  saveState();
  applyTheme();
  renderSettings();
}

function applyTheme() {
  const setting = state.settings.theme || "system";
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = setting === "dark" || (setting === "system" && prefersDark);
  document.documentElement.classList.toggle("dark", dark);
  $("#themeToggle span").textContent = dark ? "☀" : "☾";
}

function updateInstallBanner() {
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  $("#installBanner").hidden = standalone || state.settings.showInstallTip === false;
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.hidden = false;

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.hidden = true;
  }, 2400);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
