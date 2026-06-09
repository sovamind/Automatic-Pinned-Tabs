function uuid() {
  return crypto.randomUUID();
}

const DEFAULT_TABS = [
  { url: "https://code.sovamind.com", id: uuid() },
  { url: "https://www.karmicproject.org", id: uuid() },
  { url: "https://www.404media.org", id: uuid() }
];

async function loadAndRepairPinnedList() {
  return new Promise((resolve) => {
    // Load LOCAL first
    chrome.storage.local.get(["pinnedUrls"], (localData) => {
      let localList = localData.pinnedUrls;

      // If local exists and is valid → use it
      if (Array.isArray(localList)) {
        return resolve({ list: localList, status: "ok" });
      }

      // Otherwise fall back to SYNC
      chrome.storage.sync.get(["pinnedUrls"], (syncData) => {
        let list = syncData.pinnedUrls;
        let status = "ok";

        // Case 1: Missing or not an array → unrecoverable corruption
        if (!Array.isArray(list)) {
          chrome.storage.local.set({ pinnedUrls: DEFAULT_TABS });
          chrome.storage.sync.set({ pinnedUrls: DEFAULT_TABS });
          return resolve({ list: DEFAULT_TABS, status: "rebuilt" });
        }

        // Detect corruption
        let corrupt = false;
        let repairable = true;

        for (const item of list) {
          if (typeof item === "string") continue;
          if (item === null || item === undefined) {
            corrupt = true;
            repairable = false;
            break;
          }
          if (typeof item === "object") {
            if (!item.url || typeof item.url !== "string") {
              corrupt = true;
              repairable = false;
              break;
            }
          }
          if (typeof item === "string" && item.includes("[object Object]")) {
            corrupt = true;
            repairable = false;
            break;
          }
        }

        // Case 2: Corrupted but repairable (string-only list)
        if (!corrupt && list.some((i) => typeof i === "string")) {
          const migrated = list.map((url) => ({ url, id: uuid() }));
          chrome.storage.local.set({ pinnedUrls: migrated });
          chrome.storage.sync.set({ pinnedUrls: migrated });
          return resolve({ list: migrated, status: "migrated" });
        }

        // Case 3: Corrupted but repairable (objects missing IDs)
        if (!corrupt && list.some((i) => typeof i === "object" && !i.id)) {
          const fixed = list.map((item) => {
            if (!item.id) item.id = uuid();
            return item;
          });
          chrome.storage.local.set({ pinnedUrls: fixed });
          chrome.storage.sync.set({ pinnedUrls: fixed });
          return resolve({ list: fixed, status: "fixed" });
        }

        // Case 4: Corrupted and NOT repairable
        if (corrupt && !repairable) {
          chrome.storage.local.set({ pinnedUrls: DEFAULT_TABS });
          chrome.storage.sync.set({ pinnedUrls: DEFAULT_TABS });
          return resolve({ list: DEFAULT_TABS, status: "rebuilt" });
        }

        // Sync was valid → copy to local
        chrome.storage.local.set({ pinnedUrls: list });
        resolve({ list, status: "ok" });
      });
    });
  });
}

chrome.windows.onCreated.addListener(async (window) => {
  if (window.incognito) return;

  const { list } = await loadAndRepairPinnedList();

  chrome.tabs.query({ windowId: window.id }, (tabs) => {
    const existing = new Set();
    let pending = tabs.length;

    if (pending === 0) {
      createMissing(list, existing, window.id);
      return;
    }

    tabs.forEach((tab) => {
      if (!chrome.sessions || !chrome.sessions.getTabValue) {
        if (--pending === 0) createMissing(list, existing, window.id);
        return;
      }

      chrome.sessions.getTabValue(tab.id, "apt-id", (value) => {
        if (value) existing.add(value);
        if (--pending === 0) createMissing(list, existing, window.id);
      });
    });
  });
});

function createMissing(list, existing, windowId) {
  list.forEach((item, index) => {
    if (existing.has(item.id)) return;

    chrome.tabs.create(
      { windowId, url: item.url, pinned: true, index },
      (tab) => {
        if (chrome.sessions && chrome.sessions.setTabValue) {
          chrome.sessions.setTabValue(tab.id, "apt-id", item.id);
        }
      }
    );
  });
}
