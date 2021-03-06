require('dotenv').config();
const { getVideoMeta } = require(`tiktok-scraper`);
const Discord = require(`discord.js`);
const client = new Discord.Client();
client.util = require(`./util/helpers.js`);



client.on('ready', () => {
  client.user.setPresence({ activity: { type: 'LISTENING', name: `your TikToks! | ${process.env.PREFIX}invite` } })
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async msg => {
  switch(msg.content) {
    case `${process.env.PREFIX}status` : 
      if(msg.author.id !== `189238841054461952`) return;
      client.user.setPresence({ activity: { type: 'LISTENING', name: `your TikToks! | ${process.env.PREFIX}invite` } })
      break;
    case `${process.env.PREFIX}invite` :
      console.log(`[INFO] Invite Command used. [${msg.author.tag}]`)
      msg.reply(`Invite me here with this link.\n ${process.env.INVITE_URL}`)
      break;
  }
  if (msg.content.includes('https://vm.tiktok.com') || msg.content.includes('tiktok.com/@')) {
    //let loading = await msg.channel.send(`Loading TikTok...`);
    console.log(`Message contains a TikTok link!`);

    let urlRegex = /(https?:\/\/[^ ]*)/;
    let url = msg.content.match(urlRegex)[1];
    url = url.split(`?`)[0];
    getVideoMeta(url, client.util.options).then(data => {
      const videoAttach = new Discord.MessageAttachment(data.videoUrl, `tiktok.mp4`);
      console.log(data)
      client.util.checkManagePermissions(msg, client);
      //loading.delete();
      msg.channel.send(data.videoUrl)
    }).catch(() => {
      client.util.checkManagePermissions(msg, client);
      msg.channel.send(`[ERROR] This video is either Private or has been removed`);
    })
  }
});

client.login(process.env.TOKEN);