import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const publicDir = join(rootDir, 'public');

// SVGアイコンの内容（円形の背景に¥マーク）
const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#4F46E5" rx="64"/>
  <text x="256" y="320" font-family="Arial, sans-serif" font-size="200" font-weight="bold" fill="white" text-anchor="middle">¥</text>
</svg>
`;

async function generateIcons() {
  try {
    // 192x192 PNG
    await sharp(Buffer.from(svgIcon))
      .resize(192, 192)
      .png()
      .toFile(join(publicDir, 'pwa-192x192.png'));

    // 512x512 PNG
    await sharp(Buffer.from(svgIcon))
      .resize(512, 512)
      .png()
      .toFile(join(publicDir, 'pwa-512x512.png'));

    // favicon.ico (32x32)
    await sharp(Buffer.from(svgIcon))
      .resize(32, 32)
      .png()
      .toFile(join(publicDir, 'favicon.ico'));

    // apple-touch-icon.png (180x180)
    await sharp(Buffer.from(svgIcon))
      .resize(180, 180)
      .png()
      .toFile(join(publicDir, 'apple-touch-icon.png'));

    console.log('✅ PWAアイコンを生成しました:');
    console.log('  - pwa-192x192.png');
    console.log('  - pwa-512x512.png');
    console.log('  - favicon.ico');
    console.log('  - apple-touch-icon.png');
  } catch (error) {
    console.error('❌ アイコン生成エラー:', error);
    process.exit(1);
  }
}

generateIcons();
