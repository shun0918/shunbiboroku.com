import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { CONTENT_DIR, resolveAssetUrl } from './paths';
import type { Works } from '~/models/works';

const WORKS_DIR = path.join(CONTENT_DIR, 'works');

type FrontMatter = {
  slug?: unknown;
  name?: unknown;
  description?: unknown;
  roles?: unknown;
  url?: unknown;
  createdAt?: unknown;
  image?: unknown;
  contentfulId?: unknown;
};

function assertValid(data: FrontMatter, slug: string): void {
  const required: Array<keyof FrontMatter> = ['slug', 'name', 'createdAt', 'image'];
  for (const key of required) {
    if (typeof data[key] !== 'string' || !data[key]) {
      throw new Error(`[content/works/${slug}] missing frontmatter: ${key}`);
    }
  }
  if (data.slug !== slug) {
    throw new Error(
      `[content/works/${slug}] slug mismatch: frontmatter="${String(data.slug)}", dir="${slug}"`,
    );
  }
  if (data.roles !== undefined && !Array.isArray(data.roles)) {
    throw new Error(`[content/works/${slug}] roles must be an array`);
  }
}

export async function listWorks(): Promise<Works[]> {
  const entries = await fs.readdir(WORKS_DIR, { withFileTypes: true });
  const slugs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  const works = await Promise.all(
    slugs.map(async (slug): Promise<Works> => {
      const file = path.join(WORKS_DIR, slug, 'index.md');
      const raw = await fs.readFile(file, 'utf-8');
      const { data } = matter(raw) as { data: FrontMatter };
      assertValid(data, slug);
      return {
        slug: data.slug as string,
        name: data.name as string,
        description: typeof data.description === 'string' ? data.description : '',
        roles: Array.isArray(data.roles) ? (data.roles as string[]) : [],
        url: typeof data.url === 'string' ? data.url : '',
        createdAt: data.createdAt as string,
        image: resolveAssetUrl('works', slug, data.image as string),
        contentfulId: typeof data.contentfulId === 'string' ? data.contentfulId : undefined,
      };
    }),
  );
  return works.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
