# DeepL Auto Translator for Thunderbird

[![Version](https://img.shields.io/badge/version-0.9-blue.svg)](https://github.com/rinmon/DeepL-Auto-Translator-for-Thunderbird) [![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/rinmon/DeepL-Auto-Translator-for-Thunderbird/blob/main/LICENSE)

Thunderbird用の拡張機能で、英語のメールを自動的にDeepL APIを使用して翻訳します。

## 機能

- メール閲覧時に英語のメールを自動的に翻訳
- 選択したテキストの翻訳（右クリックメニューから）
- 翻訳言語の選択（デフォルトは日本語）
- 元のテキストと翻訳を同時に表示するオプション

## インストール方法

1. このリポジトリをダウンロードまたはクローンしてください
2. Thunderbirdを開き、メニューから「アドオン」を選択します
3. 歯車アイコンをクリックし、「XPIまたはZIPファイルからアドオンをインストール」を選択します
4. このディレクトリをZIPに圧縮したファイルを選択します
   （または、開発モードで「一時的なアドオンを読み込む」から直接ディレクトリを選択）

## 設定

1. インストール後、拡張機能の設定画面を開きます
2. DeepL API キーを入力します（[DeepL API](https://www.deepl.com/pro#developer)から取得可能）
3. 翻訳先の言語を選択します
4. 自動翻訳の設定を行います

## DeepL APIについて

この拡張機能を使用するには、DeepL APIのアカウントとAPIキーが必要です。
DeepL API Freeプランでは、月に50万文字までの翻訳が無料で利用できます。
詳細は[DeepL API公式サイト](https://www.deepl.com/pro#developer)をご覧ください。

## 使い方

### 自動翻訳

設定で「メッセージを自動的に翻訳する」オプションをオンにすると、英語のメールを開いた時に自動的に翻訳されます。

### 手動翻訳

テキストを選択し、右クリックメニューから「DeepLで翻訳」を選択することで、選択部分のみを翻訳できます。

## 注意事項

- この拡張機能はThunderbird 78以降で動作します
- HTML形式のメールに最適化されています
- DeepL APIの利用制限に注意してください
- アイコンは実際のものを用意する必要があります（現在はプレースホルダー）
