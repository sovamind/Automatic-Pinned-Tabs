#!/usr/bin/env node
import fse from "fs-extra";
import path from "path";

const ROOT = process.cwd();

const ART = path.join(ROOT, "artwork");
const SRC = path.join(ROOT, "src");
const BUILD = path.join(ROOT, "build");

// Standard names required by manifest.json
const STANDARD_NAMES = {
  "16": "icon-16.png",
  "32": "icon-32.png",
  "48": "icon-48.png",
  "128": "icon-128.png"
};

// Artwork filenames for each browser
const ICON_MAP = {
  chromium: {
    "16": "chromium-16.png",
    "32": "chromium-32.png",
    "48": "chromium-48.png",
    "128": "chromium-128.png"
  },
  chrome: {
    "16": "chrome-16.png",
    "32": "chrome-32.png",
    "48": "chrome-48.png",
    "128": "chrome-128.png"
  },
  edge: {
    "16": "edge-16.png",
    "32": "edge-32.png",
    "48": "edge-48.png",
    "128": "edge-128.png"
  }
};

// UI icons that must also be copied
const UI_ICONS = [
  "fluent-up.png",
  "fluent-down.png",
  "fluent-go.png",
  "fluent-x.png",
  "fluent-save.png"
];

const BROWSERS = ["chromium", "chrome", "edge"];

async function main() {
  console.log("\n=== Building Pinned Tabs (icons folder, correct names) ===\n");

  await fse.remove(BUILD);
  await fse.ensureDir(BUILD);

  for (const browser of BROWSERS) {
    const outDir = path.join(BUILD, browser);
    const iconsDir = path.join(outDir, "icons");

    console.log(`Building ${browser} → ${outDir}`);

    await fse.ensureDir(outDir);
    await fse.ensureDir(iconsDir);

    // Copy ALL src files including manifest.json
    await fse.copy(SRC, outDir);

    // Copy + rename browser-specific icons
    for (const size of Object.keys(STANDARD_NAMES)) {
      const srcFile = ICON_MAP[browser][size];
      const destFile = STANDARD_NAMES[size];

      await fse.copy(
        path.join(ART, srcFile),
        path.join(iconsDir, destFile)
      );
    }

    // Copy UI icons (up/down/delete)
    for (const ui of UI_ICONS) {
      await fse.copy(
        path.join(ART, ui),
        path.join(iconsDir, ui)
      );
    }

    console.log(`  ✓ ${browser} done`);
  }

  console.log("\nAll builds complete.\n");
}

main();
