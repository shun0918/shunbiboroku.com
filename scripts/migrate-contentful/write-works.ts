import fs from 'node:fs/promises';
import path from 'node:path';
import { downloadAsset, extForAsset } from './download-assets';

type AssetFields = {
  title?: string;
  file: {
    url: string;
    fileName?: string;
    contentType?: string;
  };
};

type WorksEntry = {
  sys: { id: string };
  fields: {
    slug: string;
    name: string;
    description?: string;
    roles?: string[];
    url?: string;
    createdAt: string;
    image: { fields: AssetFields };
  };
};

export async function writeWorks(entry: unknown): Promise<void> {
  const w = entry as WorksEntry;
  const f = w.fields;
  const slug = f.slug;
  if (!slug) throw new Error(`Works ${w.sys.id} has no slug`);
  if (!f.name) throw new Error(`Works ${slug} has no name`);
  if (!f.createdAt) throw new Error(`Works ${slug} has no createdAt`);
  if (!f.image?.fields?.file) throw new Error(`Works ${slug} has no image`);

  const dir = path.join('content', 'works', slug);
  const imgDir = path.join(dir, 'images');
  await fs.mkdir(imgDir, { recursive: true });

  const imgFile = f.image.fields.file;
  const imgExt = extForAsset(imgFile.contentType, imgFile.url);
  const imgFilename = `image.${imgExt}`;
  await downloadAsset('https:' + imgFile.url, path.join(imgDir, imgFilename));

  const rolesYaml =
    f.roles && f.roles.length > 0
      ? '\n' + f.roles.map((r) => `  - ${JSON.stringify(r)}`).join('\n')
      : ' []';

  const frontmatter = [
    '---',
    `slug: ${JSON.stringify(slug)}`,
    `name: ${JSON.stringify(f.name)}`,
    `description: ${JSON.stringify(f.description ?? '')}`,
    `roles:${rolesYaml}`,
    `url: ${JSON.stringify(f.url ?? '')}`,
    `createdAt: ${JSON.stringify(f.createdAt)}`,
    `image: ${JSON.stringify(`./images/${imgFilename}`)}`,
    `contentfulId: ${JSON.stringify(w.sys.id)}`,
    '---',
    '',
  ].join('\n');

  await fs.writeFile(path.join(dir, 'index.md'), frontmatter);
}
