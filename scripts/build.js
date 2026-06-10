#!/usr/bin/env node
import fse from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const ART   = path.join(ROOT, "artwork");
const SRC   = path.join(ROOT, "src");
const BUILD = path.join(ROOT, "build");

const STANDARD_NAMES = {
  "16":  "icon-16.png",
  "32":  "icon-32.png",
  "48":  "icon-48.png",
  "128": "icon-128.png"
};

const ICON_MAP = {
  chromium: { "16": "chromium-16.png", "32": "chromium-32.png", "48": "chromium-48.png", "128": "chromium-128.png" },
  chrome:   { "16": "chrome-16.png",   "32": "chrome-32.png",   "48": "chrome-48.png",   "128": "chrome-128.png"   },
  edge:     { "16": "edge-16.png",     "32": "edge-32.png",     "48": "edge-48.png",     "128": "edge-128.png"     }
};

const UI_ICONS = [
  "fluent-up.png",
  "fluent-down.png",
  "fluent-go.png",
  "fluent-x.png",
  "fluent-save.png"
];

const BROWSERS = ["chromium", "chrome", "edge"];

async function main() {
  console.log("\n=== Building Pinned Tabs ===\n");

  await fse.remove(BUILD);
  await fse.ensureDir(BUILD);

  for (const browser of BROWSERS) {
    const outDir   = path.join(BUILD, browser);
    const iconsDir = path.join(outDir, "icons");

    console.log(`Building ${browser}…`);

    await fse.ensureDir(outDir);
    await fse.ensureDir(iconsDir);

    await fse.copy(SRC, outDir);

    for (const size of Object.keys(STANDARD_NAMES)) {
      await fse.copy(
        path.join(ART, ICON_MAP[browser][size]),
        path.join(iconsDir, STANDARD_NAMES[size])
      );
    }

    for (const ui of UI_ICONS) {
      await fse.copy(path.join(ART, ui), path.join(iconsDir, ui));
    }

    console.log(`  ✓ ${browser} done`);
  }

  console.log("\nAll builds complete.\n");
}

main();
