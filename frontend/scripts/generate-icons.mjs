import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const srcIcon = path.join(root, 'src', 'assets', 'icon.png');
const outDir = path.join(root, 'resources', 'android');

const sizes = [
  { dir: 'mipmap-mdpi', size: 48 },
  { dir: 'mipmap-hdpi', size: 72 },
  { dir: 'mipmap-xhdpi', size: 96 },
  { dir: 'mipmap-xxhdpi', size: 144 },
  { dir: 'mipmap-xxxhdpi', size: 192 },
];

async function main() {
  if (!fs.existsSync(srcIcon)) {
    console.error('Source icon not found at', srcIcon);
    process.exit(1);
  }

  // Clear output
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  // Generate each density
  for (const { dir, size } of sizes) {
    const d = path.join(outDir, dir);
    fs.mkdirSync(d, { recursive: true });
    await sharp(srcIcon)
      .resize(size, size)
      .png()
      .toFile(path.join(d, 'icon.png'));
    console.log(`  ${dir}/icon.png  (${size}x${size})`);
  }

  // Adaptive icon foreground: content at 66dp within 108dp safe zone
  const fgDir = path.join(outDir, 'drawable');
  fs.mkdirSync(fgDir, { recursive: true });
  await sharp(srcIcon)
    .resize(66, 66)
    .extend({
      top: 21, bottom: 21, left: 21, right: 21,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toFile(path.join(fgDir, 'icon_foreground.png'));
  console.log('  drawable/icon_foreground.png  (66dp centered on 108x108)');

  // Adaptive icon background (solid color)
  const bgXml = `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="rectangle">
  <solid android:color="#094f2a" />
</shape>`;
  fs.writeFileSync(path.join(fgDir, 'icon_background.xml'), bgXml);
  console.log('  drawable/icon_background.xml');

  // Adaptive icon XML for anydpi-v26
  const anyDpiDir = path.join(outDir, 'mipmap-anydpi-v26');
  fs.mkdirSync(anyDpiDir, { recursive: true });
  const adaptiveXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
  <background android:drawable="@drawable/icon_background" />
  <foreground android:drawable="@drawable/icon_foreground" />
</adaptive-icon>`;
  fs.writeFileSync(path.join(anyDpiDir, 'icon.xml'), adaptiveXml);
  console.log('  mipmap-anydpi-v26/icon.xml  (adaptive icon)');

  // Also copy icon for iOS and general use
  fs.mkdirSync(path.join(root, 'resources', 'ios'), { recursive: true });
  await sharp(srcIcon)
    .resize(1024, 1024)
    .png()
    .toFile(path.join(root, 'resources', 'ios', 'icon.png'));
  console.log('  ios/icon.png  (1024x1024)');

  console.log('\n✓ Android icons generated in resources/android/');
}

main().catch(console.error);
