---
title: "【Next.js】エラー: symbol cannot be serialized as JSON. を解決"
slug: "getstaticprops-error"
publishedAt: "2021-05-05"
updatedAt: "2021-05-05"
thumbnail: "./images/thumbnail.png"
contentfulId: "9PkLoq6vF85MZvOokJYVg"
---
### 背景

TypeScript移行も終盤に差し掛かり、ESLintのwarning潰しとリファクタリングをしている際にエラーにぶち当たりました。

該当箇所は、記事ページ用の`[slug].tsx`です。

```
const Slug = (props: Props): JSX.Element => {
  const body = _documentToReactComponents(props.post.fields.body as Document);
  console.log(props.post.fields.body);

  return (
		<PostContent body={body}></PostContent>
	)
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
	// Contentfulから投稿情報を取得
  const post: Entry<Post> = await fetchPostBySlug(params.slug, 'post');
	// リッチテキストをReactNodeに変換
  const body: ReactNode = _documentToReactComponents(post.fields.body as Document);

  return {
    props: {
      post,
      body,
    },
  };
};
```

すると、以下のようなエラーが発生しました。

```
Server Error
Error: Error serializing `.body[0].$$typeof` returned from `getStaticProps` in "/post/[slug]".
Reason: `symbol` cannot be serialized as JSON. Please only return JSON serializable data types.
```

### 原因

JSONとしてシリアル化出来るものをpropsとして渡せ！と怒られました。シリアル化とは、オブジェクトをテキストやバイト列などに変換することです。今回の場合は、「JSON」として変換することを指します。

つまり、このエラーからReactNode型はJSONにできないことがわかりました。

そもそも、getStaticPropsはサーバサイドでJSONファイルを生成するもので、JSXのようにJSONにできないものはpropsとして渡すことはで着ないことがわかりました。もともとJSXはReact.createElementの糖衣構文ですから、無理というわけです。

> Statically Generates both HTML and JSON
> When a page with getStaticProps is pre-rendered at build time, in addition to the page HTML file, Next.js generates a JSON file holding the result of running getStaticProps.
> This JSON file will be used in client-side routing through next/link (documentation) or next/router (documentation). When you navigate to a page that’s pre-rendered using getStaticProps, Next.js fetches this JSON file (pre-computed at build time) and uses it as the props for the page component. This means that client-side page transitions will not call getStaticProps as only the exported JSON is used.
> When using Incremental Static Generation getStaticProps will be executed out of band to generate the JSON needed for client-side navigation. You may see this in the form of multiple requests being made for the same page, however, this is intended and has no impact on end-user performance
> [Basic Features: Data Fetching | Next.js](https://nextjs.org/docs/basic-features/data-fetching#statically-generates-both-html-and-json)

### 解決策

```
const Slug = (props: Props): JSX.Element => {
  //追加：リッチテキストをReactNode変換
  const body = _documentToReactComponents(props.post.fields.body as Document);
  console.log(props.post.fields.body);

  return (
		<PostContent body={body}></PostContent>
	)
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
	// Contentfulから投稿情報を取得
  const post: Entry<Post> = await fetchPostBySlug(params.slug, 'post');
	// 変換処理を関数コンポーネント内に移行

  return {
    props: {
      post,
    },
  };
};
```

上記のように、関数コンポーネント内でReactNodeを生成する処理を行うことで解決しました。
