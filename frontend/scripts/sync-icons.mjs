import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const androidRes = path.join(root, 'android', 'app', 'src', 'main', 'res');
const srcDir = path.join(root, 'resources', 'android');

try {
  if (!fs.existsSync(androidRes)) {
    console.error('Android project not found. Run "npx cap add android" first.');
    process.exit(1);
  }

  const dirs = ['mipmap-mdpi', 'mipmap-hdpi', 'mipmap-xhdpi', 'mipmap-xxhdpi', 'mipmap-xxxhdpi', 'mipmap-anydpi-v26', 'drawable'];

  for (const dir of dirs) {
    const src = path.join(srcDir, dir);
    const dest = path.join(androidRes, dir);
    if (fs.existsSync(src)) {
      fs.cpSync(src, dest, { recursive: true });
      process.stdout.write(`  ${dir} ✓\n`);
    }
  }

  process.stdout.write('✓ Iconos copiados\n');
} catch (e) {
  console.error('Error:', e);
  process.exit(1);
}
