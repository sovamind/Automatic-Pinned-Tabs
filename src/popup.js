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
    chrome.storage.local.get(["pinnedUrls"], (localData) => {
      let localList = localData.pinnedUrls;

      if (Array.isArray(localList)) {
        return resolve({ list: localList, status: "ok" });
      }

      chrome.storage.sync.get(["pinnedUrls"], (syncData) => {
        let list = syncData.pinnedUrls;

        if (!Array.isArray(list)) {
          chrome.storage.local.set({ pinnedUrls: DEFAULT_TABS });
          chrome.storage.sync.set({ pinnedUrls: DEFAULT_TABS });
          return resolve({ list: DEFAULT_TABS, status: "rebuilt" });
        }

        chrome.storage.local.set({ pinnedUrls: list });
        resolve({ list, status: "ok" });
      });
    });
  });
}

function save(list) {
  chrome.storage.local.set({ pinnedUrls: list });
  chrome.storage.sync.set({ pinnedUrls: list });
}

document.addEventListener("DOMContentLoaded", async () => {
  const listContainer = document.getElementById("list");
  const addInput = document.getElementById("addInput");
  const addButton = document.getElementById("addButton");
  const message = document.getElementById("message");

  const { list, status } = await loadAndRepairPinnedList();

  if (status === "rebuilt") {
    message.textContent =
      "Your pinned tab list was corrupted and has been reset to defaults.";
  }

  renderList(list);

  function renderList(list) {
    listContainer.innerHTML = "";

    list.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "row";

      const input = document.createElement("input");
      input.type = "text";
      input.value = item.url;

      input.addEventListener("change", () => {
        item.url = input.value;
        save(list);
      });

      const up = document.createElement("button");
      up.textContent = "▲";
      up.onclick = () => {
        if (index > 0) {
          [list[index - 1], list[index]] = [list[index], list[index - 1]];
          save(list);
          renderList(list);
        }
      };

      const down = document.createElement("button");
      down.textContent = "▼";
      down.onclick = () => {
        if (index < list.length - 1) {
          [list[index + 1], list[index]] = [list[index], list[index + 1]];
          save(list);
          renderList(list);
        }
      };

      const del = document.createElement("button");
      del.textContent = "X";
      del.onclick = () => {
        list.splice(index, 1);
        save(list);
        renderList(list);
      };

      row.append(input, up, down, del);
      listContainer.appendChild(row);
    });
  }

  addButton.onclick = () => {
    const url = addInput.value.trim();
    if (!url) return;

    list.push({ url, id: uuid() });
    save(list);
    addInput.value = "";
    renderList(list);
  };
});
