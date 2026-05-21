# todo.md — ChickenQR タスク管理

## 現在のフェーズ
**Phase 0 (プロジェクト初期化) — GitHub repo 作成・Cloudflare 連携待ち**

---

## 未完了タスク

### 計画フェーズ
- [ ] plan.md / spec.md / CLAUDE.md をてつてつが最終確認
- [ ] 新技術導入時の理解度テスト（qr-code-styling / errorCorrectionLevel / Cloudflare Pages の概念）

### Phase 0-B: GitHub リポジトリ作成
- [ ] `git init` → ローカルでリポジトリ初期化
- [ ] `.gitignore` を作成（OS固有ファイル、エディタ設定など）
- [ ] GitHub リポジトリ `tetutetu214/chickenqr` をパブリックで作成（Claude が `gh repo create` で実行可）
- [ ] Secret Scanning + Push Protection を有効化（Claude が `gh api` で実行可、memory `feedback_gh_api_nested_fields.md` 注意）
- [ ] 初回コミット & push（docs/ + CLAUDE.md + image/Chicken.png）

### Phase 0-C: Cloudflare Pages 連携 + DNS（てつてつ手動・Cloudflare ダッシュボード）
- [ ] Cloudflare Pages にプロジェクト作成、GitHub リポジトリ連携
- [ ] ビルドコマンド: なし、出力ディレクトリ: ルート
- [ ] Cloudflare DNS で `chicken-qr.tetutetu214.com` を Pages に CNAME 設定
- [ ] HTTPS 証明書発行を確認（自動）
- [ ] 初回デプロイが `chicken-qr.tetutetu214.com` で 200 を返すことを確認（中身は docs と画像だけで OK）

### Phase 1: MVP（Codex 委譲）
- [ ] Codex に index.html / styles.css / app.js の Phase 1 雛形を依頼
   - URL 入力のみ、ニワトリ画像は `/image/Chicken.png` 固定、PNG ダウンロード
   - qr-code-styling@1.9.2 を CDN 読み込み
- [ ] Claude Code が diff レビュー
- [ ] ローカルでブラウザ確認（QR 読み取りテスト含む）
- [ ] commit & push
- [ ] Cloudflare Pages の自動デプロイ完了確認
- [ ] `chicken-qr.tetutetu214.com` で動作確認

### Phase 2: フル機能（Codex 委譲）
- [ ] データ種別タブ追加（URL/Text/Wi-Fi/連絡先/Mail/Tel/SMS）
- [ ] データ種別ごとの入力フォーム
- [ ] エスケープ・エンコード処理（Wi-Fi / MeCard / vCard / mailto / sms）
- [ ] SVG ダウンロード追加
- [ ] レスポンシブ調整（モバイル / デスクトップ）
- [ ] `_headers` ファイル追加（CSP は Phase 2 末で検討）

### Phase 3: 拡張（任意）
- [ ] ユーザー画像アップロード対応（FileReader）
- [ ] Cloudflare Web Analytics 組み込み
- [ ] 動的 OG 画像（必要に応じて）
- [ ] tetutetu214.com 本体サイト構築時にパス統合検討

### リリース前チェック（Phase 2 完了後）
- [ ] spec.md の「動作確認チェックリスト」を全項目通す
- [ ] README 整備（日本語、スクリーンショット込み）
- [ ] favicon / OGP 設定
- [ ] LICENSE (MIT) 配置

---

## 完了タスク

- [x] プロジェクトフォルダ作成（2026-05-21）
- [x] docs/ 4ファイル初期化（2026-05-21）
- [x] plan.md 初版起草（2026-05-21）
- [x] てつてつ提示の要件定義書（ChickenQR ベース）を受領（2026-05-21）
- [x] フォルダ名を `qr-code-generator` → `chickenqr` にリネーム（2026-05-21）
- [x] plan.md / spec.md / CLAUDE.md / todo.md / knowledge.md を要件定義書ベースで全面書き換え（2026-05-21）
- [x] ホスティング方針を「tetutetu214.com 統合」案から「Pages スタンドアロン + サブドメイン CNAME」に修正（2026-05-21）
- [x] オープン課題を確定: 画像=Chicken.png 1枚固定 / ライセンス=MIT / README=日本語のみ / dev環境=作らない（2026-05-21）
- [x] **Phase 0-A: ニワトリ画像配置完了**（`image/Chicken.png` をてつてつが配置、2026-05-21）
