import { Message, TextChannel } from 'discord.js'
import { getRepository } from 'typeorm'
import { DiscordChannel } from '../entity/DiscordChannel'
import { DiscordServer } from '../entity/DiscordServer'
import { saveChannel } from '../util/save-channel'
import { table } from '../util/textTable'

export const init = async (message: Message): Promise<boolean> => {
  if (!message.content.match(/^(init|このチャンネルを登録)/)) {
    return false
  }

  if (await getRepository(DiscordChannel).findOne({ id: message.channel.id })) {
    message.channel.send('このチャンネルはすでに登録されています。')
    return true
  }

  if (!await getRepository(DiscordChannel).findOne({ id: message.guild.id })) {
    const server = new DiscordServer()
    server.id = message.guild.id
    server.name = message.guild.name
    await getRepository(DiscordServer).save(server)
  }
  const savedChannelEntity = await saveChannel(message.channel as TextChannel)

  if (savedChannelEntity) {
    message.channel.send(
      '以下の内容で登録しました。\n' +
        '```\n' +
        table([
          ['サーバＩＤ', `${message.guild.id}`],
          ['サーバ名', `${message.guild.name}`],
          ['チャンネルＩＤ', `${message.channel.id}`],
          ['チャンネル名', `${(message.channel as TextChannel).name}`]
        ]).replace(/ /g, '　') +
        '```'
    )
  } else {
    message.channel.send('データの登録に失敗しました。')
  }
  return true
}
