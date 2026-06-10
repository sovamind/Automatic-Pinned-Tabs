function uuid() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

function normalizeUrl(raw) {
  let url = raw.trim();
  if (!url) return '';
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  try {
    const parsed = new URL(url);
    parsed.search = '';
    parsed.hash = '';
    let result = parsed.toString();
    if (!result.endsWith('/')) result += '/';
    return result;
  } catch {
    return url;
  }
}

const DEFAULT_LIST = [
  { id: uuid(), url: 'https://code.sovamind.com/' },
  { id: uuid(), url: 'https://www.karmicproject.org/' },
  { id: uuid(), url: 'https://www.404media.org/' }
];

// ── Storage ──────────────────────────────────────────────────────────────────

function ensureIds(list) {
  return list.map(e => e.id ? e : { ...e, id: uuid() });
}

async function loadList() {
  const { pinnedUrls: sync } = await chrome.storage.sync.get('pinnedUrls');
  if (Array.isArray(sync) && sync.length) {
    const list = ensureIds(sync);
    chrome.storage.local.set({ pinnedUrls: list });
    return list;
  }
  const { pinnedUrls: local } = await chrome.storage.local.get('pinnedUrls');
  if (Array.isArray(local) && local.length) {
    const list = ensureIds(local);
    chrome.storage.sync.set({ pinnedUrls: list });
    return list;
  }
  const list = DEFAULT_LIST.map(e => ({ ...e }));
  chrome.storage.local.set({ pinnedUrls: list });
  chrome.storage.sync.set({ pinnedUrls: list });
  return list;
}

async function saveList(list) {
  await chrome.storage.local.set({ pinnedUrls: list });
  await chrome.storage.sync.set({ pinnedUrls: list });
}

// ── Session identity  "tab-<tabId>" → app-uuid ───────────────────────────────

async function getUuidForTab(tabId) {
  const { [`tab-${tabId}`]: v } = await chrome.storage.session.get(`tab-${tabId}`);
  return v || null;
}

async function setUuidForTab(tabId, appId) {
  await chrome.storage.session.set({ [`tab-${tabId}`]: appId });
}

async function clearUuidForTab(tabId) {
  await chrome.storage.session.remove(`tab-${tabId}`);
}

// Returns { [appId]: tabId } for all currently tracked tabs
async function getTrackedMap() {
  const all = await chrome.storage.session.get(null);
  const map = {};
  for (const [k, v] of Object.entries(all)) {
    if (k.startsWith('tab-')) map[v] = parseInt(k.slice(4));
  }
  return map; // appId → tabId
}

// ── GO ───────────────────────────────────────────────────────────────────────

async function go() {
  const list = await loadList();

  // Persist any id-backfills we may have done in ensureIds
  await saveList(list);

  const tracked = await getTrackedMap();           // appId → tabId
  const allTabs = await chrome.tabs.query({ currentWindow: true });
  const pinned  = allTabs.filter(t => t.pinned);

  const claimedTabIds = new Set(); // tab IDs assigned so far this run
  const appTabIds = [];            // final ordered list of tab IDs

  for (const entry of list) {
    // ── Step 1: find tab we already own ──────────────────────────────────
    const knownTabId = tracked[entry.id];
    if (knownTabId != null) {
      try {
        const tab = await chrome.tabs.get(knownTabId);
        if (!tab.pinned) await chrome.tabs.update(tab.id, { pinned: true });
        claimedTabIds.add(tab.id);
        appTabIds.push(tab.id);
        continue;
      } catch {
        // Tab no longer exists – fall through
        await clearUuidForTab(knownTabId);
      }
    }

    // ── Step 2: adopt an existing pinned tab whose URL matches ────────────
    const candidate = pinned.find(
      t => !claimedTabIds.has(t.id) && t.url && normalizeUrl(t.url).startsWith(entry.url)
    );
    if (candidate) {
      await setUuidForTab(candidate.id, entry.id);
      claimedTabIds.add(candidate.id);
      appTabIds.push(candidate.id);
      continue;
    }

    // ── Step 3: create a new pinned tab ───────────────────────────────────
    const newTab = await chrome.tabs.create({ url: entry.url, pinned: true });
    await setUuidForTab(newTab.id, entry.id);
    claimedTabIds.add(newTab.id);
    appTabIds.push(newTab.id);
  }

  // ── Close tabs that belong to app IDs no longer in the list ──────────────
  const listIdSet = new Set(list.map(e => e.id));
  for (const [appId, tabId] of Object.entries(tracked)) {
    if (!listIdSet.has(appId) && !claimedTabIds.has(tabId)) {
      try { await chrome.tabs.remove(tabId); } catch { /* already gone */ }
      await clearUuidForTab(tabId);
    }
  }

  // ── Enforce order: app tabs occupy indices 0 … N-1 ───────────────────────
  for (let i = 0; i < appTabIds.length; i++) {
    try { await chrome.tabs.move(appTabIds[i], { index: i }); } catch { /* gone */ }
  }
}

// ── SAVE ─────────────────────────────────────────────────────────────────────

async function save() {
  const pinned = await chrome.tabs.query({ currentWindow: true, pinned: true });
  const list = pinned.map(t => ({ id: uuid(), url: normalizeUrl(t.url) }));
  await saveList(list);
  await go();
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

chrome.tabs.onRemoved.addListener(tabId => clearUuidForTab(tabId).catch(() => {}));

// ── Messages ──────────────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === 'GO') {
    go().catch(console.error).finally(sendResponse);
    return true;
  }
  if (msg.action === 'SAVE') {
    save().catch(console.error).finally(sendResponse);
    return true;
  }
  return false;
});

// ── Startup / install ─────────────────────────────────────────────────────────

chrome.runtime.onStartup.addListener(() => go().catch(console.error));
chrome.runtime.onInstalled.addListener(() => go().catch(console.error));
