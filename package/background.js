chrome.windows.onCreated.addListener((window) => {
  if (window.incognito) return;

  chrome.storage.sync.get(["pinnedUrls"], (data) => {
    const urls = data.pinnedUrls || [];

    urls.forEach((url, index) => {
      chrome.tabs.create(
        {
          windowId: window.id,
          url,
          active: false,
          pinned: true,   // pin immediately
          index: index    // enforce left-to-right order
        },
        (tab) => {
          // no extra logic needed
          if (!tab) return;
        }
      );
    });
  });
});
