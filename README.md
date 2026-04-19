This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## コンテンツ管理

ブログ記事 (Post) と制作物 (Works) はすべてリポジトリ内の Markdown で管理する。Contentful CMS は使用しない。

### ディレクトリ構成

```
content/
├── post/<slug>/
│   ├── index.md          # frontmatter + 本文
│   └── images/           # サムネイルと埋め込み画像
│       ├── thumbnail.<ext>
│       ├── embed-001.<ext>
│       └── ...
└── works/<slug>/
    ├── index.md
    └── images/
        └── image.<ext>
```

`content/**/images/` はビルド前フック (`scripts/copy-content-images.js`) によって `public/content/` へコピーされ、`/content/<type>/<slug>/images/<file>` の URL で配信される。

### Post の追加手順

1. `content/post/<slug>/` ディレクトリを作成（`<slug>` は URL に使われるのでケバブケース推奨）
2. 画像ファイルを `content/post/<slug>/images/` に配置
3. `content/post/<slug>/index.md` を以下のテンプレートで作成

   ```markdown
   ---
   title: "記事のタイトル"
   slug: "my-post"
   publishedAt: "2026-04-19"
   updatedAt: "2026-04-19"
   thumbnail: "./images/thumbnail.png"
   ---

   ### 大見出し

   本文...
   ```

4. `git add` → `git commit` → `git push` でデプロイ

### Works の追加手順

`content/works/<slug>/index.md` を以下のテンプレートで作成（本文は任意）。

```markdown
---
slug: "my-work"
name: "プロダクト名"
description: "短い説明"
roles:
  - "Design"
  - "Next.js"
url: "https://example.com"
createdAt: "2026-04-19"
image: "./images/image.png"
---
```

### 見出しレベル

Post 本文の見出しは `###` を最上位にする（`#` / `##` は使わない）。これは既存の `post-body.scss` が `h3` 起点に装飾していることに合わせるための規約。

| 記法 | 実際の要素 | 用途 |
|---|---|---|
| `###` | h3 | 大見出し |
| `####` | h4 | 中見出し |
| `#####` | h5 | 小見出し |
| `######` | h6 | 最小見出し |

### コードブロック

```` ```言語名 ```` でフェンスを開き、閉じる。言語を指定すると `rehype-prism-plus` が構文ハイライトを付ける。

### 画像の参照

本文内の画像は `./images/<file>` の相対パスで書く。レンダリング時に `/content/<type>/<slug>/images/<file>` に解決される。

### OGP の description

Post の `description` は `index.md` 本文の先頭 100 文字から自動生成される。frontmatter に書く必要はない。

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.
