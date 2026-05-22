# knowledge.md — 開発知見ログ

開発中の決定事項・ハマったポイント・学習した概念を時系列で残す。同じ失敗を繰り返さないための記録。

---

## 決定事項

### 2026-05-21

#### プロジェクト方向性
- プロジェクト名は **ChickenQR**。フォルダ名は `chickenqr`（当初 `qr-code-generator` から変更）
- 参考サイトは https://bogus.jp/tools/catqr/ （ネコ版）。それのニワトリ版として実装
- アプリ形態は **Webアプリ**（完全クライアントサイド、サーバーレス）
- 公開対象: 個人開発 + 一般公開

#### 技術スタック（当初案からの方向転換）
- **当初**: React + Vite + TypeScript + `qrcode` (npm)
- **採用**: vanilla HTML/CSS/JS + `qr-code-styling@1.9.2` (CDN)
- **方向転換理由**: 要件定義書の調査で qr-code-styling 1本で機能要件をすべて満たせると判明。React 等のフレームワークは静的1ページに対してオーバースペック。CDN 読み込みで npm install すら不要

#### ホスティング戦略
- **当初案**: 既存 tetutetu214.com の Workers Static Assets にパス追加 (`/tools/chickenqr/`)
- **実態判明**: tetutetu214.com は Cloudflare で DNS 管理のみ、本体サイトのリポジトリは存在しない
- **採用**: Cloudflare Pages スタンドアロンで `chickenqr` プロジェクトを作成し、`chicken-qr.tetutetu214.com` サブドメインを Cloudflare DNS で CNAME 当て
- **dev/staging 環境は作らない**: 個人開発のため Cloudflare Pages 1プロジェクト＝本番のみ

#### QR 生成パラメータ（要件定義書より）
- `errorCorrectionLevel: 'H'` 固定（中央画像で破壊されるドットを Reed-Solomon で復元するため必須）
- `imageSize: 0.35`（0.3〜0.4 推奨、0.5 超は読み取り精度が落ちる）
- `hideBackgroundDots: true`（画像下のドットを省く）
- `typeNumber: 0`（自動、QR バージョン選定をライブラリに委ねる）

#### ニワトリ画像の調達方針
- 当初: 4種類（classic / standing / chick / crowing）を ChatGPT Plus Web UI で生成 → assets/chickens/ に配置
- **最終確定: `image/Chicken.png` 1枚固定**（てつてつが Phase 0-A で配置済み、ピクセルアート風）
- 4枚運用は overkill と判断、1枚で MVP→Phase 2 まで進める
- ユーザーアップロード機能は Phase 3 に後回し（任意扱い）

**教訓**: 「4種類のバリエーション」を提案したが、てつてつから「これだけでいいや」と1枚運用に絞られた。バリエーション数や選択 UI は、個人開発でユースケースが明確でない場合は最小から始めるのが正解。Phase 1 を出して反応見てから拡張すべき

#### その他確定事項
- ライセンス: **MIT**
- README 言語: **日本語のみ**
- 実装フロー: HTML/CSS/JS 実装は **Codex CLI に委譲**（グローバル CLAUDE.md の A モード方針）。Claude Code は仕様起草・diff レビュー・コミット & プッシュ・E2E 検証を担当

---

## 学習済み概念

### 2026-05-22 — Phase 1 完了直前のテスト3問正解
- **QR 誤り訂正レベル `H` = 約 30% 復元**: 中央画像でドットが物理的に隠れる分、Reed-Solomon の冗長コードで救う。L=7% / M=15% / Q=25% では足りないので画像入りQRは H 固定が原則
- **Cloudflare Pages を選ぶ理由**: 完全静的サイトの Git 連携自動デプロイで十分。Workers Static Assets はルート分岐やエッジ関数を足したいときの選択肢で、本プロジェクトはサーバー処理なしのため Pages がフィット
- **CNAME レコード**: サブドメインを別ドメインの「別名」として扱う仕組み。A レコード（IP 直指定）と違って、Pages 側の IP が変動しても `chickenqr.pages.dev` を解決し直すだけで追従できるためサブドメイン公開で標準的に使う

---

## ハマったポイント

