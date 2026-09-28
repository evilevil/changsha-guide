// 构建后清理：Astro 会把 src/assets 中被 import 的「原图」原样复制进 dist/_astro
// （这是 astro:assets 的设计，用于支持 <img src={import.src}>，官方没有关闭开关）。
// 本站所有图片都走 <Image>/<Pic> 输出 webp，原图不会被任何页面引用，属于纯体积浪费。
// 这里扫描最终产物，删掉未被任何 html/css/js 引用的图片资源，让部署包瘦身。
import { readdir, readFile, unlink } from 'node:fs/promises';
import { stat } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const ASTRO_DIR = join(DIST, '_astro');

// 参与「引用扫描」的文本文件（含 _astro 内的 js/css，避免误删被 import 的 chunk）
const TEXT_EXT = new Set([
  '.html', '.css', '.js', '.mjs', '.cjs', '.json',
  '.xml', '.txt', '.svg', '.webmanifest', '.map',
]);
// 允许被删除的资源类型（只删图片，不动 js/css/font）
const IMAGE_EXT = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.jfif',
]);

async function walk(dir, out = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, out);
    else out.push(full);
  }
  return out;
}

const files = await walk(DIST);
if (!files.length) {
  console.log('[prune-assets] dist 为空，跳过');
  process.exit(0);
}

// 1) 汇总所有文本内容作为引用池
let haystack = '';
for (const file of files) {
  if (!TEXT_EXT.has(extname(file))) continue;
  haystack += await readFile(file, 'utf8');
}

// 2) 删除 _astro 内未被引用的图片
let removed = 0;
let saved = 0;
for (const file of files) {
  if (!file.startsWith(ASTRO_DIR)) continue;
  const name = basename(file);
  if (!IMAGE_EXT.has(extname(file))) continue;
  if (haystack.includes(name)) continue;
  saved += (await stat(file)).size;
  await unlink(file);
  removed += 1;
}

console.log(
  removed
    ? `[prune-assets] 清理未引用图片 ${removed} 个，节省 ${(saved / 1048576).toFixed(2)} MB`
    : '[prune-assets] 无未引用图片',
);
