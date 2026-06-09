function uuid() {
  return crypto.randomUUID();
}

async function loadAndRepairPinnedList() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["pinnedUrls"], (data) => {
      let list = data.pinnedUrls;
      let status = "ok";

      if (!Array.isArray(list)) {
        chrome.storage.sync.set({ pinnedUrls: [] });
        return resolve({ list: [], status: "rebuilt" });
      }

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

      if (!corrupt && list.some((i) => typeof i === "string")) {
        const migrated = list.map((url) => ({ url, id: uuid() }));
        chrome.storage.sync.set({ pinnedUrls: migrated });
        return resolve({ list: migrated, status: "migrated" });
      }

      if (!corrupt && list.some((i) => typeof i === "object" && !i.id)) {
        const fixed = list.map((item) => {
          if (!item.id) item.id = uuid();
          return item;
        });
        chrome.storage.sync.set({ pinnedUrls: fixed });
        return resolve({ list: fixed, status: "fixed" });
      }

      if (corrupt && !repairable) {
        chrome.storage.sync.set({ pinnedUrls: [] });
        return resolve({ list: [], status: "rebuilt" });
      }

      resolve({ list, status: "ok" });
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const listContainer = document.getElementById("list");
  const addInput = document.getElementById("addInput");
  const addButton = document.getElementById("addButton");
  const message = document.getElementById("message");

  const { list, status } = await loadAndRepairPinnedList();

  if (status === "migrated") {
    message.textContent =
      "Your pinned tab list has been migrated to a new format. Please check that all your tabs were migrated.";
  }

  if (status === "fixed") {
    message.textContent =
      "Your pinned tab list got corrupted, but we think we were able to fix it. Please check your pinned tab list.";
  }

  if (status === "rebuilt") {
    message.textContent =
      "Your pinned tab list got corrupted, but unfortunately we couldn't save your pinned tabs. We apologize but you'll have to add your pinned tabs to the list again.";
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

  function save(list) {
    chrome.storage.sync.set({ pinnedUrls: list });
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
