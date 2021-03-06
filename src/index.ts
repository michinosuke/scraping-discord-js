import { Client } from 'discord.js'
import { DISCORD_TOKEN } from '../config'
import 'reflect-metadata'
import { createConnection, getConnectionOptions, getRepository } from 'typeorm'
import { ScheduledTask } from './entity/ScheduledTask'
import { help } from './response/help'
import { hello } from './response/hello'
import { status } from './response/status'
import { unsubscribe } from './response/unsubscribe'
import { taskRouter } from './response/task-router'
import { addTask } from './response/add-task'
import { runScheduledTask } from './util/run-scheduled-task'
import { statusInChannel } from './response/status-in-channel'
import { interactiveRunCode } from './response/interactive-run-code'
import { showSampleProgram } from './response/show-sample-program'
import { deleteServer } from './response/delete-server'

const client = new Client()

// const sleep = (seconds: number) => new Promise((resolve) => setTimeout(resolve, seconds, null))

client.on('ready', async () => {
  console.log('I am ready!')
  const tasks = await getRepository(ScheduledTask).find({ status: 'running' })
  for (const i in tasks) {
    await runScheduledTask(client, tasks[i].id)
    // await addTaskLog(tasks[i], '起動しました。')
    // await sleep(10)
  }
})

client.on('message', async message => {
  const targetUserId = message.mentions.members.first()?.id
  const authorUserId = message.author.id
  const botUserId = client.user.id

  if (authorUserId === botUserId) {
    return // 無限ループを発生させないため（念の為）
  }

  if (targetUserId !== botUserId) return

  const commandMatch = message.content.match(/(?<= +).+/ms)
  if (!commandMatch) {
    message.channel.send('コマンドを検出できませんでした。\n利用できるコマンド一覧は、`ヘルプ`で確認できます。')
    return
  }
  message.content = commandMatch[0]
  message.content = message.content.replace(/^ＩＤ/, 'ID')

  // TODO: 全て起動
  // TODO: 全て停止

  // タスクを新規作成
  if (await addTask(message)) return

  // IDが1のタスク...系
  if (await taskRouter(client, message)) return

  if (await statusInChannel(message)) return

  // ヘルプを表示
  if (await help(message)) return

  // チャンネルを削除
  if (await unsubscribe(message)) return

  // サーバを削除
  if (await deleteServer(message)) return

  // チャンネルを登録
  // if (await init(message)) return

  // ステータスを表示
  if (await status(message)) return

  // hello
  if (await hello(client, message)) return

  // サンプルプログラムを表示
  if (await showSampleProgram(message)) return

  // 対話的にプログラムを実行する
  if (await interactiveRunCode(message)) return

  message.channel.send('コマンドを検出できませんでした。\n利用できるコマンド一覧は、`ヘルプ`で確認できます！')
})

getConnectionOptions().then(connectionOptions => {
  const customOptions = Object.assign(connectionOptions,
    {
      type: 'mysql',
      charset: 'utf8mb4_general_ci'
    })

  createConnection(customOptions).then(() => {
    client.login(DISCORD_TOKEN)
  })
})
