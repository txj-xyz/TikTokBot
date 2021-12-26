import { config } from 'dotenv'
import { Client, Intents, Options, MessageAttachment } from 'discord.js'
import { getVideoMeta as fetch } from 'tiktok-scraper'

if (config()?.error) throw new Error('Failed to load .env file')

class TikTok extends Client {
    constructor() {
        super({
            intents: ['GUILDS', 'GUILD_MESSAGES'].map((i: string) => (Intents as any).FLAGS[i]),
            makeCache: Options.cacheWithLimits({ MessageManager: { maxSize: 200, sweepInterval: 5 * 60000 } }),
            presence: { status: 'dnd', activities: [{ name: 'Just Started Up. What Did I Miss? | /help', type: 'LISTENING' }] }
        })

        this.on('ready', this.ready)
        this.on('messageCreate', this.messageCreate)
        this.login(process.env.TOKEN)
    }

    get reply() {
        return { content: null, embeds: [], files: [], components: [], allowedMentions: { repliedUser: false } }
    }

    mergify = (m: object, ...s: Array<Object>) => { s.map(o => Object.keys(o).map((k: string) => (m as any)[k] = (o as any)[k])); return m }

    timeify = (ms: number) => {
        let sec: any = (ms / 1000).toFixed(0),
            min: any = Math.floor(sec as any / 60),
            hrs: any = 0
        const final = []
        if (min > 59) (hrs as any) = ((h: number = Math.floor(min / 60)) => h >= 10 ? h : `0${h}`)();
        (min as any) = ((m: number = min - hrs * 60) => m >= 10 ? m : `0${m}`)();
        (sec as any) = ((s: number = Math.floor(sec % 60)) => s >= 10 ? s : `0${s}`)()
        parseInt(hrs) ? final.push(`${parseInt(hrs)} hr(s)`) : null
        parseInt(min) ? final.push(`${parseInt(min)} min(s)`) : null
        parseInt(sec) ? final.push(`${parseInt(sec)} sec(s)`) : null
        return final.join(', ')
    }

    ready = () => console.log(`Connected to ${this.user?.tag ?? 'Client'}.`)

    async messageCreate(message: any) {
        if (message.author?.bot || message.channel?.type === 'DM') return
        let urls = message.content?.match(/http(s?):\/\/(vm|www)\.tiktok\.com\/.*?\/(video\/\d*)?/g)
        if (!urls?.some((e: string) => e)) return
        else urls = [...new Set(urls)]
        for await (const url of urls) {
            let video = await fetch(url).catch(e => null)
            if (!video) message.reply(this.mergify(this.reply, { content: `Unable to find data for <${url}>` }))
            else {
                const embed = {
                    color: 0xE18499,
                    author: { name: video.collector[0].authorMeta.nickName, icon_url: video.collector[0].authorMeta.avatar, url: `https://www.tiktok.com/@${video.collector[0].authorMeta.name}` },
                    description: `**[${video.collector[0].text}](${url})**`,
                    thumbnail: { url: video.collector[0].musicMeta?.coverMedium },
                    fields: [
                        {
                            name: 'Video Stats',
                            value: [
                                `\u25B6\uFE0F Plays: \`${video.collector[0].playCount.toLocaleString()}\``,
                                `\uD83D\uDD17 Shares: \`${video.collector[0].shareCount.toLocaleString()}\``,
                                `\u2764\uFE0F Likes: \`${video.collector[0].diggCount.toLocaleString()}\``,
                                `\uD83D\uDCAC Comments: \`${video.collector[0].commentCount.toLocaleString()}\``,
                            ].join('\n'),
                            inline: true
                        },
                        {
                            name: 'Music Info',
                            value: [
                                `Name: \`${video.collector[0].musicMeta?.musicName}\``,
                                `Author: \`${video.collector[0].musicMeta?.musicAuthor}\``,
                                `Original: \`${video.collector[0].musicMeta?.musicOriginal ? 'Yes' : 'No'}\``,
                                `Duration: \`${this.timeify((video.collector[0].musicMeta?.duration ?? 0) * 1000)}\``,
                                `Cover Image: [\`Click here!\`](${video.collector[0].musicMeta?.coverLarge})`
                            ].join('\n'),
                            inline: true
                        },
                        { name: '\u200B', value: `This information was provided by \`${this.user?.tag}\`, if you would like this bot on your own server contact [Kurasad#2521](https://discord.com/users/476812566530883604).` }
                    ],
                    timestamp: new Date(video.collector[0].createTime * 1000),
                    footer: { text: `Provided by ${this.user?.tag} | Video Uploaded`, icon_url: this.user?.avatarURL({ format: 'png', dynamic: true, size: 128 }) }
                }
                message.reply(this.mergify(this.reply, { embeds: [embed], files: [new MessageAttachment(video.collector[0]?.videoUrl, 'upload.mp4')] }))
            }
        }
    }
}


(global as any).Client = new TikTok()