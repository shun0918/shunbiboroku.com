---
title: "【React Next.js】classNameに複数のクラスを指定する方法"
slug: "multiclassname"
publishedAt: "2021-03-15"
updatedAt: "2021-04-03"
thumbnail: "./images/thumbnail.png"
contentfulId: "5nstabogGZjS4DrvwsYuhi"
---
### 結論

以下の方法で複数のクラス名を指定可能

```
<div className={`${styles.container} ${styles.container_bg}`}></div>
```

### 背景

Next.jsでプロジェクトを作成したので、ウェルカムページをいじりながら使用を確認することにしました。

index.js内のクラスの当て方をみると、cssファイルをインポートしてその値を当てていることがわかりました。

```
import styles from '../styles/Home.module.css'
```

`Home`コンポーネントのcontainerクラスは「className」属性を用いて当てられています。

```
<div className={styles.container}>
```

これをみたとき、「複数クラスつけるのってどうやるんだろう」と感じたので、その方法を調査しました。

### 方法

今回は背景色を追加する「container-bg」クラスを当ててみます。

Home.module.cssに下記を追加しました。薄い青色を指定しています。

```
.container-bg {
  background-color: #a3ceff;
}
```

#### 半角スペースでつなげる

半角スペースでつなげるとうまくいきました。

```
<div className={`${styles.container} ${styles["container-bg"]}`}>
```

オブジェクトのkeyにハイフン - を交える場合は場合、\[\]を使ってオブジェクトの指定する必要があります。

![2021-03-14](./images/embed-001.png)

#### ライブラリを利用した方法

「[classnames](https://www.npmjs.com/package/classnames)」というライブラリがあるみたいです。

こちらを利用すると楽に実装できそうですが、クラスを複数指定するだけにライブラリを使うのは個人的に微妙にも感じます。

### 最後に

そもそもreactでは複数クラスを推奨しているのかどうかなど、色々学ぶ必要がありますね。

分かり次第、記事にしようと思います。
