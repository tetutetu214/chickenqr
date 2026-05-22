# deploy.md — Cloudflare デプロイ手順（Phase 0-C）

てつてつが手動で Cloudflare ダッシュボードを操作するための手順書。

> ⚠️ **2026-05-22 アップデート**: Cloudflare の新方針により Pages 単体ではなく **Workers Static Assets** として動くようになった。本ファイルの前半（Pages 想定の手順）は試行の経緯として残しつつ、**後半「5. Workers Static Assets 対応（実際の運用）」が現行の有効手順**。

---

## 前提

- GitHub リポジトリ `tetutetu214/chickenqr` がパブリックで作成済み（Phase 0-B 完了）
- `main` ブランチに index.html / styles.css / app.js / image/Chicken.png が push 済み（Phase 1 MVP 完了）
- Cloudflare アカウント（`tetutetu214.com` を DNS 管理）にログイン可能

---

## 手順

### 1. Cloudflare Pages プロジェクト作成

1. Cloudflare Dashboard にログイン
2. 左メニューから **Workers & Pages** → **Create**
3. **Pages** タブを選択 → **Connect to Git**
4. GitHub アカウント連携（未連携なら認可）
5. リポジトリ一覧から `tetutetu214/chickenqr` を選択 → **Begin setup**
6. ビルド設定:
   - **Project name**: `chickenqr`（このまま）
   - **Production branch**: `main`
   - **Framework preset**: None
   - **Build command**: ⚠️ **完全に空のまま**（`/` などを入れない）
   - **Build output directory**: `/`（デフォルト、こちらにだけ `/` を入れる）
7. **Save and Deploy**

> ⚠️ **よくある間違い**: Build command 欄に `/` を入れてしまうと、シェルが `/` をコマンドとして実行しようとして `Permission denied` で失敗する（2026-05-22 に実際に踏んだ）。**Build command は本当に何も入力しない**こと。`/` を入れるのは Build output directory だけ。

初回デプロイが走る。1〜2分で完了し `https://chickenqr.pages.dev` が公開される。

---

### 2. デプロイ動作確認

`https://chickenqr.pages.dev` にブラウザでアクセスして次を確認:

- [ ] ChickenQR のトップ画面が表示される
- [ ] URL 入力欄に値を入れると QR コードがリアルタイムで更新される（300ms debounce）
- [ ] QR コードの中央にニワトリ画像が埋め込まれている
- [ ] スマホの QR スキャナで読み取ると入力した URL が取れる
- [ ] 「PNG ダウンロード」を押すと `chicken-qr.png` がダウンロードされる
- [ ] スマホで開いてもレイアウトが崩れない（640px 以下で1カラム）

問題があれば、ブラウザの DevTools Console でエラーを確認してください。

---

### 3. 独自ドメイン設定（`chicken-qr.tetutetu214.com`）

1. Pages プロジェクト画面 → **Custom domains** タブ
2. **Set up a custom domain**
3. `chicken-qr.tetutetu214.com` を入力 → **Continue**
4. Cloudflare が DNS 設定を提案（CNAME → `chickenqr.pages.dev`）
5. **Activate domain** を押すと、tetutetu214.com の DNS に自動で CNAME が追加される
6. 数分待つと HTTPS 証明書が発行される（自動）

完了後、`https://chicken-qr.tetutetu214.com` にアクセスして 200 OK で QR ツールが開けば成功。

---

### 4. `_headers` ファイル（Phase 2 で追加予定）

現状は未設定。Phase 2 で以下を追加予定:

