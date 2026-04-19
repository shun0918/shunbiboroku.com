---
title: "Tailwindでカラーパレットを拡張すると，@applyでエラーが出るようになる"
slug: "tailwindcss-extend-override"
publishedAt: "2021-09-20"
updatedAt: "2021-09-20"
thumbnail: "./images/thumbnail.png"
contentfulId: "2pxPnjy6cdgj3bslRLQCTX"
---
### 問題

tailwind.config.jsにて，プライマリカラーを追加した。

```

module.exports = {
  purge: {
    enabled: process.env.NODE_ENV !== 'local', //webpack-dev-serverでのビルド時のみfalse
    content: ['./src/**/*.html', './src/**/*.vue'],
  },
  theme: {
    extend: {},
    colors: {
      primary: {
        DEFAULT: '#152222',
      },
    },  },
  variants: {
    extend: {},
  },
  plugins: [],
};
```

それ以降，webpack-dev-serverを立ち上げようとすると以下のようなエラーが出るようになってしまった

```
/フルパス/Hoge.vue The `text-white` class does not exist. If you're sure that `text-white` exists, make sure that any `@import` statements are being properly processed before Tailwind CSS sees your CSS, as `@apply` can only be used for classes in the same CSS tree.
```

該当するHoge.vueはこんな感じ(該当箇所style以下のみ記載しています)

```
// Hoge.vue
~省略~

<style scoped>
.hoge {
  @apply text-white
}
</style>
```

試しにtailwind.config.jsからcolorプロパティを消し，再ビルドしてみると。

#### 原因: extends配下に書いていなかった

`theme > extends > colors`と書かないと，Tailwindのもともと

`theme > colors`  内に書くと，デフォルトの設定(`text-white`など)をすべて上書きしてしまうようです。

以下のように書き換えたところ，解決しました。

```

module.exports = {
  purge: {
    enabled: process.env.NODE_ENV !== 'local', //webpack-dev-serverでのビルド時のみfalse
    content: ['./src/**/*.html', './src/**/*.vue'],
  },
  theme: {
    extend: {
      // extends配下に書く！
      colors: {
        primary: {
          DEFAULT: '#152222',
        },
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
```

### 参考資料

[](https://tailwindcss.com/docs/customizing-colors)[https://tailwindcss.com/docs/customizing-colors](https://tailwindcss.com/docs/customizing-colors)
