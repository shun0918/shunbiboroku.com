---
title: "TypeScriptを本ブログに導入してみる"
slug: "add-typescript"
publishedAt: "2021-04-29"
updatedAt: "2021-05-08"
thumbnail: "./images/thumbnail.png"
contentfulId: "24s35pr25bCuszFNVQ7736"
---
### 今回得た知見

- デフォルトでは`.ts`か`.tsx`の拡張子ファイルしか、モジュールとしてimport*できない*。
- scss等をimportできるようにするには、`.d.ts`ファイルを作成してあげる必要あり。
- 関数型コンポーネントは`React.FC<Props>`というインターフェースを活用する。
- TypeScriptおもろい、記述量増えるけど。

### 背景

本ブログの表側で見せたいものは、大体作成できました。

「次は何を導入しよう…」と考えていたところ、おぼろげながら「TS」という文字が浮かんできました。

そのため、開発環境の整備と、学習をかねてESLintやTypeScriptの導入に取り組んでいます。

今回は、「TypeScript」導入過程の一部をご紹介します。

### 取り組み前の筆者のTypeScript知識

- TypeScriptは型を決められるらしい、安全
- 拡張子は`.ts`、JSX使う場合は`.tsx`を指定する

つまり、TypeScriptそのものは無知に等しいです。

### 実施内容

#### TypeScriptのインストール

まず、TypeScriptをインストールます。

```
npm install --save-dev typescript @types/react @types/react-dom @types/node
```

なお、ESLintを使用していたので、こちらのプラグインもインストールします。

```
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

#### とりあえずそれっぽく書く

インストールできたので、早速手を動かしながら進めていくことにしました。下記記事を参考に作業を進めていきます。

[TypeScript の概要 - Qiita](https://qiita.com/EBIHARA_kenji/items/4de2a1ee6e2a541246f6)

```
//SectionHeader.ts (SectionHeader.jsから拡張子を変更)

import styles from '../styles/components/SectionHeader.module.scss';
'../styles/components/SectionHeader.module.scss' or its corresponding type declarations.

function SectionHeader({title} : {title: string}) {
  return (
    <div className={styles['section-header']}>
      <h2 className={styles['section-header__title']}>{title}</h2>
    </div>
  );
}

export default SectionHeader
```

#### 案の定怒られる

```
import styles from '../styles/components/SectionHeader.module.scss';
// ↑エラー: Cannot find module 
```

適当すぎて早速VSCode上で怒られました…ツッコミどころが多いかと思いますが、当時私は割と真剣でした（笑）。

#### SCSSファイルを読み込めるようにする

[TypeScript の概要 - Qiita](https://qiita.com/EBIHARA_kenji/items/4de2a1ee6e2a541246f6)

どうやら、TypeScriptはSCSSファイルを認識できないようです。

そもそも、tsconfig.tsも作っていませんでしたね…。

上記の記事を参考にtsconfig.jsonと、scss、cssをTypeScriptが認知できるようにするため記述をするnext-env.d.tsを作成します。

[TypescriptにSCSSをimportした上に型定義を使う - Qiita](https://qiita.com/jerrywdlee/items/3c525001f8029312d5fa)

なお、require文であれば、問題なく読み込めるそうです。ですが、今回はちゃんとimportできるよう設定します。

```
//tsconfig.json
{
  "compilerOptions": {
    "sourceMap": true,
    "noImplicitAny": true,
    "module": "esnext",
    "target": "es6",
    "jsx": "preserve",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleResolution": "node"
  },
  "include": [
    "next-env.d.ts",
    "src/**/*",
  ], 
  "exclude": ["node_modules"]
}
// next-env.d.ts
declare module '*.css';
declare module '*.scss';
```

作成後、エラーも無事消えました。

#### 2021年5月8日追記

`next-env.d.ts`は`create-next-app`でプロジェクトを作成した際、自動的に生成されるそうです。その際作成されるのが以下のファイルです。

```
// next-env.d.ts
/// <reference types="next" />
/// <reference types="next/types/global" />
```

[next-env.d.tsの意味](https://qiita.com/282Haniwa/items/ff3fc9cd783f6f418a35)

私の場合は、TSを後から追加したため、このファイルは作成されませんでした。

この三本スラッシュはコメントではなく、[Triple-Slash Directives](https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html)と呼ばれるものです。結論、こちらが記載されていれば、Reactやcss(scss) modulesがglobalで使用可能になります。

こちらについて詳しく知りたい方は上記の記事を読まれることをお勧めします。

#### 型指定をちゃんとやる

最近導入したESLintを使って、テストをしてみたところ`warning Missing return type on function`

という警告が出ました。

関数コンポーネント自体の戻り値に対し、型指定ができていなかったためですね。

調べてみると、関数コンポーネントは`React.FCインターフェース`で型指定ができるようです。

以下参照記事です。

[React - TypeScript Deep Dive 日本語版](https://typescript-jp.gitbook.io/deep-dive/tsx/react)

そこで、先程のコンポーネントに組み込んでみました。

```
import styles from '../styles/components/SectionHeader.module.scss';

//propsの型を定義
type Props = {
  title: string;
};

// 定数＋アロー関数化
const SectionHeader: React.FC<Props> = ({ title }) => {
  return (
    <div className={styles['section-header']}>
      <h2 className={styles['section-header__title']}>{title}</h2>
    </div>
  );
};

export default SectionHeader;
```

これでESLintのエラーが出なくなりました！あとは他のコンポーネントもせってと組み込んでいく予定です。

### 今後

また、今回作成したtsconfig.jsonの中身は朧げにしか理解できていないので、こちらも記事にする予定です。
