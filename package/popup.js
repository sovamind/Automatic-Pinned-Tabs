const listEl = document.getElementById("urlList");
const addBtn = document.getElementById("addBtn");
const newUrl = document.getElementById("newUrl");

let urls = [];

// Load saved URLs
chrome.storage.sync.get(["pinnedUrls"], (data) => {
  urls = data.pinnedUrls || [];
  render();
});

function render() {
  listEl.innerHTML = "";

  urls.forEach((url, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <input type="text" value="${url}" data-edit="${index}">
      <button data-up="${index}" class="icon-btn"><img src="arrow-up.png"></button>
      <button data-down="${index}" class="icon-btn"><img src="arrow-down.png"></button>
      <button data-del="${index}" class="icon-btn"><img src="delete.png"></button>
    `;

    listEl.appendChild(li);
  });
}

// Add URL
addBtn.onclick = () => {
  const url = newUrl.value.trim();
  if (!url) return;

  urls.push(url);
  newUrl.value = "";
  save();
};

// Handle clicks: delete, up, down
listEl.onclick = (e) => {
  // delete
  if (e.target.dataset.del !== undefined) {
    const idx = Number(e.target.dataset.del);
    urls.splice(idx, 1);
    save();
    return;
  }

  // move up
  if (e.target.dataset.up !== undefined) {
    const idx = Number(e.target.dataset.up);
    if (idx > 0) {
      [urls[idx - 1], urls[idx]] = [urls[idx], urls[idx - 1]];
      save();
    }
    return;
  }

  // move down
  if (e.target.dataset.down !== undefined) {
    const idx = Number(e.target.dataset.down);
    if (idx < urls.length - 1) {
      [urls[idx + 1], urls[idx]] = [urls[idx], urls[idx + 1]];
      save();
    }
    return;
  }
};

// Handle inline editing
listEl.addEventListener("change", (e) => {
  if (e.target.dataset.edit !== undefined) {
    const idx = Number(e.target.dataset.edit);
    urls[idx] = e.target.value.trim();
    save();
  }
});

function save() {
  chrome.storage.sync.set({ pinnedUrls: urls }, render);
}
