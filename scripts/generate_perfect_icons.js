import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgBuffer = fs.readFileSync(path.join(process.cwd(), 'public', 'icon.svg'));

const sizes = [48, 72, 96, 128, 144, 152, 192, 384, 512];

async function generate() {
  for (const size of sizes) {
    const outFile = path.join(process.cwd(), 'public', `icon-${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size)
      .png({ quality: 100 })
      .toFile(outFile);
    console.log(`Generated ${outFile}`);
  }

  // Also create icon.png and apple-touch-icon.png
  await sharp(svgBuffer)
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(path.join(process.cwd(), 'public', 'icon.png'));

  await sharp(svgBuffer)
    .resize(180, 180)
    .png({ quality: 100 })
    .toFile(path.join(process.cwd(), 'public', 'apple-touch-icon.png'));

  await sharp(svgBuffer)
    .resize(64, 64)
    .png({ quality: 100 })
    .toFile(path.join(process.cwd(), 'public', 'favicon.ico'));

  console.log('All icons generated successfully!');
}

generate().catch(err => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
