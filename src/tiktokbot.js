require('dotenv').config();
const { getVideoMeta } = require(`tiktok-scraper`);
const { MessageAttachment, MessageEmbed, Client, Intents } = require(`discord.js`);
const client = new Client({
    intents: ['GUILDS', 'GUILD_MESSAGES'].map((i) => Intents.FLAGS[i]),
});

const convertNumToInternational = function (number) {
    return Math.abs(Number(number)) >= 1.0e9
        ? (Math.abs(Number(number)) / 1.0e9).toFixed(1) + 'B'
        : Math.abs(Number(number)) >= 1.0e6
        ? (Math.abs(Number(number)) / 1.0e6).toFixed(1) + 'M'
        : Math.abs(Number(number)) >= 1.0e3
        ? (Math.abs(Number(number)) / 1.0e3).toFixed(1) + 'K'
        : Math.abs(Number(number));
};

client.on('ready', () => {
    client.user.setPresence({ activity: { type: 'LISTENING', name: `your TikToks! | ${process.env.PREFIX}invite` } });
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    if (
        message.content.includes('https://') &&
        (message.content.includes('tiktok.com/') || message.content.includes('vm.tiktok.com/'))
    ) {
        const tiktokLink = message.content.match(/(https?:\/\/[^ ]*)/)[1].split(`?`)[0];
        try {
            getVideoMeta(tiktokLink, {})
                .then(async (videoMeta) => {
                    const videoMetaEmbed = new MessageEmbed()
                        .setURL(tiktokLink)
                        .setTitle(`"${videoMeta.collector[0]?.text}"`, null, tiktokLink)
                        .addField(
                            '**Likes**',
                            String(convertNumToInternational(videoMeta.collector[0]?.diggCount)),
                            true
                        )
                        .addField(
                            '**Views**',
                            String(convertNumToInternational(videoMeta.collector[0]?.playCount)),
                            true
                        )
                        .addField(
                            '**Comments**',
                            String(convertNumToInternational(videoMeta.collector[0]?.commentCount)),
                            true
                        )
                        .setFooter(`Uploaded: ${new Date(videoMeta.collector[0]?.createTime * 1000).toLocaleString()}`);
                    await message.channel.send({
                        embeds: [videoMetaEmbed],
                        files: [new MessageAttachment(videoMeta.collector[0]?.videoUrl, `tiktok.mp4`)],
                    });
                })
                .catch(() => {
                    message.channel.send(`[ERROR] This video is either Private or has been removed`);
                });
        } catch (error) {}
    }
});

client.login(process.env.TOKEN);
