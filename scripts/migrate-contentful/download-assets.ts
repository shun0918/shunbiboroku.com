import fs from 'node:fs/promises';
import path from 'node:path';
import mime from 'mime-types';

export async function downloadAsset(url: string, destPath: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.mkdir(path.dirname(destPath), { recursive: true });
  await fs.writeFile(destPath, buf);
}

export function extForAsset(contentType: string | undefined, url: string): string {
  if (contentType) {
    const ext = mime.extension(contentType);
    if (ext) return ext;
  }
  const m = url.match(/\.([a-z0-9]+)(?:\?|$)/i);
  return m ? m[1].toLowerCase() : 'bin';
}
