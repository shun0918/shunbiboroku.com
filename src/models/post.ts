export type Post = {
  title: string;
  slug: string;
  publishedAt: string;
  updatedAt: string;
  thumbnail: string;
  description: string;
  body: string;
  contentfulId?: string;
};

export type PostSummary = Omit<Post, 'body'>;
