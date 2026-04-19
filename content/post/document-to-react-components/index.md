---
title: "【Contentful】Contentfulから受け取ったリッチテキストをHTMLに変換する備忘録"
slug: "document-to-react-components"
publishedAt: "2021-03-19"
updatedAt: "2021-03-18"
thumbnail: "./images/thumbnail.jpg"
contentfulId: "4lwcipU0JK8xmbyViMh8b"
---
### 結論

#### 1. @contentful/rich-text-react-rendererインストール

```
npm install @contentful/rich-text-react-renderer --save --legacy-peer-deps
```

#### 2. documentToReactComponentsをimport

```
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
```

#### 3. Contentfulから受け取ったリッチテキストフィールドを変換

```
documentToReactComponents(リッチテキストのフィールド)
```

### 蛇足

前回インストールした`"rich-text-react-renderer"`を早速使用インストールしてみました！

やらねばならないことは結論で述べた内容の通りなので、書くことがほぼないのですが、現状こんな感じというのをご紹介します。

```
/** postContent.js */
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
```

```
function PostContent({ title, thumbnail, body, publishedAt, updatedAt, slug }) {
  console.log(body);
  
  return (
    <div className={"container"}>
      <h1>{ title }</h1>
      <small>投稿日{" "}{publishedAt}</small>
      <div>
        <img className="img" alt={thumbnail.fields.file.fileName} src={thumbnail.fields.file.url} />
      </div>
      <div className="contentBody">
        {documentToReactComponents(body)}
      </div>
      <div>
        
      </div>
      <style jsx>
        {`.container {
          max-width:1024px;
          margin: 0 auto;
          padding: auto 5%;
        }`}
      </style>
    </div>
  )
}

export default PostContent
```

![npm-icon](./images/embed-001.jpg)

### 次回

これで、投稿一覧と投稿単体ページに必要なデータが取れるようになりました。

現状はデザインに関してノータッチです。ここからどんなブログのデザインにしていくか考えていこうと思います。

現職でもデザイナーがいなかったので自分でXDでカンプ作って実装やってました。

なのでわりかし慣れていますし、クリエイティブなことは好きなので楽しくやってきます。
