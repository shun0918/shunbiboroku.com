---
title: "【Next.js】Missing component: <Html />が出た時の対応備忘録"
slug: "missing-component-error"
publishedAt: "2021-04-06"
updatedAt: "2021-04-06"
thumbnail: "./images/thumbnail.png"
contentfulId: "EgdfZAlAvBd6GwGfK8Ia0"
---
### 問題

本サイトにGoogle Analyticsを導入するべく下記URLを参考に実装を行なった。

https://panda-program.com/posts/nextjs-google-analytics

https://sunday-morning.app/posts/2020-12-09-nextjs-google-analytics

しかし、ブランチをプッシュしたところ、Vercel側で以下のようなエラーが発生した。

```
09:43:17.891  Unhandled error during request: TypeError: Cannot read property 'type' of null09:43:17.891
      at /vercel/path0/.next/serverless/pages/_error.js:2013:1309:43:17.892
      at /vercel/path0/node_modules/react/cjs/react.production.min.js:17:388...
```

また\`npm run dev\`した際のTerminalのログを確認すると、以下のようなエラーが出てきた。

```
nodejs_1  | warn  - Your custom Document (pages/_document) did not render all the required subcomponent.
nodejs_1  | Missing component: <Html />
nodejs_1  | Read how to fix here: https://err.sh/next.js/missing-document-component
```

警告に出ている\`page/\_document.js\`がこちら

import Document, { Head, Main, NextScript } from 'next/document'
import { existsGaId, GA\_ID } from '../lib/ga/gtag'

```
export default class MyDocument extends Document {
  render() {
    return (
      <html lang="ja">
        <Head>
          {/* Google Analytics */}
          {existsGaId && (
            <>
              <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_ID}', {
                    page_path: window.location.pathname,
                  });`,
                }}
              />
            </>
          )}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    )
  }
}
```

### 原因

Next.jsでDocumentをカスタムする際は、`<html>`の代わりに\<Html\>が必要みたいです。

> https://nextjs.org/docs/advanced-features/custom-document
> `<Html>`, `<Head />`, `<Main />` and `<NextScript />` are required for the page to be properly rendered.

### 解決策

したがって、以下のように修正したところ、解決しました。

```
import Document, { Html, Head, Main, NextScript } from 'next/document'
import { existsGaId, GA_ID } from '../lib/ga/gtag'
```

```
export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="ja">
        <Head>
          {/* Google Analytics */}
          {existsGaId && (
            <>
              <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_ID}', {
                    page_path: window.location.pathname,
                  });`,
                }}
              />
            </>
          )}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
```
