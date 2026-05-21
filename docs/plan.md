# plan.md — ChickenQR

中央にニワトリ画像を埋め込む QR コード生成ツール。参考は https://bogus.jp/tools/catqr/ （ネコ版）。それのニワトリ版。

---

## 目標と非目標

### 目標
- 個人開発・公開配信。誰でもブラウザでアクセスして使える
- URL / テキスト / Wi-Fi / vCard / MeCard / mailto / tel / sms に対応
- 中央にニワトリ画像（`image/Chicken.png` 固定1枚）を埋め込む
- PNG/SVG ダウンロード対応
- 完全クライアントサイド（プライバシー: 入力データを外部送信しない）

### 非目標
- バックエンド API・サーバー側処理
- ユーザー認証・履歴のサーバー保存
- AI 画像生成のランタイム呼び出し（コスト・キー漏洩リスク）
- React/Vue/Next.js 等のフレームワーク導入（要件に対してオーバースペック）
- **dev / staging 環境**: 個人開発のため Cloudflare Pages 1プロジェクト＝本番のみ
- **ニワトリ画像のバリエーション**: Chicken.png 1枚で固定運用（複数同梱はしない）

---

## 技術スタック（確定）

| 項目 | 採用 | 主な根拠 |
|---|---|---|
| 言語 | vanilla HTML/CSS/JS | フレームワーク不要、静的1ページで完結 |
| QR生成 | qr-code-styling@1.9.2 (CDN: unpkg) | 中央画像が公式 API（`image`/`imageOptions`）、MIT、ロゴ埋め込みのデファクト |
| ビルド | なし（Phase 2 で Vite 検討） | CDN 読み込みで完結 |
| ホスティング | Cloudflare Pages（スタンドアロン） | 無料・CDN 爆速・Git 自動デプロイ |
| 独自ドメイン | chicken-qr.tetutetu214.com | Cloudflare DNS でサブドメイン CNAME、初期から本番直結 |
| ソース管理 | GitHub (パブリック、tetutetu214/chickenqr) | グローバル方針 |
| ライセンス | **MIT** | 個人開発公開ツールの定番 |
| ニワトリ画像 | `image/Chicken.png` 1枚固定 | てつてつ提供のピクセルアート風 |

**当初の React+Vite+TypeScript 案は破棄**。要件定義書の調査結果（qr-code-styling 1本で中央画像埋め込み・データ種別全対応が達成可能）を受けて vanilla 構成に方向転換。

---

## アーキテクチャ

```
[ユーザー]
    ↓
[Cloudflare Pages: chickenqr] ← git push main ← [GitHub: tetutetu214/chickenqr]
    ↓
[静的アセット: index.html / styles.css / app.js / image/Chicken.png]
    ├ qr-code-styling を CDN 読み込み (unpkg)
    ├ データ種別タブで入力フォーム切替
    ├ 入力 → `qr.update({ data })` で再描画（image は Chicken.png 固定）
    └ qr.download({ extension }) で PNG/SVG 出力
```

サーバー処理なし。すべて ブラウザ内。

---

## 開発フェーズ

要件定義書の Phase 分割を1枚運用に合わせて簡素化。実装は Codex CLI に委譲、Claude Code はレビューと司令塔。

| フェーズ | 内容 | 完了条件 |
|---|---|---|
| **Phase 0** | プロジェクト初期化 | 画像配置済み、GitHub repo 作成、Cloudflare Pages 連携、サブドメイン CNAME |
| **Phase 1 (MVP)** | URL入力 → QR生成 → PNG DL（ニワトリ画像は Chicken.png 固定） | chicken-qr.tetutetu214.com で公開動作 |
| **Phase 2** | データ種別タブ（Wi-Fi/vCard 等）、SVG出力 | 全データ種別が QR スキャナで読み取り成功 |
| **Phase 3 (任意)** | ユーザーアップロード、Web Analytics 等の拡張 | Phase 2 終了後にてつてつと再検討 |

---

## 公開戦略

- GitHub: `tetutetu214/chickenqr` をパブリックで作成、Secret Scanning + Push Protection 有効化（グローバル方針）
- Cloudflare Pages: `chickenqr` プロジェクトとして GitHub 連携
- ドメイン: 初期から `chicken-qr.tetutetu214.com` を Cloudflare DNS で CNAME 設定（dev 環境は作らない）
- README: **日本語のみ**、スクリーンショット付き、ライセンス MIT

---

## 進め方（実行プロセス）

1. **本 plan.md と spec.md をてつてつが確認** → OK なら Phase 0 着手
2. Phase 0 はてつてつ自身で実施（GitHub repo 作成、Cloudflare Pages 連携、DNS 設定。`gh` コマンドは Claude が補助可）
3. Phase 1 実装は Codex CLI に委譲
   - Claude Code が委譲プロンプトを作成
   - Codex が index.html / styles.css / app.js を生成
   - Claude Code が diff レビュー、動作確認、commit & push
4. Cloudflare Pages の自動デプロイで動作確認
5. 理解度テスト（PR 作成直前 or 本番反映直前）後、Phase 2 に進む
