---
title: "管理者にブランチ保護設定を適用するInclude administrators がなくて一瞬困った"
slug: "github_branch_procection_administrators"
publishedAt: "2023-02-20"
updatedAt: "2023-02-20"
thumbnail: "./images/thumbnail.jpg"
contentfulId: "33FnSS3bGNIW9TCVd91WXo"
---
### 背景

業務で開発しているReporsitoryの管理者権限を付与されたとき、そのリポジトリに「masterへ直でpushできてしまうことがわかりました。」このまま開発するのは危険なので、設定周りをいじっていたのですが、検索でヒットする「Include administrators」の設定が見当たらず、困っていました。

Githubでブランチ保護設定した時の作業メモ - Qiita https://qiita.com/da-sugi/items/ba3cd83e64c689795c50

### 結論

**Do not allow bypassing the above settings**をチェックすれば、OK。

![setting_to_protect_branch](./images/embed-001.png)

pushすると、いい感じに怒られていることも確認できました。

![failed to push](./images/embed-002.png)
