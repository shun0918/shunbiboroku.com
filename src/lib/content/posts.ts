import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { CONTENT_DIR, resolveAssetUrl } from './paths';
import { generateDescription } from './description';
import type { Post, PostSummary } from '~/models/post';

const POST_DIR = path.join(CONTENT_DIR, 'post');

type FrontMatter = {
  title?: unknown;
  slug?: unknown;
  publishedAt?: unknown;
  updatedAt?: unknown;
  thumbnail?: unknown;
  contentfulId?: unknown;
};

async function loadRaw(slug: string): Promise<{ data: FrontMatter; content: string }> {
  const file = path.join(POST_DIR, slug, 'index.md');
  const raw = await fs.readFile(file, 'utf-8');
  const parsed = matter(raw);
  return { data: parsed.data as FrontMatter, content: parsed.content };
}

function assertValid(data: FrontMatter, slug: string): asserts data is Required<
  Pick<FrontMatter, 'title' | 'slug' | 'publishedAt' | 'updatedAt' | 'thumbnail'>
> &
  FrontMatter {
  const required: Array<keyof FrontMatter> = [
    'title',
    'slug',
    'publishedAt',
    'updatedAt',
    'thumbnail',
  ];
  for (const key of required) {
    if (typeof data[key] !== 'string' || !data[key]) {
      throw new Error(`[content/post/${slug}] missing frontmatter: ${key}`);
    }
  }
  if (data.slug !== slug) {
    throw new Error(
      `[content/post/${slug}] slug mismatch: frontmatter="${String(data.slug)}", dir="${slug}"`,
    );
  }
}

export async function getAllPostSlugs(): Promise<string[]> {
  const entries = await fs.readdir(POST_DIR, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name);
}

export async function getPostBySlug(slug: string): Promise<Post> {
  const { data, content } = await loadRaw(slug);
  assertValid(data, slug);
  return {
    title: data.title as string,
    slug: data.slug as string,
    publishedAt: data.publishedAt as string,
    updatedAt: data.updatedAt as string,
    thumbnail: resolveAssetUrl('post', slug, data.thumbnail as string),
    description: generateDescription(content),
    body: content,
    contentfulId: typeof data.contentfulId === 'string' ? data.contentfulId : undefined,
  };
}

export async function listPosts(): Promise<PostSummary[]> {
  const slugs = await getAllPostSlugs();
  const posts = await Promise.all(
    slugs.map(async (slug): Promise<PostSummary> => {
      const { data, content } = await loadRaw(slug);
      assertValid(data, slug);
      return {
        title: data.title as string,
        slug: data.slug as string,
        publishedAt: data.publishedAt as string,
        updatedAt: data.updatedAt as string,
        thumbnail: resolveAssetUrl('post', slug, data.thumbnail as string),
        description: generateDescription(content),
        contentfulId: typeof data.contentfulId === 'string' ? data.contentfulId : undefined,
      };
    }),
  );
  return posts.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
