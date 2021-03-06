import { Client, TextChannel } from 'discord.js'
import { getRepository } from 'typeorm'
import { Article } from '../entity/Article'
import { DiscordChannel } from '../entity/DiscordChannel'
import { ScheduledTask } from '../entity/ScheduledTask'
import { addTaskLog } from './add-task-log'
import { runScrapCode } from './run-scrap-code'
import { stopTask } from './stop-task'

const MAX_SEND_AT_ONCE_ON_FIRST = 1
const MAX_SEND_AT_ONCE = 10

const skipThisTime = (client: Client, task: ScheduledTask) => {
  setTimeout(() => {
    runScheduledTask(client, task.id)
  }, task.intervalMinutes * 1000 * 60)
}

export const runScheduledTask = async (client: Client, taskId: number) => {
  const task = await getRepository(ScheduledTask).findOne({
    where: { id: taskId },
    relations: ['channel', 'articles']
  })
  if (!task) throw new Error(`IDが${taskId}のタスクは存在しません。`)
  if (task.status !== 'running') return

  const thisChannel = (client.channels.cache.get(task.channel.id) as TextChannel)

  // console.log(`IDが${taskId}のタスクを実行中（次は${task.intervalMinutes}分後`)

  try {
    const fetchedArticles = await runScrapCode(task.program)

    if (!Array.isArray(fetchedArticles)) {
      throw new Error('登録されたプログラムを実行したところ、配列以外のオブジェクトが返却されました。')
      // thisChannel.send(`IDが${taskId}のタスクの実行時にエラーが発生したため、ステータスをstoppedに変更しました。\n詳しくはログを確認してください。`)
      // const savedTask = await addTaskLog(task, '登録されたプログラムを実行したところ、配列以外のオブジェクトが返却されました。')
      // stopTask(savedTask)
      // return
    }

    const UrlsInDatabase = task.articles.map(article => article.url)

    const addedArticles = fetchedArticles.filter(article => (
      !UrlsInDatabase.includes(article.url)
    ))

    if (addedArticles.length === 0) {
      skipThisTime(client, task)
      return
    }

    // 初回時（データベースにすでに記事があるとき）と２回目以降で最大送信数が違う
    const maxSend = UrlsInDatabase.length === 0 ? MAX_SEND_AT_ONCE_ON_FIRST : MAX_SEND_AT_ONCE

    addedArticles.slice(-maxSend).forEach(article => {
      thisChannel.send(`${article.title}\n${article.url}`)
    })

    for (const addedArticle of addedArticles) {
      const article = new Article()
      article.task = task
      article.title = addedArticle.title
      article.url = addedArticle.url
      await getRepository(Article).save(article)
    }

    const channelEntity = task.channel
    channelEntity.lastFetchedAt = new Date()
    await getRepository(DiscordChannel).save(channelEntity)

    skipThisTime(client, task)
  } catch (e) {
    thisChannel.send(`IDが${taskId}のタスクの実行時にエラーが発生したため、ステータスをstoppedに変更しました。\n詳しくはログを確認してください。`)
    const savedTask = await addTaskLog(task, e)
    stopTask(savedTask)
  }
}
