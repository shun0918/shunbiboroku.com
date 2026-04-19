---
title: "WebpackのconfigファイルをTypeScriptで書こうとするとdevserverプロパティでTSエラーになる"
slug: "webpack-config-ts-error"
publishedAt: "2021-05-23"
updatedAt: "2021-05-23"
thumbnail: "./images/thumbnail.png"
contentfulId: "6gG0f3r8hGf4L0NTht85wE"
---
### 結論

Issueを見る限り、解決していないようなので、`webpack-dev-server`を使う場合は大人しくJSで書いた方が良さそうです。

https://github.com/DefinitelyTyped/DefinitelyTyped/issues/43232

### バージョン

```
    "@types/webpack": "^5.28.0",
    "@types/webpack-dev-server": "^3.11.4",
    "webpack": "^5.37.0",
    "webpack-cli": "^4.7.0",
    "webpack-dev-server": "^3.11.2"
```

### 背景

webpackを勉強中に「webpack.config.js」をTypeScriptでかけたら楽だなと感じたので試みたのですが、「devServer」でエラーが出てしまいます。

import { Configuration } from "webpack";

export const config: Configuration = {
...
  devServer: {
    contentBase: "./dist",
    host: "0.0.0.0",
    port: "8080",
    hot: true,
    historyApiFallback: true,
    open: true,
},
// Type '{ mode: "development"; entry: string; output: { path: any; filename: string; }; module: { rules: { test: RegExp; use: string; exclude: RegExp; }\[\]; }; resolve: { extensions: string\[\]; }; target: string\[\]; devtool: string; devServer: { ...; }; plugins: any\[\]; }' is not assignable to type 'Configuration'.

webpackのモジュール内のConfigurationインターフェース内にdevServerの項目がないことが原因のようです。

これについては、冒頭に載せたURLを参照する限り、未だ解決していないようです。

解決策が出たら、追記します。
