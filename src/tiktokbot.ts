// Import modules.
import { config } from 'dotenv'
import { Client, Message, Intents, Options, MessageAttachment, MessageEmbed } from 'discord.js'
import { getVideoMeta as fetch } from 'tiktok-scraper'

// Log <ENV> errors.
if (config()?.error) throw new Error('Failed to load .env file')

// Define global interfaces.
declare global {
    var Client: object

    interface String {

        /**
         * Compare two strings case insensitive.
         * 
         * @param [query] The string to compare with "this".
         * @return boolean
         * 
         * @example
         * "a".compare("b"): false (boolean)
         * "a".compare("A"): true (boolean)
         */

        is(query: string): boolean
    }
}

/**
 * Create and login to Discord client with custom properties.
 * 
 * @param [] None required.
 * @example new TikTok()
 */
export default class TikTok extends Client {
    public constructor() {
        super({
            intents: ['GUILDS', 'GUILD_MESSAGES'].map((i: string) => (Intents as any).FLAGS[i]),
            makeCache: Options.cacheWithLimits({ MessageManager: { maxSize: 200, sweepInterval: 5 * 60000 } }),
            presence: { status: 'dnd', activities: [{ name: 'Just Started Up. What Did I Miss? | /help', type: 'LISTENING' }] }
        })

        // Compare two strings case insensitive.
        String.prototype.is = function (query: string) { return this.localeCompare(query, undefined, { sensitivity: 'accent' }) === 0 }

        // Client events.
        this
            .on('ready', this.ready)
            .on('messageCreate', this.messageCreate)
            .login(process.env.TOKEN)
    }

    /**
     * Get default <Message> reply structure.
     * 
     * @param [] None required.
     * @return object
     * 
     * @example 
     * <TikTok>.reply: {...} (object)
     */
    private get reply() {
        return { content: null, embeds: [], files: [], components: [], allowedMentions: { repliedUser: false } }
    }

    /**
     * Merge multiple objects into one.
     * 
     * @param [main] The main object to merge into.
     * @param [secondary] The sub-objects to merge into the main.
     * @return object
     * 
     * @example
     * <TikTok>.mergify({ a: 1 }, { b: 2 }): { a: 1, b: 2 } (object)
     */
    private mergify = (main: { [key: string]: any }, ...secondary: object[]) => {
        secondary.map((obj: { [key: string]: any }) => Object.keys(obj).map((k: string) => main[k] = obj[k]))
        return main
    }

    /**
     * Make a millisecond time number readable.
     * 
     * @param [ms] The ms time to convert.
     * @return string
     * 
     * @example
     * <TikTok>.timeify(60 * 1000): "1 min(s)" (string)
     */
    private timeify = (ms: number) => {
        // Declare variables.
        let sec: number = Math.round(ms / 1000)
        let min: number = Math.floor(sec / 60)
        let hrs: number = 0
        const final: string[] = []

        // Complete logic.
        if (min >= 60) { (hrs = Math.floor(min / 60)) ? final.push(`${hrs} hr(s)`) : null }
        { (min -= hrs * 60) ? final.push(`${min} min(s)`) : null }
        { (sec = Math.floor(sec % 60)) ? final.push(`${sec} sec(s)`) : null }
        return final.join(', ')
    }

    /**
     * <discord.js> Client event: "ready".
     * 
     * @param [] None required.
     * @return null
     * 
     * @example 
     * <TikTok>.ready(): null
     */
    private ready = () => console.log(`Connected to ${this.user?.tag ?? 'Client'}.`)

    /**
     * <discord.js> Client event: "messageCreate".
     * 
     * @param {import('discord.js').Message} [message] <discord.js> Message object.
     * @return null
     * 
     * @example 
     * <TikTok>.messageCreate(<Message>): null
     */
    private async messageCreate(message: Message) {

        // Check for bot message or DM message.
        if (message.author?.bot || message.channel?.type?.is('DM')) return

        // Match all TikTok links.
        let urls: RegExpMatchArray | null = message.content?.match(/http(s?):\/\/(vm|www)\.tiktok\.com\/.*?\/(video\/\d*)?/g)

        // If no URLs, return. Otherwise remove duplicates.
        if (!urls?.some((e: string) => e)) return
        else urls = [...new Set(urls)]

        // Loop though URLs.
        for await (const url of urls) {

            // Try to fetch video.
            let video = await fetch(url).catch(null)
            if (!video) message.reply(this.mergify(this.reply, { content: `Unable to find data for <${url}>` }))
            else {

                // Create <discord.js> MessageEmbed.
                const embed: MessageEmbed | object = {
                    color: 0xE18499,
                    author: {
                        name: video.collector[0].authorMeta.nickName,
                        iconURL: video.collector[0].authorMeta.avatar,
                        url: `https://www.tiktok.com/@${video.collector[0].authorMeta.name}`
                    },
                    description: `**[${video.collector[0].text}](${url})**`,
                    thumbnail: {
                        url: video.collector[0].musicMeta?.coverMedium ?? ''
                    },
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
                        {
                            name: '\u200B',
                            value: `This information was provided by \`${this.user?.tag}\`, if you would like this bot on your own server contact [Kurasad#2521](https://discord.com/users/476812566530883604).`,
                            inline: false
                        }
                    ],
                    timestamp: new Date(video.collector[0].createTime * 1000).getTime(),
                    footer: {
                        text: `Provided by ${this.user?.tag} | Video Uploaded`,
                        iconURL: this.user?.avatarURL({ format: 'png', dynamic: true, size: 128 }) ?? ''
                    }
                }

                // Reply with video info.
                message.reply(this.mergify(this.reply, { embeds: [embed], files: [new MessageAttachment(video.collector[0]?.videoUrl, 'upload.mp4')] }))
            }
        }
    }
}

global.Client = new TikTok()
