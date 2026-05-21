const defaultUrl = 'https://example.com';

let qrCode = null;
let urlInput = null;

/** 入力値を QR コード用の文字列として取得する。 */
function getQrData() {
  const value = urlInput.value.trim();
  return value || defaultUrl;
}

/** qr-code-styling の固定設定を作成する。 */
function createQrConfig(data) {
  return {
    width: 320,
    height: 320,
    type: 'canvas',
    data,
    image: '/image/Chicken.png',
    qrOptions: {
      typeNumber: 0,
      mode: 'Byte',
      errorCorrectionLevel: 'H',
    },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.35,
      margin: 4,
      crossOrigin: 'anonymous',
    },
    dotsOptions: { type: 'rounded', color: '#222' },
    cornersSquareOptions: { type: 'extra-rounded', color: '#222' },
    backgroundOptions: { color: '#ffffff' },
  };
}

/** QR コードを初期化してプレビュー領域へ描画する。 */
function renderQrCode() {
  const previewElement = document.querySelector('#qr-preview');
  qrCode = new QRCodeStyling(createQrConfig(getQrData()));
  qrCode.append(previewElement);
}

/** 現在の入力値で QR コードを更新する。 */
function updateQrCode() {
  qrCode.update({ data: getQrData() });
}

/** QR コードを PNG ファイルとしてダウンロードする。 */
function downloadPng() {
  qrCode.download({ name: 'chicken-qr', extension: 'png' });
}

/** 指定時間の入力停止後に関数を実行する。 */
function debounce(callback, delay) {
  let timerId = 0;

  return function debouncedCallback() {
    window.clearTimeout(timerId);
    timerId = window.setTimeout(callback, delay);
  };
}

/** ページ読み込み後に入力、QR 生成、ダウンロード処理を接続する。 */
function initApp() {
  urlInput = document.querySelector('#url-input');
  const downloadButton = document.querySelector('#download-button');
  const debouncedUpdateQrCode = debounce(updateQrCode, 300);

  renderQrCode();
  urlInput.addEventListener('input', debouncedUpdateQrCode);
  downloadButton.addEventListener('click', downloadPng);
}

document.addEventListener('DOMContentLoaded', initApp);
