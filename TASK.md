## 2019/07/05 工程管理
1. 設計：~~機能要件~~、~~データモデリング~~、~~モデルの実装~~、~~リレーションの設定~~
2. 実装１：[モックアップ（ワイヤーフレーム）](https://xd.adobe.com/view/3accb448-564b-4c89-618f-d34d48adde92-4cfd/)、仮デザイン実装
3. ~~実装２：機能の構築①（試合管理機能）、~~そのテスト
4. 実装３：モックアップ（デザインカンプ）、デザインの修正
5. 実装４：機能の構築②（掲示板機能）、そのテスト
6. 実装５：デザインの修正
7. セキュリティ対策
8. 公開

## 2019/06/28 思いつく「機能」「実装」を列挙して、それをざっと優先順位
### 共通機能
- [ ] 認証機能
  - [x] GitHub
  - [x] Twitter
  - [ ] Google
  - [ ] Facebook

- [x] データベースの設計
### 試合管理機能
- [x] csv perse のインターフェース設計
- [x] 試合予定／結果csvファイルの用意
- [x] データベースからの読み込み
- [x] describe('"/manage" 試合のテスト', () => { } （⇐管理者でなくてもpostできる状態なの注意！）

### 試合掲示板機能
- [x] コメントの保存
  - [x] index.pugにも同じ機能を実装する
- [ ] コメントの表示（render）
  - [x] 表示のみ
    - [x] まず、indexで削除実装（formファイルisMine関数以下参照）まで
    - [x] fixtures.jsおよびmatch.pugで同じ機能を可能にする
  - [ ] evaluation機能に取り掛かる
    - [x] webpackの導入
    - [ ] [entry.js ,fixtures.js ,index.js]
    - [ ] [match.pug ,index.pug]
  - [ ] admin機能
  - [ ] 削除について：以前いたURLにリダイレクトするようにする

- [ ] 前／後の試合リンク

### その他随時施工
- [ ] セキュリティ対策

- [ ] テスト実装

- [ ] 細かな機能とモジュールの使用
  - [ ] ファビコン（serve-faviconモジュ）

- [ ] fixture-form のlayout.pugにある通り、ハンバーガー使ったりするにはbootstrapJs適用必要！（https://getbootstrap.jp/docs/4.2/getting-started/introduction/）
- [ ] 

## 記録
* 使用したモジュール/フレームワーク
  1. se
  2. sequelize
  3. pg
  4. pg-hstore 
  5. csv-parse
  6. moment-timezone
  7. webpack,babel
  8. jQuery

## 大会の表記
* Jリーグ　＝　J1- , J2-
* ルヴァンカップ　＝　JCup- （←名称の変更があるかもしれないので）
* 天皇杯　＝　ECup-
* ACL　＝　ACL-
