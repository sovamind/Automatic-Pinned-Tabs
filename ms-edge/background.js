const isEdge = navigator.userAgent.includes("Edg/");
const isChrome = navigator.userAgent.includes("Chrome") && !isEdge;

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setIcon({
    path: isEdge ? {
      16: "icons/edge-16.png",
      32: "icons/edge-32.png",
      48: "icons/edge-48.png",
      128: "icons/edge-128.png"
    } : {
      16: "icons/chrome-16.png",
      32: "icons/chrome-32.png",
      48: "icons/chrome-48.png",
      128: "icons/chrome-128.png"
    }
  });
});

function uuid() {
  return crypto.randomUUID();
}

async function loadAndRepairPinnedList() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["pinnedUrls"], (data) => {
      let list = data.pinnedUrls;
      let status = "ok";

      // Case 1: Missing or not an array → unrecoverable corruption
      if (!Array.isArray(list)) {
        chrome.storage.sync.set({ pinnedUrls: [] });
        return resolve({ list: [], status: "rebuilt" });
      }

      // Detect corruption
      let corrupt = false;
      let repairable = true;

      for (const item of list) {
        if (typeof item === "string") continue; // repairable
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
        chrome.storage.sync.set({ pinnedUrls: migrated });
        return resolve({ list: migrated, status: "migrated" });
      }

      // Case 3: Corrupted but repairable (objects missing IDs)
      if (!corrupt && list.some((i) => typeof i === "object" && !i.id)) {
        const fixed = list.map((item) => {
          if (!item.id) item.id = uuid();
          return item;
        });
        chrome.storage.sync.set({ pinnedUrls: fixed });
        return resolve({ list: fixed, status: "fixed" });
      }

      // Case 4: Corrupted and NOT repairable
      if (corrupt && !repairable) {
        chrome.storage.sync.set({ pinnedUrls: [] });
        return resolve({ list: [], status: "rebuilt" });
      }

      resolve({ list, status: "ok" });
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
      // Sessions API guard — prevents "getTabValue undefined" crash
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
