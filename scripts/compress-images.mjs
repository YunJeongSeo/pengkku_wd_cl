import sharp from 'sharp';
import { readdirSync, statSync, mkdirSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';

const SRC_DIR  = './static';
const OUT_DIR  = './static/opt';
const MAX_WIDTH = 900;
const QUALITY   = 82;

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR);

const files = readdirSync(SRC_DIR).filter(f => {
  const ext = extname(f).toLowerCase();
  return ['.webp', '.jpg', '.jpeg', '.png'].includes(ext);
});

let totalBefore = 0, totalAfter = 0;

for (const file of files) {
  const src  = join(SRC_DIR, file);
  const name = basename(file, extname(file));
  const dest = join(OUT_DIR, name + '.webp');
  const before = statSync(src).size;

  await sharp(src)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(dest);

  const after = statSync(dest).size;
  totalBefore += before;
  totalAfter  += after;

  const saved = Math.round((1 - after / before) * 100);
  console.log(`✓  ${file.padEnd(26)}  ${(before/1024/1024).toFixed(2)}MB → ${(after/1024).toFixed(0)}KB  (${saved}% 절감)`);
}

console.log('');
console.log(`전체: ${(totalBefore/1024/1024).toFixed(1)}MB → ${(totalAfter/1024/1024).toFixed(1)}MB`);
console.log(`결과물 위치: static/opt/`);
console.log(`\n다음 단계: 개발 서버를 끄고 static/opt/ 파일을 static/으로 복사하세요.`);
console.log(`  또는 코드의 이미지 경로를 /opt/파일명.webp 로 변경하세요.`);
