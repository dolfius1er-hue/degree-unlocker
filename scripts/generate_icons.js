import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputImage = fs.existsSync('src/assets/images/degree_unlocker_icon_1788733299169.jpg')
  ? 'src/assets/images/degree_unlocker_icon_1788733299169.jpg'
  : 'public/icon.png';

const sizes = [48, 72, 96, 128, 144, 152, 192, 384, 512];

async function generate() {
  console.log(`Generating icons from ${inputImage}...`);
  for (const size of sizes) {
    const outputPath = path.join('public', `icon-${size}.png`);
    await sharp(inputImage)
      .resize(size, size, { fit: 'cover' })
      .toFormat('png')
      .toFile(outputPath);
    console.log(`Successfully generated ${outputPath} (${size}x${size})`);
  }
}

generate().catch(err => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
