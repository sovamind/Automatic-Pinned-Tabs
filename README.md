# Automatic Pinned Tabs
Chromium extension to automatically open your favorite pinned tabs in every new window  
### by Sovamind Studios  
**Copyright © Sova Novak**  
https://www.sovamind.com  

---

## Overview

**Automatic Pinned Tabs** is a lightweight Microsoft Edge / Chromium extension that automatically opens and pins a user‑defined set of tabs every time a new browser window is created.

This is perfect for users who rely on a consistent workspace — email, messaging, dashboards, or any set of sites you always want ready and pinned.

No more re‑pinning tabs. No more losing your workflow.  
Just open a new window and your pinned tabs appear instantly.

---

## Features

- Add, edit, and reorder your pinned URLs  
- Clean popup UI for managing your list  
- Tabs load **already pinned** for instant placement  
- Maintains correct left‑to‑right order  
- Uses Chrome/Edge `storage.sync` so your list follows you across devices  
- Zero permissions beyond what’s required (`tabs`, `windows`, `storage`)  
- Fast, minimal, and privacy‑respecting  

---

## How It Works

1. Open the extension popup  
2. Add the URLs you want pinned  
3. Reorder them using the arrow buttons  
4. Open a new browser window  
5. Your tabs appear automatically, pinned in the order you chose  

---

## Installation

You can install Automatic Pinned Tabs directly from your browser’s extension store.

### Google Chrome
**Chrome Web Store:**  
https://chrome.google.com/webstore/detail/automatic-pinned-tabs/COMING-SOON

### Microsoft Edge
**Microsoft Edge Add-ons Store:**  
https://microsoftedge.microsoft.com/addons/detail/automatic-pinned-tabs/COMING-SOON

### Brave Browser
Brave fully supports installing extensions from the **Chrome Web Store**.

**To install in Brave:**
1. Open Brave  
2. Visit the Chrome Web Store listing  
3. Click **Add to Brave**

### Other Chromium Browsers
Most Chromium-based browsers (Opera, Vivaldi, Chromium, Ungoogled Chromium, Arc, etc.)  
also install extensions directly from the **Chrome Web Store** once the listing is live.

### From Source (Developer Mode)

1. Download or clone the repository:  
   https://github.com/sovamind/automatic-pinned-tabs

2. Open `edge://extensions` or `chrome://extensions`

3. Enable **Developer Mode**

4. Click **Load Unpacked**

5. Select the `package` folder

---

## 🚀 Automated Builds (GitHub Actions)

This project includes a fully automated build pipeline that runs whenever a new version tag is pushed to the repository. The automation handles all packaging steps for Chrome, Edge, and Chromium builds.

### How it works

When you push a tag matching the pattern `v*` (for example: `v1.4.0`), GitHub Actions automatically:

1. Checks out the repository  
2. Runs the build script (`npm run build`)  
3. Creates platform‑specific build directories under `build/<platform>/`  
4. Copies all source files from `/src` into each platform directory  
5. Copies platform‑specific icons into `build/<platform>/icons/icon-##.png`  
6. Copies common artwork (up/down/delete icons) into each platform’s icon folder  
7. Generates ZIP archives for each platform (e.g., `chrome.zip`, `edge.zip`, `chromium.zip`)  
8. Uploads the ZIPs as workflow artifacts  
9. Publishes a GitHub Release for the tag with all build ZIPs attached  

### Triggering a build

To create a new release build:

```sh
git tag v1.4.0
git push origin v1.4.0
```

Within a few seconds, GitHub Actions will produce fresh extension packages for all platforms and attach them to the release page.

### Build script

The build process is implemented in `scripts/build.js` and is invoked via:

```sh
npm run build
```

This script performs all file copying, icon mapping, and ZIP creation required for each platform.


## License

This project is licensed under the **MIT License**.  
See `LICENSE` for details.

---
