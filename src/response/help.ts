import { Message } from 'discord.js'
import { table } from '../util/textTable'

export const help = async (message: Message): Promise<boolean> => {
  if (!message.content.match(/^(help|setting|ヘルプ|設定|説明)/)) {
    return false
  }
  message.channel.send(HELP)
  return true
}

export const HELP = `スクレイピングに特化したbotです。
任意の記事一覧ページを定期的にスクレイピングし、追加された記事を自動で投稿します。

\`\`\`
                       ┌───────┐
           ┌───────┐ ┌─┤task   │
         ┌─┤channel├─┤ └───────┘
         │ └───────┘ │
         │           │ ┌───────┐
┌──────┐ │ ┌───────┐ └─┤task   │
│server├─┼─┤channel│   └───────┘
└──────┘ │ └───────┘
         │
         │ ┌───────┐   ┌───────┐
         └─┤channel├───┤task   │
           └───────┘   ├───────┤
                       │status │
                       │program│
                       └───────┘
\`\`\`

[使い方]
1. \`example.comから最新の記事を取得するタスクを追加する\`の様に実行しタスクを追加する。
2. \`\`\`
   IDが1のタスクに以下のプログラムを追加する
   \`\` \`js
   ここにプログラムを書く
   \`\` \`
   \`\`\`
   の様にタスクにプログラムを追加する。
3. \`IDが1のタスクを起動\`

[コマンド一覧]
\`\`\`
${table([
  ['コマンド', '補足'],
  [],
  ['ステータスを表示', '現在のサーバに登録されたタスク表示する。'],
  ['〜するタスクを追加', '例）example.comの記事を取得するタスクを追加'],
  ['IDが1のタスクに以下のプログラムを追加'],
  ['IDが1のタスクのプログラムを削除'],
  ['IDが1のタスクを削除'],
  ['IDが1のタスクを起動', 'ステータスをrunningする。'],
  ['IDが1のタスクを停止', 'ステータスをstoppedする。'],
  ['IDが1のタスクをこのチャンネルに紐付け'],
  ['IDが1のタスクを一度だけ実行', 'タスクを仮実行し結果を表示する。'],
  ['IDが1のタスクのインターバルを15分に変更'],
  ['IDが1のタスクのログを表示'],
  ['IDが1のタスクのプログラムを表示'],
  ['IDが1のタスクの詳細を表示'],
  ['サンプルプログラムを表示'],
  ['このチャンネルのタスク一覧を表示'],
  ['このチャンネルを削除'],
  ['このサーバを削除'],
  ['ヘルプを表示']
]).replace(/ /g, '　')}
\`\`\`
（※全てのコマンドは、botにメンションした上で使用します。）

[プログラムについて]
このbotでは、汎用性を最大限に高めるため、JavaScriptというプログラミング言語のコードを登録する必要があります。
プログラムの知識が必要ですが、ブラウザで表示できるほとんどのサイトに対応しています。

このbotでは、cheerio( https://github.com/cheeriojs/cheerio )を使用しています。
node-fetchを利用してhtmlファイルを取得して、cheerioでhtmlパースを行い、最終的には以下の形式でreturnを行ってください。
javascriptのブロックコードで囲ってBotにメンションすると、対話的にデバッグすることもできます。
詳しくは、\`サンプルプログラムを表示\`コマンドを参照してください。

\`\`\`js
return [
  {
    title: '記事1',
    url: 'https://example.com/article/1'
  },
  {
    title: '記事2',
    url: 'https://example.com/article/2'
  },
]
\`\`\``
