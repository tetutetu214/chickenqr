# CLAUDE.md — chickenqr プロジェクト設定

このファイルは本プロジェクト固有の指示。グローバル設定は `~/.claude/CLAUDE.md` 側にある。

---

## プロジェクト概要

**ChickenQR** — 中央にニワトリ画像を埋め込む QR コード生成ツール（Webアプリ）。

参考サイト: https://bogus.jp/tools/catqr/ （ネコ版QR）。それをニワトリ版で実現する。

詳細は `docs/plan.md` と `docs/spec.md` を参照。要件定義書はてつてつ提示分を spec.md にそのまま取り込んでいる。

---

## 技術スタック（確定）

| 項目 | 採用技術 | 採用理由 |
|---|---|---|
| 言語 | **vanilla HTML/CSS/JS** | フレームワーク不要、静的サイトとして最小構成、起動コスト最小 |
| QR生成 | **qr-code-styling@1.9.2** (CDN: unpkg) | 中央画像埋め込みが公式 API、MIT、ロゴ埋め込みのデファクト |
| ビルドツール | 当初なし | Phase 2 以降で必要に応じて Vite を検討 |
| ホスティング | **Cloudflare Pages**（スタンドアロン） | 無料、Git 連携で自動デプロイ、CDN 爆速 |
| 独自ドメイン | **chicken-qr.tetutetu214.com** | Cloudflare DNS でサブドメインを Pages に CNAME |
| ソース管理 | **GitHub** (パブリック) | グローバル方針通り、Secret Scanning 有効化 |

**React/Vite は採用しない**（当初案から方向転換）。要件定義書の通り、qr-code-styling 1本で機能要件を全て満たせるため、フレームワーク導入は overkill。Phase 2 でコード量が増えてきたら Vite + TS を検討。

---

## インフラ構成

```
[GitHub: tetutetu214/chickenqr]
        ↓ git push main
[Cloudflare Pages: chickenqr]
        ↓ 自動ビルド & デプロイ
[配信URL]
  ├ chickenqr.pages.dev               ← Cloudflareデフォルト
  └ chicken-qr.tetutetu214.com        ← Cloudflare DNS で CNAME 当て
```

サーバー側処理なし。完全クライアントサイド。

---

## Codex 連携方針（A モード: 実装委譲）

**HTML/CSS/JS 実装は基本 Codex に委譲する**（グローバル CLAUDE.md の方針通り）。

Codex に振るタスクの例:
- index.html / styles.css / app.js の新規作成
- qr-code-styling のオプション組み立てコード
- データ種別ごとのテンプレート生成関数（Wi-Fi / vCard / MeCard など）
- レスポンシブ CSS の調整
- バグ修正・機能追加

Claude Code（私）が担うタスク:
- 仕様書（plan.md / spec.md）の起草・更新
- Codex 出力のレビュー・diff 確認
- ニワトリ画像アセットの管理判断
- コミット & プッシュ（Codex はサンドボックス制約で `.git` 書き込み不可のため必須）
- E2E 検証（Codex はネットワーク制限あり）
- てつてつとの対話・理解度テスト

委譲時の注意（memory `feedback_codex_delegation_protocol.md` より）:
- 「commit/push/ビルド検証は Claude 側でやる」と委譲プロンプトに明記
- Co-Authored-By はコミット時に Claude 側で正しいモデル名（Opus 4.7）に上書き
- 初回呼び出しは foreground で Bash 承認を取る

---

## 開発ルール（プロジェクト固有）

### コーディングスタイル
- インデント 2スペース（HTML/CSS/JS 標準）
- JS は ES2022 想定
- 外部依存は CDN（unpkg）から `<script>` で読み込み。npm install は Phase 2 以降に検討
- 関数は名前付きで宣言し、用途を JSDoc コメント1行で明示（型情報目的）

### QR 生成パラメータ（要件定義書より固定値）
- `errorCorrectionLevel: 'H'`（最大30%復元、中央画像のため必須）
- `imageSize: 0.3〜0.4` の範囲。デフォルト 0.35
- `hideBackgroundDots: true`（画像下のドットを省く）
- `typeNumber: 0`（自動）

### コミット粒度
- グローバル方針通り、論理的な区切りごとに commit + push
- Phase 1 内でも「初期 HTML 雛形」「QR 生成ロジック」「ダウンロード機能」「スタイル調整」で分割

### セキュリティ
- ユーザー入力データ・アップロード画像は**一切外部送信しない**（クライアント完結）
- `_headers` で CSP / X-Content-Type-Options / Referrer-Policy を設定
- GitHub リポジトリは Secret Scanning 有効化（グローバル方針通り）

---

## 注意事項

- **バックエンドは作らない**。Lambda / Cloud Run / Workers 関数等の提案は禁止。AI 画像生成オプションを将来追加する場合のみ、Cloudflare Workers プロキシを検討する余地あり（要件定義書 Phase 3）。
- **AI 生成画像は開発時に事前生成して同梱**する方針。ランタイムで API を叩かない。
- ニワトリ画像は `image/Chicken.png` の1枚で固定運用（てつてつ提供のピクセルアート風）。複数バリエーションは作らない方針。
- 参考サイトとは画像ジャンルだけ違う「ニワトリ版」として差別化。実装方式は qr-code-styling の `image` オプション利用で揃える。
