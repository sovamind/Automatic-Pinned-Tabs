import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "artwork", "fluent-save.png");

// Database/cylinder icon — transparent background, blue fill, matching fluent flat style
// Cylinder body with top ellipse cap and two ridge lines
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="384" height="384" viewBox="0 0 384 384">
  <!-- Cylinder body -->
  <rect x="72" y="112" width="240" height="196" rx="0" ry="0" fill="#1e88e5"/>
  <!-- Bottom cap ellipse -->
  <ellipse cx="192" cy="308" rx="120" ry="36" fill="#1565c0"/>
  <!-- Body sides (cover rect corners) -->
  <rect x="72" y="112" width="240" height="196" fill="#1e88e5"/>
  <!-- Top cap ellipse (face) -->
  <ellipse cx="192" cy="112" rx="120" ry="36" fill="#42a5f5"/>
  <!-- Ridge 1 -->
  <ellipse cx="192" cy="168" rx="120" ry="24" fill="none" stroke="#1565c0" stroke-width="14"/>
  <!-- Ridge 2 -->
  <ellipse cx="192" cy="224" rx="120" ry="24" fill="none" stroke="#1565c0" stroke-width="14"/>
  <!-- Redraw body sides to clip ridge overflow -->
  <rect x="72" y="112" width="14" height="196" fill="#1e88e5"/>
  <rect x="298" y="112" width="14" height="196" fill="#1e88e5"/>
</svg>`;

sharp(Buffer.from(svg), { density: 144 })
  .ensureAlpha()
  .png()
  .toFile(OUT)
  .then(() => console.log("Written:", OUT))
  .catch(err => { console.error(err); process.exit(1); });
