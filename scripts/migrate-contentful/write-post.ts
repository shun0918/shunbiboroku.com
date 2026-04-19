import fs from 'node:fs/promises';
import path from 'node:path';
import type { Document } from '@contentful/rich-text-types';
import { convertRichTextToMarkdown } from './richtext-to-markdown';
import { downloadAsset, extForAsset } from './download-assets';

type AssetFields = {
  title?: string;
  file: {
    url: string;
    fileName?: string;
    contentType?: string;
  };
};

type PostEntry = {
  sys: { id: string };
  fields: {
    slug: string;
    title: string;
    publishedAt: string;
    updatedAt: string;
    thumbnail: { fields: AssetFields };
    body?: Document;
  };
};

export async function writePost(entry: unknown): Promise<void> {
  const p = entry as PostEntry;
  const f = p.fields;
  const slug = f.slug;
  if (!slug) throw new Error(`Post ${p.sys.id} has no slug`);
  if (!f.title) throw new Error(`Post ${slug} has no title`);
  if (!f.publishedAt) throw new Error(`Post ${slug} has no publishedAt`);
  if (!f.updatedAt) throw new Error(`Post ${slug} has no updatedAt`);
  if (!f.thumbnail?.fields?.file) throw new Error(`Post ${slug} has no thumbnail`);

  const dir = path.join('content', 'post', slug);
  const imgDir = path.join(dir, 'images');
  await fs.mkdir(imgDir, { recursive: true });

  const thumbFile = f.thumbnail.fields.file;
  const thumbExt = extForAsset(thumbFile.contentType, thumbFile.url);
  const thumbFilename = `thumbnail.${thumbExt}`;
  await downloadAsset('https:' + thumbFile.url, path.join(imgDir, thumbFilename));

  let body = '';
  let warnings: string[] = [];
  if (f.body) {
    const r = convertRichTextToMarkdown(f.body, slug);
    body = r.markdown;
    warnings = r.warnings;
    for (const a of r.assets) {
      await downloadAsset(a.url, path.join(imgDir, a.filename));
    }
  }

  const frontmatter = [
    '---',
    `title: ${yamlString(f.title)}`,
    `slug: ${yamlString(slug)}`,
    `publishedAt: ${yamlString(f.publishedAt)}`,
    `updatedAt: ${yamlString(f.updatedAt)}`,
    `thumbnail: ${yamlString(`./images/${thumbFilename}`)}`,
    `contentfulId: ${yamlString(p.sys.id)}`,
    '---',
    '',
  ].join('\n');

  await fs.writeFile(path.join(dir, 'index.md'), frontmatter + body);

  if (warnings.length > 0) {
    console.warn(`[post] ${slug} warnings: ${warnings.join('; ')}`);
  }
}

function yamlString(v: string): string {
  return JSON.stringify(v);
}
