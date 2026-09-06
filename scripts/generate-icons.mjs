import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const publicDir = resolve(rootDir, "apps", "client", "public");
const iconSvgPath = resolve(publicDir, "icon.svg");

const baseSvg = readFileSync(iconSvgPath, "utf-8");

// Maskable SVG with full bleed background and logo scaled to the 80% safe circle
const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#16133b"/>
      <stop offset="1" stop-color="#080b18"/>
    </linearGradient>
    <linearGradient id="glow" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#7cf7ff"/>
      <stop offset="1" stop-color="#ff4fd8"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <g transform="translate(51.2, 51.2) scale(0.8)">
    <path d="M104 125h304v58H185v52h165v58H185v52h223v58H104z" fill="url(#glow)"/>
    <circle cx="394" cy="125" r="36" fill="#ffcc66"/>
  </g>
</svg>
`.trim();

// Apple Touch Icon SVG (full bleed background, balanced inset)
const appleTouchSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#16133b"/>
      <stop offset="1" stop-color="#080b18"/>
    </linearGradient>
    <linearGradient id="glow" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#7cf7ff"/>
      <stop offset="1" stop-color="#ff4fd8"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <g transform="translate(25.6, 25.6) scale(0.9)">
    <path d="M104 125h304v58H185v52h165v58H185v52h223v58H104z" fill="url(#glow)"/>
    <circle cx="394" cy="125" r="36" fill="#ffcc66"/>
  </g>
</svg>
`.trim();

async function generate() {
  console.log("Generating GLIX production install icons from brand source...");

  const baseSvgBuf = Buffer.from(baseSvg);
  const maskableSvgBuf = Buffer.from(maskableSvg);
  const appleTouchSvgBuf = Buffer.from(appleTouchSvg);

  // 192x192 standard icon
  const icon192 = await sharp(baseSvgBuf).resize(192, 192).png().toBuffer();
  writeFileSync(resolve(publicDir, "pwa-192x192.png"), icon192);
  writeFileSync(resolve(publicDir, "icon-192.png"), icon192);

  // 512x512 standard icon
  const icon512 = await sharp(baseSvgBuf).resize(512, 512).png().toBuffer();
  writeFileSync(resolve(publicDir, "pwa-512x512.png"), icon512);
  writeFileSync(resolve(publicDir, "icon-512.png"), icon512);

  // Maskable 192 & 512
  const maskable192 = await sharp(maskableSvgBuf).resize(192, 192).png().toBuffer();
  writeFileSync(resolve(publicDir, "icon-maskable-192.png"), maskable192);

  const maskable512 = await sharp(maskableSvgBuf).resize(512, 512).png().toBuffer();
  writeFileSync(resolve(publicDir, "maskable-icon-512x512.png"), maskable512);
  writeFileSync(resolve(publicDir, "icon-maskable-512.png"), maskable512);

  // Apple Touch Icon 180x180
  const apple180 = await sharp(appleTouchSvgBuf).resize(180, 180).png().toBuffer();
  writeFileSync(resolve(publicDir, "apple-touch-icon-180x180.png"), apple180);
  writeFileSync(resolve(publicDir, "apple-touch-icon.png"), apple180);

  console.log("Successfully generated all GLIX production install icons:");
  console.log(" - pwa-192x192.png / icon-192.png (192x192)");
  console.log(" - pwa-512x512.png / icon-512.png (512x512)");
  console.log(" - maskable-icon-512x512.png / icon-maskable-512.png (512x512 maskable)");
  console.log(" - icon-maskable-192.png (192x192 maskable)");
  console.log(" - apple-touch-icon-180x180.png / apple-touch-icon.png (180x180)");
}

generate().catch((err) => {
  console.error("Failed to generate icons:", err);
  process.exit(1);
});
