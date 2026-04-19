---
title: "【npm】ERESOLVE unable to resolve dependency treeの解消法"
slug: "err-npm-resolve-dependency-tree"
publishedAt: "2021-03-18"
updatedAt: "2021-03-18"
thumbnail: "./images/thumbnail.jpg"
contentfulId: "8PJlVnw4uDW2F9EyrcDQj"
---
### 背景

Contentfulで取得したリッチテキストをHTMLに返還するためのパッケージをインストールしようとした際に問題が発生しました。

```
docker-compose run nodejs sh -c "cd blog-nextjs && npm install @contentful/rich-text-react-renderer --save"
```

上記はDocker Composeを使用しています。問題の部分はこちらです。

```
npm install @contentful/rich-text-react-renderer --save --legacy-peer-deps"
```

こちらを実行したところ、下記のようなエラーが発生しました。

```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
npm ERR! 
npm ERR! While resolving: blog-nextjs@0.1.0
npm ERR! Found: react@17.0.1
npm ERR! node_modules/react
npm ERR!   react@"17.0.1" from the root project
npm ERR! 
npm ERR! Could not resolve dependency:
npm ERR! peer react@"^16.8.6" from @contentful/rich-text-react-renderer@14.1.2
npm ERR! node_modules/@contentful/rich-text-react-renderer
npm ERR!   @contentful/rich-text-react-renderer@"*" from the root project
npm ERR! 
npm ERR! Fix the upstream dependency conflict, or retry
npm ERR! this command with --force, or --legacy-peer-deps
npm ERR! to accept an incorrect (and potentially broken) dependency resolution.
npm ERR! 
npm ERR! See /root/.npm/eresolve-report.txt for a full report.
```

unable to resolve dependency treeを直訳すると「依存関係ツリーを解決できません」という意味です。

### 結論

以下のコマンドでうまくいきました。

```
npm install @contentful/rich-text-react-renderer --save --legacy-peer-deps
```

### 解説

以下たらたらと解説していきます。

先程エラーの中に下記のような記述がありました。

```
npm ERR! Fix the upstream dependency conflict, or retry
npm ERR! this command with --force, or --legacy-peer-deps
npm ERR! to accept an incorrect (and potentially broken) dependency resolution.
```

「--force」か「--legacy-peer-deps」をつけてやってみ〜みたいなことが書いてあるので、それぞれのコマンドを調べます。

#### --force

名前の通り「強制的に実行させる」もののようです。

> [https://docs.npmjs.com/cli/v6/commands/npm-install](https://docs.npmjs.com/cli/v6/commands/npm-install)
>
> The -f or --force argument will force npm to fetch remote resources even if a local copy exists on disk.

#### --legacy-peer-deps

こちらは親ライブラリのバージョンとの依存関係を無視してインストールさせるもののようです。

> [https://docs.npmjs.com/cli/v6/commands/npm-install](https://docs.npmjs.com/cli/v6/commands/npm-install)
>
> --legacy-peer-deps: ignore all peerDependencies when installing, in the style of npm version 4 through version 6.

こちらを深掘りすると本編の趣旨からずれてしまうので割愛しますが、気になる方は下記URLの記事を読まれることをお勧めします。

https://qiita.com/cognitom/items/acc3ffcbca4c56cf2b95

#### --legacy-peer-depsで実行することに

正直どちらでも可能だとは思いますが、別ライブラリとの依存関係が今回のネックとなっているようなのでこちらをオプションとして選択しました。

```
npm install @contentful/rich-text-react-renderer --save --legacy-peer-deps
```

これで無事インストールできました。めでたしめでたし。

### 参考文献

[https://qiita.com/koh97222/items/c46d1ef2a63b92bb6c15](https://qiita.com/koh97222/items/c46d1ef2a63b92bb6c15)
[https://docs.npmjs.com/cli/v6/commands/npm-install](https://docs.npmjs.com/cli/v6/commands/npm-install)
