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

const DEFAULT_TABS = [
  { id: uuid(), url: 'https://code.sovamind.com/' },
  { id: uuid(), url: 'https://www.karmicproject.org/' },
  { id: uuid(), url: 'https://www.404media.org/' }
];

async function loadPinnedList() {
  return new Promise(resolve => {
    chrome.storage.sync.get(['pinnedUrls'], syncData => {
      const syncList = syncData.pinnedUrls;
      if (Array.isArray(syncList) && syncList.length > 0) {
        chrome.storage.local.set({ pinnedUrls: syncList });
        return resolve(syncList);
      }
      chrome.storage.local.get(['pinnedUrls'], localData => {
        const localList = localData.pinnedUrls;
        if (Array.isArray(localList) && localList.length > 0) return resolve(localList);
        chrome.storage.local.set({ pinnedUrls: DEFAULT_TABS });
        chrome.storage.sync.set({ pinnedUrls: DEFAULT_TABS });
        resolve([...DEFAULT_TABS]);
      });
    });
  });
}

function saveList(list) {
  chrome.storage.local.set({ pinnedUrls: list });
  chrome.storage.sync.set({ pinnedUrls: list });
}

document.addEventListener('DOMContentLoaded', async () => {
  const listContainer = document.getElementById('urlList');
  const addInput = document.getElementById('newUrl');
  const addButton = document.getElementById('addBtn');
  const goButton = document.getElementById('playBtn');
  const saveButton = document.getElementById('saveBtn');

  let list = await loadPinnedList();
  renderList(list);

  function renderList(list) {
    listContainer.innerHTML = '';
    list.forEach((item, index) => {
      const li = document.createElement('li');

      const input = document.createElement('input');
      input.type = 'text';
      input.value = item.url;
      input.addEventListener('change', () => {
        item.url = normalizeUrl(input.value);
        input.value = item.url;
        saveList(list);
      });

      const up = document.createElement('button');
      up.className = 'icon-btn';
      up.innerHTML = `<img src="icons/fluent-up.png">`;
      up.onclick = () => {
        if (index > 0) {
          [list[index - 1], list[index]] = [list[index], list[index - 1]];
          saveList(list);
          renderList(list);
        }
      };

      const down = document.createElement('button');
      down.className = 'icon-btn';
      down.innerHTML = `<img src="icons/fluent-down.png">`;
      down.onclick = () => {
        if (index < list.length - 1) {
          [list[index + 1], list[index]] = [list[index], list[index + 1]];
          saveList(list);
          renderList(list);
        }
      };

      const del = document.createElement('button');
      del.className = 'icon-btn delete-btn';
      del.innerHTML = `<img src="icons/fluent-x.png">`;
      del.onclick = () => {
        list.splice(index, 1);
        saveList(list);
        renderList(list);
      };

      li.append(input, up, down, del);
      listContainer.appendChild(li);
    });
  }

  addButton.onclick = () => {
    const raw = addInput.value.trim();
    if (!raw) return;
    const url = normalizeUrl(raw);
    list.push({ id: uuid(), url });
    saveList(list);
    addInput.value = '';
    renderList(list);
  };

  goButton.onclick = () => {
    chrome.runtime.sendMessage({ action: 'GO' }, async () => {
      list = await loadPinnedList();
      renderList(list);
    });
  };

  if (saveButton) {
    saveButton.onclick = () => {
      chrome.runtime.sendMessage({ action: 'SAVE' }, async () => {
        list = await loadPinnedList();
        renderList(list);
      });
    };
  }
});
