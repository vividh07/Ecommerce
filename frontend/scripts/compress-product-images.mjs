import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const dir = path.resolve('public/images/products');
const files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.png'));

for (const file of files) {
  const input = path.join(dir, file);
  const output = path.join(dir, file.replace(/\.png$/i, '.webp'));
  await sharp(input)
    .rotate()
    .resize({ width: 1000, withoutEnlargement: true })
    .webp({ quality: 76 })
    .toFile(output);
  fs.unlinkSync(input);
  const kb = Math.round(fs.statSync(output).size / 1024);
  console.log(`${file} -> ${path.basename(output)} (${kb} KB)`);
}
