import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import rehypePrismPlus from 'rehype-prism-plus';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import Header from '~/components/Header';
import PostContent from '~/components/PostContent';
import { getAllPostSlugs, getPostBySlug } from '~/lib/content/posts';
import styles from '~/styles/pages/post/[slug].module.scss';

type RouteParams = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getPostBySlug(slug);
    return {
      title: post.title,
      description: post.description,
      openGraph: {
        type: 'article',
        url: '/post/' + post.slug,
        title: post.title,
        description: post.description,
        images: [post.thumbnail],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.description,
        images: [post.thumbnail],
      },
    };
  } catch {
    return {};
  }
}

export const dynamicParams = false;

export default async function PostPage({ params }: { params: RouteParams }) {
  const { slug } = await params;
  let post;
  try {
    post = await getPostBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <>
      <Header />
      <main className={styles.main}>
        <PostContent
          title={post.title}
          thumbnail={post.thumbnail}
          body={
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, [rehypePrismPlus, { ignoreMissing: true }]]}
              components={{
                img: ({ src, alt, width, height }) => {
                  const resolved =
                    typeof src === 'string' && src.startsWith('./')
                      ? '/content/post/' + post.slug + '/' + src.replace(/^\.\//, '')
                      : src;
                  return <img src={resolved} alt={alt ?? ''} width={width} height={height} />;
                },
                a: ({ href, children, ...rest }) => (
                  <a
                    href={href}
                    {...(typeof href === 'string' && /^https?:\/\//.test(href)
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                    {...rest}
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {post.body}
            </ReactMarkdown>
          }
          publishedAt={post.publishedAt}
          updatedAt={post.updatedAt}
          slug={post.slug}
        />
      </main>
    </>
  );
}