### 2026-05-21: 要件定義書の前提と現実のズレ
- てつてつから提示された要件定義書には「既存 tetutetu214.com の Workers Static Assets にパス追加」と書かれていたが、実際には tetutetu214.com は Cloudflare DNS 管理下にあるだけで、本体サイトのリポジトリは存在しなかった
- 要件定義書は別の AI セッションで生成されたもので、現状把握なしに「もし既存統合できるなら」という想定で書かれていた可能性が高い
- **教訓**: 他所で生成された要件定義書を取り込むときは、前提条件（既存システムの存在）を現物確認する。`projects/` 以下を `find -name "wrangler.toml"` 等で先に把握しておく

### 2026-05-21: Phase の選び方を Codex 委譲と混同
- 私が「Phase 1 / Phase 1+2 / 一気に Codex に投げる」という選択肢を出したが、グローバル CLAUDE.md で「実装は Codex 委譲」が既定路線である以上、「誰が書くか」は選択肢として成立しない
- **教訓**: 役割分担が CLAUDE.md で確定している項目は、てつてつに毎回確認しない。確認すべきは「**何を作るか（リリーススコープ）**」だけ。実装手段は方針通り進める

### 2026-05-21: 「pages.dev で動作確認 → DNS 切替」が dev 環境構築と誤解された
- plan.md オープン課題で「chickenqr.pages.dev で動作確認してから DNS を当てる」と提案したが、てつてつから「個人開発なのに dev 環境作るの？」と却下された
- 実態: Cloudflare Pages は1プロジェクトで `pages.dev` デフォルト URL とカスタムドメインの両方が同時に有効になる。同じビルドが両 URL で配信されるだけで「dev 環境」ではない
- **教訓**: 「事前検証用 URL」のような提案は、個人開発の文脈では過剰に映る。`chicken-qr.tetutetu214.com` を最初から本番直結で良い。dev/staging/preview 等の言葉は誤解の元になるので、必要性を明示できない限り使わない

### 2026-05-21: Codex CLI ≠ OpenAI Image API
- 「Codex で画像生成できないんですか？」という質問に対し、Codex CLI は OpenAI のコーディングエージェントであって画像生成 API ではないことを説明した
- Codex は OpenAI Image API を叩くスクリプトを書くことは可能だが、サンドボックスのネットワーク制限と `~/.secrets/` 読み込み不可で実行は別途必要
- さらに `~/.secrets/` を確認したところ OpenAI API キーは存在せず、ChatGPT Plus 加入のみだった
- **教訓**: Codex の能力範囲を整理して伝える。「Codex で X できる？」に対しては「Codex はコーディングエージェント、API 呼び出しは別手段が必要」と即答できるように

### 2026-05-22: snap 版 gh の `gh pr merge` ローカル fast-forward 失敗
- `gh pr merge` を実行すると `git: 'remote-https' is not a git command. ! warning: not possible to fast-forward to: main` というエラーが出た
- リモート側の squash マージ自体は完了している（GitHub Web 上で PR が MERGED 状態）
- 失敗するのは「ローカル main を origin/main に同期する」内部処理の部分
- 原因: snap 版 gh は内蔵 git が `git-remote-https` ヘルパーを解決できないため、内部の git fetch/pull が失敗する
- **回避策**: PR マージは `gh api repos/<owner>/<repo>/pulls/<n>/merge -X PUT -f merge_method=squash` で REST API 直叩き。ローカルは `git fetch origin main && git reset --hard origin/main` で別途同期する
- memory `reference_gh_snap_remote_https.md` の経験則を本プロジェクトでも踏襲、初手から `gh api` を使うのが安全

### 2026-05-22: Cloudflare Pages の Build command 欄に `/` を入れて Permission denied
- 初回 Cloudflare Pages デプロイで `/bin/sh: 1: /: Permission denied` でビルド失敗
- 原因: **Build command** 欄に `/` を入力していた。シェルが `/` をコマンドとして実行しようとして拒否された
- 正解: Build command は**完全に空**、`/` を入れるのは Build output directory だけ
- 修正手順: Settings → Builds & deployments → Configure production deployments → Build command を空にして Save → Deployments で Retry
- **教訓**: 静的サイト（ビルド不要）の Cloudflare Pages 設定では、Build command 欄は必ず空にする。`/` のような分かりにくい値はオプション欄では誤入力されやすいので、ドキュメントには⚠️マークと「何も入れない」を強調して書く

