# Arknights Damage Calculator

アークナイツのダメージをブラウザ上で計算するWebアプリです。

## 現在できること

- 407人のオペレーターから選択
- 昇進段階・レベルに応じた基礎攻撃力の計算
- 通常攻撃の基礎種別（物理・術・治療・攻撃なし）の反映
- 敵の防御力を入力した通常攻撃の単発ダメージ計算
- 基礎攻撃間隔を使ったDPSの表示
- 物理ダメージの最低保証（攻撃力の5%）の反映
- 計算式、軽減量、攻撃力に対する割合の表示

現在は通常攻撃の基礎種別だけを反映する初期版です。素質、特性による
倍率や複数対象攻撃、スキル、信頼度、潜在、モジュールによる補正は
まだ反映していません。

オペレーターデータは
[ArknightsAssets/ArknightsGamedata](https://github.com/ArknightsAssets/ArknightsGamedata)
の日本版ゲームデータから必要項目だけを生成しています。

## 開発

```bash
npm install
npm run dev
```

本番用のビルドは `npm run build`、コード検査は `npm run lint` で実行します。

オペレーターデータを最新版に更新するときは、次を実行します。

```bash
npm run data:operators
```
