# １：ユースケース

サッカーチーム掲示板の基本的な要求。
* サッカーチームの試合結果に、ログインしたユーザーがコメントとイイねを付けることができる。
* ログインしていない人は閲覧のみができる。

具体的なユースケース（実際にシステムがユーザーに利用される際のやりとり）。
* 某月某日の試合結果に、Twitter／GitHub／Facebookアカウントを持っているユーザーがコメントを投稿。他投稿にイイねする。
* 個別試合ページをTwitterで拡散したりする。
など。
サービスの名前は、「予定調整くん」で、プロジェクト名は、schedule-arrangerとしましょう。
サービスの内容は、予定の出欠表があると思いますが、それを Web 上に表現したものがこの要求を満たすのに便利なものとなりそうです。

|サービス名|プロジェクト名|アカウント名|サービス内容|
|:-:|:-:|:-:|:-:|
|湘南ベルマーレ掲示板|Bell-Board|@bellboard|コメント掲示板|

# ２：要件定義／用語定義

##【要件定義】

* 試合予定／結果が管理できる
* 試合予定／結果がわかる
* 試合結果に対してコメントできる
* コメントを削除できる
* 「イイね」を付けることができる
* 「イイね」を外すことができる

以上のような要件は、機能要件とも呼ばれ、要求を満たすための機能があることを定義したものとなっています。
なお機能要件ではないもののことを非機能要件といいます。非機能要件には、機能に付随する性能に対する要件や、セキュリティに関する要件があります。
ここで非機能要件の定義は割愛します。

## 【用語定義】
|用語|英語表記|意味|
|:-:|:-:|:-:|:-:|
|管理者|admin|試合情報と|コメント|の管理者|
|ユーザー|user|ログイン|した利用者|
|日程|fixture|試合の日程|
|コメント|comment|試合に対してユーザーがつ|けるコメント|
|評価|evaluation|コメントに対する「イイね」|
このような、システムの中に登場する用語と意味をしっかりと定義するということは、ソフトウェアづくりの中で非常に重要なことです。

これは、複数人でシステムを作るときに特に重要なのですが、
自分一人でプログラミングする場合においても、コードの中での言葉の表す対象の意味がぶれると思わぬ実装ミスを招いてしまいます。

そのようなミスを防ぐためにも、複雑なソフトウェアを作る際には、使う用語の定義を用語集やコードのコメント内にしっかりまとめておきましょう。