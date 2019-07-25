# 各データモデル

●の行は、外部キーを表す

## user のデータモデリング
| 属性名      | 形式  | 内容                                   |
| -------- | --- | ------------------------------------ |
| userId   | 文字列 | GitHub/Twitter のユーザー ID、主キー          |
| username | 文字列 | GitHub のusername／TwitterのdisplayName |
| thumbUrl | 文字列 | アカウントのサムネイル画像                        |

## post のデータモデリング
| 属性名       | 形式  | 内容          |
| --------- | --- | ----------- |
| postId    | 数値  | 投稿ID、主キー    |
| fixtureId | 数値  | 対象日程、●日程ID  |
| postedBy  | 文字列 | 投稿者、●ユーザーID |
| content   | 文字列 | 投稿内容        |

## evaluation のデータモデリング
| 属性名        | 形式      | 内容              |
| ---------- | ------- | --------------- |
| postId     | 数値      | 対象投稿、●投稿ID、主キー  |
| userId     | 数値      | 投稿者、●ユーザーID、主キー |
| evaluation | Boolean | 評価              |
| fixtureId  | 数値      | 対象日程、日程ID       |

## fixture のデータモデリング
| 属性名         | 形式  | 内容        |
| ----------- | --- | --------- |
| fixtureId   | 数値  | 日程ID、主キー  |
| fixtureDate | 日付  | 日程の日付     |
| fixtureSort | 文字列 | 試合の種類     |
| homeTeam    | 文字列 | ホーム・チーム名  |
| awayTeam    | 文字列 | アウェー・チーム名 |
| homeScore   | 数値  | ホーム得点     |
| awayScore   | 数値  | アウェー得点    |


