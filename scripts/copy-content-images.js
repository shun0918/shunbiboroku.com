'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

async function main() {
  const cwd = process.cwd();
  const contentRoot = path.join(cwd, 'content');
  const publicRoot = path.join(cwd, 'public', 'content');

  await fs.rm(publicRoot, { recursive: true, force: true });

  const types = ['post', 'works'];
  let copied = 0;
  for (const type of types) {
    const src = path.join(contentRoot, type);
    let slugs = [];
    try {
      const entries = await fs.readdir(src, { withFileTypes: true });
      slugs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
    } catch (err) {
      if (err && err.code === 'ENOENT') continue;
      throw err;
    }
    for (const slug of slugs) {
      const imgSrc = path.join(src, slug, 'images');
      const imgDst = path.join(publicRoot, type, slug, 'images');
      let files;
      try {
        files = await fs.readdir(imgSrc);
      } catch (err) {
        if (err && err.code === 'ENOENT') continue;
        throw err;
      }
      await fs.mkdir(imgDst, { recursive: true });
      for (const f of files) {
        await fs.copyFile(path.join(imgSrc, f), path.join(imgDst, f));
        copied += 1;
      }
    }
  }
  console.log(`[copy-content-images] copied ${copied} files to public/content`);
}

main().catch((err) => {
  console.error('[copy-content-images] failed:', err);
  process.exit(1);
});
