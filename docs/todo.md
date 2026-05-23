# todo.md — ChickenQR タスク管理

## 現在のフェーズ
**Phase 0-C (Cloudflare Pages 連携) — てつてつ手動作業待ち**

---

## 未完了タスク

### Phase 0-C: Cloudflare Pages 連携 + DNS（てつてつ手動・Cloudflare ダッシュボード）

`docs/deploy.md` の手順に従って実行。

- [ ] Cloudflare Pages にプロジェクト作成、GitHub `tetutetu214/chickenqr` 連携
- [ ] ビルドコマンド: 空、出力ディレクトリ: `/`
- [ ] 初回デプロイで `chickenqr.pages.dev` が 200 を返すことを確認
- [ ] Cloudflare DNS で `chicken-qr.tetutetu214.com` を Pages に CNAME 設定
- [ ] HTTPS 証明書発行を確認（自動）
- [ ] `https://chicken-qr.tetutetu214.com` で動作確認（QR 表示・読取・PNG DL）

### 理解度テスト
- [ ] qr-code-styling の errorCorrectionLevel='H' の意味
- [ ] Cloudflare Pages と Workers Static Assets の違い
- [ ] CNAME レコードの役割

### Phase 2: フル機能（Codex 委譲）
- [ ] データ種別タブ追加（URL/Text/Wi-Fi/連絡先/Mail/Tel/SMS）
- [ ] データ種別ごとの入力フォーム
- [ ] エスケープ・エンコード処理（Wi-Fi / MeCard / vCard / mailto / sms）
- [ ] SVG ダウンロード追加
- [ ] レスポンシブ細部調整
- [ ] `_headers` ファイル追加（CSP 含む）

### Phase 3: 拡張（任意）
- [ ] ユーザー画像アップロード対応（FileReader）
- [ ] Cloudflare Web Analytics 組み込み
- [ ] 動的 OG 画像
- [ ] tetutetu214.com 本体サイト構築時にパス統合検討

### リリース前チェック（Phase 2 完了後）
- [ ] spec.md の「動作確認チェックリスト」を全項目通す
- [ ] README 整備（日本語、スクリーンショット込み）
- [ ] favicon / OGP 設定

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
- [x] **Phase 0-A: ニワトリ画像配置完了**（`image/Chicken.png`、2026-05-21）
- [x] **Phase 0-B: GitHub repo 作成完了**（tetutetu214/chickenqr、Secret Scanning + Push Protection 有効化、2026-05-21）
- [x] **Phase 0-B: PR #1 を feature/initial-setup から main に squash マージ**（docs/CLAUDE.md/LICENSE/.gitignore/README/Chicken.png、commit c6b505b、2026-05-21）
- [x] **Phase 1 MVP 実装完了**: Codex 委譲で index.html / styles.css / app.js 作成、レビュー後 PR #2 を main に squash マージ（commit 1cf8de0、2026-05-22）
- [x] **docs/deploy.md 作成**: Cloudflare Pages 連携手順をてつてつ向けにドキュメント化（2026-05-22）
- [x] **緊急 fix: public/ 集約 + wrangler.jsonc**（PR #4、Workers Static Assets で .git/ docs/ が配信された件、2026-05-22）
- [x] **chore: wrangler not_found_handling を none に変更**（未配信パスを404に、commit c69cacd、2026-05-22）
- [x] **fix: Chicken.png タイトクロップ + imageSize 0.45**（PR #5、中央余白解消、2026-05-22）
- [x] **fix: ピクセル粒度の試行錯誤**（PR #6-#10、最終 9a1116b、画像 34×34 / QR width 340 で 1:2 整数比、2026-05-23）
- [x] **公開動作確認: `https://chickenqr.lemoned-i-scream-art-of-noise.workers.dev/` で QR 表示・PNG DL 動作**（2026-05-23）
