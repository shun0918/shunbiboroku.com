import path from 'node:path';

export const CONTENT_DIR = path.join(process.cwd(), 'content');

export type ContentType = 'post' | 'works';

export function resolveAssetUrl(type: ContentType, slug: string, relPath: string): string {
  const normalized = relPath.replace(/^\.\//, '');
  return `/content/${type}/${slug}/${normalized}`;
}
