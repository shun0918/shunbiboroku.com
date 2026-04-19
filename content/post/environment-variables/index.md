---
title: "【Next.js】envファイルの値をHTMLに出力しようとするとWarning: Did not expect server HTML to contain the text node \" \" inと出る"
slug: "environment-variables"
publishedAt: "2021-04-22"
updatedAt: "2021-04-22"
thumbnail: "./images/thumbnail.png"
contentfulId: "36U5bcCqoXBNVdJuJDGMsY"
---
### 結論

envファイルの中身は出力させることはできない。

### 背景

本ブログのUIを実装中に「ブログ名をENVファイルで活用すればテンプレートとして配布できるかも？」と考えました。

そこで、env.localに以下の変数を用意しました。

```
# env.local
BLOGNAME=Shun Bibo Roku
```

```
// GrobalNav.js
function GrobalNav() {
  const blogName = process.env.BLOGNAME
```

```
  return(
    <div className="grobal-nav">
      <h1 className="grobal-nav__title">{blogName}</h1>
    </div>
  )
}
```

しかし、以下のエラーがコンソール上に出てうまくいきませんでした。

Warning: Did not expect server HTML to contain the text node "Shun Blog" in \<h1\>

### next.config.js使うのが無難？

公式のドキュメントでは「next.config.js」使って出力してるので、これが有効そうですね。

https://nextjs.org/docs/api-reference/next.config.js/environment-variables

```
//next.config.js
module.exports = {
  env: {
    blogName: 'Shun Bibo Roku',
  },
}
```

呼び出し側は変わらず、`process.env.hogehoge`で行います。

```
// GrobalNav.js
function GrobalNav() {
  const blogName = process.env.blogName
```

```
  return(
    <div className="grobal-nav">
      <h1 className="grobal-nav__title">{blogName}</h1>
    </div>
  )
}
```
