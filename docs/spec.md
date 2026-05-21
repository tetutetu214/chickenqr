# spec.md — ChickenQR 仕様書

要件定義書（てつてつ提示分）をベースに、実装可能な単位まで落とし込む。

---

## 画面構成（単一ページ）

```
┌─────────────────────────────────────────┐
│  ChickenQR — ニワトリ入り QR コード生成   │
├─────────────────────────────────────────┤
│  [URL] [Text] [Wi-Fi] [連絡先] [Mail]   │  ← データ種別タブ (Phase 2)
│  [Tel] [SMS]                            │
├─────────────────────────────────────────┤
│  ┌─入力フォーム──────────────────────┐  │  ← タブごとに切替
│  │ URL: [_________________________]  │  │
│  └────────────────────────────────────┘  │
├─────────────────────────────────────────┤
│         ┌────────────┐                  │
│         │            │                  │
│         │  QR プレビュー │                  │
│         │  (動的更新)  │                  │
│         │  中央 Chicken.png             │
│         │            │                  │
│         └────────────┘                  │
├─────────────────────────────────────────┤
│  [PNGダウンロード] [SVGダウンロード]    │
└─────────────────────────────────────────┘
```

ニワトリ画像は `image/Chicken.png` で固定。画像選択 UI は持たない。

---

## qr-code-styling パラメータ（固定値）

```js
const qrConfig = {
  width: 512,
  height: 512,
  type: 'canvas',          // PNG出力時はcanvas、SVG出力時はsvgへ切替
  data: '<入力に応じた文字列>',
  image: '/image/Chicken.png',  // 固定
  qrOptions: {
    typeNumber: 0,          // 自動
    mode: 'Byte',
    errorCorrectionLevel: 'H',  // 中央画像のため H 固定
  },
  imageOptions: {
    hideBackgroundDots: true,
    imageSize: 0.35,        // 0.3〜0.4 推奨、0.5 超は非推奨
    margin: 4,
    crossOrigin: 'anonymous',
  },
  dotsOptions: { type: 'rounded', color: '#222' },
  cornersSquareOptions: { type: 'extra-rounded', color: '#222' },
  backgroundOptions: { color: '#ffffff' },
};
```

---

## データ種別ごとの入力フィールドと出力フォーマット

| タブ | 入力 | QR データ文字列 | 出典 |
|---|---|---|---|
| URL | URL (text) | そのまま (`https://` 推奨) | ZXing wiki |
| Text | 自由文 (textarea) | そのまま | — |
| Wi-Fi | SSID / Password / 暗号化(WPA/WEP/nopass) / 非表示SSID(bool) | `WIFI:T:<type>;S:<ssid>;P:<password>;[H:true;];;` | Wi-Fi Alliance WPA3 §7.1 / ZXing wiki |
| 連絡先 | 名 / 姓 / 電話 / メール / URL / 形式選択(MeCard or vCard) | MeCard: `MECARD:N:<姓,名>;TEL:<tel>;EMAIL:<email>;URL:<url>;;`<br>vCard: `BEGIN:VCARD\nVERSION:3.0\nN:<姓;名>\nFN:<フル名>\n...\nEND:VCARD` | MeCard: OMA-TS-MC-V1_0 / vCard: RFC 6350 |
| Mail | 宛先 / 件名 / 本文 | `mailto:<to>?subject=<encoded>&body=<encoded>` | RFC 6068 |
| Tel | 国番号 + 番号 | `tel:+<国番号><番号>` | RFC 3966 |
| SMS | 番号 / 本文 | `sms:+<番号>?body=<encoded>` | RFC 5724 |

### エスケープ規則
- **Wi-Fi**: `\ ; , " :` を `\` でエスケープ
- **MeCard/vCard**: `;` `,` `\` をバックスラッシュエスケープ
- **mailto/sms**: `subject` と `body` は `encodeURIComponent()` を通す

---

## ニワトリ画像アセット

- ファイル: `image/Chicken.png`（てつてつが配置済み）
- 使い方: HTML から `/image/Chicken.png` で参照、qr-code-styling の `image` プロパティに渡す
- バリエーション: なし（1枚固定運用）
- 透過 PNG でなくても問題なし: `hideBackgroundDots: true` により画像領域下のドットは描画されない。背景白＋画像白で継ぎ目なく見える
- ユーザーアップロード機能は Phase 3（任意）。Phase 1/2 では実装しない

---

## ファイル構成（Phase 1 完成時）

```
chickenqr/
├ index.html              ← 単一ページ全体
├ styles.css              ← デザイン
├ app.js                  ← 入力→QR更新→DL処理
├ image/
│  └ Chicken.png          ← 固定1枚
├ _headers                ← Cloudflare Pages 用 CSP/cache 設定
├ README.md               ← 日本語のみ、スクリーンショット付き
├ LICENSE                 ← MIT
├ .gitignore
└ docs/                   ← 開発ドキュメント (リポジトリには含めるが配信対象外)
   ├ plan.md
   ├ spec.md
   ├ todo.md
   └ knowledge.md
```

---

## `_headers` 内容（要件定義書記載のまま採用）

```
/*
  Cache-Control: public, max-age=300
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

将来的に CSP を追加するなら以下も検討（Phase 2 以降）:
```
Content-Security-Policy: default-src 'self'; script-src 'self' https://unpkg.com; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline';
```

---

## イベントフロー

```
ページロード
  ↓
qr-code-styling 初期化（image: '/image/Chicken.png' 固定で QR レンダリング）
  ↓
ユーザー操作
  ├ タブ切替 → 入力フォームを切替表示（Phase 2）
  ├ 入力変更 → data 文字列を組み立て → qr.update({ data })
  └ DL ボタン → qr.download({ extension: 'png' | 'svg' })
```

入力変更時の再描画は debounce（300ms）でちらつきを抑える。

---

## レスポンシブ対応

- **モバイル（〜640px）**: 縦並び。タブはスクロール可能な横並び。QR プレビューは画面幅の 80%
- **タブレット〜デスクトップ（641px〜）**: 入力エリアと QR プレビューを左右2カラム配置

---

## ブラウザサポート目標

- iOS Safari 最新2バージョン
- Chrome / Edge 最新2バージョン
- Firefox 最新版
- Android Chrome 最新版

ES2022 機能（top-level await 等）を素直に使う。Polyfill は導入しない。

---

## 動作確認チェックリスト（リリース前）

- [ ] 各データ種別を入力 → 生成された QR を iOS Camera で読み取り成功
- [ ] 各データ種別を入力 → Android Chrome の QR スキャナで読み取り成功
- [ ] 各データ種別を入力 → サードパーティ QR スキャナアプリで読み取り成功
- [ ] Chicken.png 付き QR を `imageSize: 0.35` で生成して読み取り成功
- [ ] PNG/SVG ダウンロードがブラウザのデフォルトダウンロードフォルダに保存される
- [ ] スマホ縦持ち / 横持ち / タブレット / デスクトップでレイアウト崩れなし

---

## 確定済みオープン項目

- ニワトリ画像: **`image/Chicken.png` 1枚固定**（てつてつ配置済み）
- README 言語: **日本語のみ**
- ライセンス: **MIT**
- 初期公開ドメイン: **chicken-qr.tetutetu214.com を最初から本番直結**（dev 環境なし）
