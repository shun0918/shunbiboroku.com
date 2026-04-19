# migrate-contentful

Contentful CMS から repository 内 Markdown への一括移行スクリプト（1 回きり）。

## 前提

- `.env.local` に `CONTENTFUL_SPACE_ID` と `CONTENTFUL_ACCESS_TOKEN` が定義されていること
- Node 20+

## 実行

```bash
npm run migrate:contentful                              # 全件
npm run migrate:contentful -- --use-cache               # tmp/contentful-raw.json を再利用
npm run migrate:contentful -- --type post               # post のみ
npm run migrate:contentful -- --type post --slug my-slug# 特定 slug のみ
```

## 出力

- `content/post/<slug>/index.md` および `content/post/<slug>/images/*`
- `content/works/<slug>/index.md` および `content/works/<slug>/images/*`
- `tmp/contentful-raw.json`: 生 entry のキャッシュ
- `tmp/migration-failures.json`: 失敗 entry の詳細（あれば）

## 移行完了後

このディレクトリは Phase 6 で削除される。
