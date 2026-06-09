const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

const PLATFORMS = ["chrome", "edge", "chromium"];

const COMMON_ICONS = [
  "icon-16.png",
  "icon-32.png",
  "icon-48.png",
  "icon-128.png",
  "icon-up.png",
  "icon-down.png",
  "icon-delete.png"
];

function copy(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function zipFolder(source, out) {
  return new Promise((resolve) => {
    const archive = archiver("zip", { zlib: { level: 9 } });
    const stream = fs.createWriteStream(out);

    archive.directory(source, false).pipe(stream);
    archive.finalize();

    stream.on("close", resolve);
  });
}

(async () => {
  fs.rmSync("build", { recursive: true, force: true });

  for (const platform of PLATFORMS) {
    const dest = `build/${platform}`;
    fs.mkdirSync(dest, { recursive: true });

    // 1. Copy source files
    fs.cpSync("src", dest, { recursive: true });

    // 2. Copy platform icons
    for (const size of [16, 32, 48, 128]) {
      copy(
        `artwork/${platform}-${size}.png`,
        `${dest}/icons/icon-${size}.png`
      );
    }

    // 3. Copy common icons
    for (const icon of COMMON_ICONS) {
      copy(`artwork/${icon}`, `${dest}/icons/${icon}`);
    }

    // 4. Zip it
    await zipFolder(dest, `build/${platform}.zip`);
  }
})();