```
/*
  Cache-Control: public, max-age=300
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

---

## トラブルシューティング

- **`/bin/sh: 1: /: Permission denied` でビルド失敗**: Build command 欄に `/` などコマンド以外の値が入っている。Settings → Builds & deployments → Configure production deployments で Build command を**空に修正**して Save、Deployments で Retry
- **404 が出る**: Build output directory が `/`（ルート）になっているか確認
- **画像が表示されない**: index.html の `src="/image/Chicken.png"` の大文字小文字を確認（`Chicken.png` は C 大文字）
- **QR が表示されない**: ブラウザ DevTools の Console と Network タブで `qr-code-styling@1.9.2` が unpkg から 200 で読まれているか確認
- **DNS が反映されない**: Cloudflare 内部 DNS は通常即時反映。5分待っても繋がらないなら Custom domains 画面でステータスを確認
- **HTTPS が `Provisioning` のまま**: 5〜15分かかることがある。気長に待つ

---

## 自動デプロイの仕組み

main ブランチに push するたびに Cloudflare が自動でビルド & デプロイを走らせる。CI 設定は不要。Phase 2 以降の更新もブランチ → PR → main マージで自動反映される。

---

## 5. Workers Static Assets 対応（実際の運用、2026-05-22 以降）

### 経緯

Cloudflare ダッシュボードで「Pages」として作成したつもりだったが、初回デプロイログに次が出た:

```
Executing user deploy command: npx wrangler deploy
Detected Project Settings:
 - Worker Name: chickenqr
 - Framework: Static
 - Output Directory: .
```

つまり Workers Static Assets として動いていた。Cloudflare は Pages を Workers Static Assets に統合する方針で、新規プロジェクトはこの形式で作られるようになっている。

### 発生した問題

Output Directory が `.`（リポジトリ全体）になっていたため、`.git/HEAD` `.git/config` `.git/objects/*` `docs/*.md` `CLAUDE.md` 等まで全て配信対象になった。静的サイト公開としてはセキュリティ上望ましくない。

### 対応: `public/` 集約 + `wrangler.jsonc` 追加

リポジトリ構成を次に変更:

```
chickenqr/
├ public/                   ← 配信対象
│  ├ index.html
│  ├ styles.css
│  ├ app.js
│  └ image/Chicken.png
├ wrangler.jsonc            ← Workers 設定
├ docs/                     ← 非配信
├ CLAUDE.md / LICENSE / README.md / .gitignore
└ ...
```

`wrangler.jsonc` の内容:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "chickenqr",
  "compatibility_date": "2026-05-22",
  "assets": {
    "directory": "./public",
    "not_found_handling": "single-page-application"
  }
}
```

`assets.directory: "./public"` で配信対象を `public/` 配下に限定。`.git/` や `docs/` は配信されない。

### Cloudflare ダッシュボード側の確認

main に上記変更を push すれば自動で再デプロイが走り、`wrangler.jsonc` を読んで `public/` だけを配信する。ダッシュボード側の Build output directory 設定は wrangler.jsonc が優先されるので触らなくて OK。

ビルドログで次が出ていれば成功:

```
🌀 Building list of assets...
✨ Read N files from the assets directory /opt/buildhome/repo/public
```

`/opt/buildhome/repo` のままなら旧設定が読まれている → ダッシュボードで Retry deployment。

### Worker のカスタムドメイン設定（`chicken-qr.tetutetu214.com`）

Workers Static Assets は Pages とは別の手順:

1. Workers & Pages → `chickenqr` Worker を開く
2. **Settings** タブ → **Domains & Routes** セクション
3. **Add** → **Custom Domain**
4. `chicken-qr.tetutetu214.com` を入力 → **Add Domain**
5. tetutetu214.com の DNS に自動で CNAME が追加される
6. 数分後 HTTPS 証明書が発行される

完了後 `https://chicken-qr.tetutetu214.com` で 200 OK なら成功。

### 配信URL（デフォルト workers.dev）

カスタムドメイン設定前でも次の URL で動作確認可能:

```
https://chickenqr.lemoned-i-scream-art-of-noise.workers.dev
```

このサブドメインは workers.dev 配下で自動付与される。

---

## トラブルシューティング（追記）

- **`.git/` や `docs/` が配信されてしまう**: `wrangler.jsonc` の `assets.directory` が `./public` になっているか、配信したいファイルが `public/` 配下にあるか確認
- **`Pages として作ったはずが Worker として動く`**: Cloudflare の最新挙動。Workers Static Assets で続行して問題なし。手順は本ファイル「5. Workers Static Assets 対応」に従う
- **Build output directory に何を入れても反映されない**: `wrangler.jsonc` がリポジトリにある場合、ダッシュボードのその欄は無視される。`wrangler.jsonc` の `assets.directory` を変える