### 2026-05-22: Cloudflare Workers Static Assets として動いた / `.git/` 配信を `public/` 集約で抑止
- Pages として作ったつもりが Cloudflare 側で Workers Static Assets として動いた
- Output Directory `.` で `.git/` `docs/` まで配信された（ただしリポジトリパブリックなので新規漏洩は無し）
- 対応: `public/` ディレクトリ集約 + `wrangler.jsonc` で `assets.directory: "./public"` に固定
- さらに `not_found_handling: "single-page-application"` だと未配信パスにも index.html を fallback する仕様で「.git/HEAD が見える」誤解を生んだ → `"none"` に変更して 404 を返すように修正
- **教訓**: Workers Static Assets を選ぶときは `wrangler.jsonc` を最初からリポジトリに入れて配信対象を明示する。SPA でない単一ページサイトは `not_found_handling: "none"` がデフォルト挙動として適切

### 2026-05-22: 中央埋め込み画像はタイトクロップ必須 / `getbbox()` の罠
- Chicken.png は 1536×1024 でニワトリ本体は中央の小領域のみ、周囲は alpha=0 で透明
- qr-code-styling は画像の **bounding box** で配置するため、透明領域も余白として QR 中央に確保される → 「画像の周りが空白でダサい」状態
- 対応: Pillow で alpha > 32 を「実質的に不透明」とみなして bbox を取り、ニワトリだけにトリム後 461×461 の正方形にパディング
- **`Image.getbbox()` の罠**: alpha > 0 のピクセル全部を bbox に含める仕様。anti-alias で alpha=1〜10 のうっすら残骸があると画像全体が bbox になり「トリムされない」現象が起きる。`alpha.point(lambda p: 255 if p > T else 0).getbbox()` の自前 threshold が必須
- imageSize は 0.35 → 0.45 に上げ、margin も 0 にしてタイト表示

### 2026-05-22: Phase 1 MVP は Codex 委譲が完璧に機能
- 委譲プロンプトに「commit/push/E2E 検証は Claude 側でやる」「Co-Authored-By 提案不要」を明記したところ、Codex は要求範囲内で 3 ファイル（318 行）を生成し終了した
- 生成された app.js は qr-code-styling パラメータを spec 通り（errorCorrectionLevel='H', imageSize=0.35 など）守り、JSDoc・debounce・初期描画・PNG DL 全てカバー
- styles.css は卵色 `#f5c842` アクセント、640px ブレイクポイントで 1 カラム化、`clamp()` + `min()` でモダンなレスポンシブ
- index.html は `lang="ja"`、`defer`、favicon、メタ description まで網羅
- **教訓**: Codex 委譲時の委譲プロンプトは「やってほしいこと」「やってはいけないこと」「完了報告フォーマット」の3点を明示するだけで品質が安定する。固定値は数値レベルで仕様に書き出しておくと取りこぼしがない

---

## 参考リンク

### ライブラリ・仕様
- [qr-code-styling (GitHub)](https://github.com/kozakdenys/qr-code-styling) — 採用 QR 生成ライブラリ (MIT, v1.9.2)
- [qr-code-styling 公式 README](https://github.com/kozakdenys/qr-code-styling/blob/master/README.md) — `image` / `imageOptions` の仕様
- [ISO/IEC 18004:2024](https://www.iso.org/standard/83389.html) — QR 規格本体（Reed-Solomon 誤り訂正レベル定義）

### データフォーマット仕様
- [RFC 6068 (mailto)](https://www.rfc-editor.org/rfc/rfc6068)
- [RFC 3966 (tel)](https://datatracker.ietf.org/doc/html/rfc3966)
- [RFC 5724 (sms)](https://datatracker.ietf.org/doc/html/rfc5724)
- [RFC 6350 (vCard 3.0)](https://www.rfc-editor.org/rfc/rfc6350.html)
- [ZXing wiki: Barcode Contents](https://github.com/zxing/zxing/wiki/Barcode-Contents) — Wi-Fi / MeCard デファクト仕様

### Web API
- [MDN: FileReader.readAsDataURL](https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL)
- [MDN: CanvasRenderingContext2D.drawImage](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage)

### Cloudflare
- [Cloudflare Pages 公式](https://developers.cloudflare.com/pages/)
- [Cloudflare Pages カスタムドメイン](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/) — 将来 tetutetu214.com 本体構築時の参考

### 参考実装
- [bogus.jp ネコ QR](https://bogus.jp/tools/catqr/) — 参考にしているネコ版 QR ツール
