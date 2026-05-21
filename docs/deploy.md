# deploy.md — Cloudflare Pages 連携手順（Phase 0-C）

てつてつが手動で Cloudflare ダッシュボードを操作するための手順書。

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
   - **Build command**: 空のまま
   - **Build output directory**: `/`（デフォルト）
7. **Save and Deploy**

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

- **404 が出る**: Build output directory が `/`（ルート）になっているか確認
- **画像が表示されない**: index.html の `src="/image/Chicken.png"` の大文字小文字を確認（`Chicken.png` は C 大文字）
- **QR が表示されない**: ブラウザ DevTools の Console と Network タブで `qr-code-styling@1.9.2` が unpkg から 200 で読まれているか確認
- **DNS が反映されない**: Cloudflare 内部 DNS は通常即時反映。5分待っても繋がらないなら Custom domains 画面でステータスを確認
- **HTTPS が `Provisioning` のまま**: 5〜15分かかることがある。気長に待つ

---

## 自動デプロイの仕組み

main ブランチに push するたびに Cloudflare Pages が自動でビルド & デプロイを走らせる。CI 設定は不要。Phase 2 以降の更新もブランチ → PR → main マージで自動反映される。
