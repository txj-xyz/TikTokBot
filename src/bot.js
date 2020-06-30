const { token, inviteLink, deleteVideo } = require('./config.json');
const { getVideoMeta } = require('tiktok-scraper');
const Discord = require('discord.js');
const client = new Discord.Client();

let videoCounter = 0;

const options = {
  number: 50,
  proxy: '',
  by_user_id: false,
  asyncDownload: 5,
  asyncScraping: 3,
  filepath: `CURRENT_DIR`,
  fileName: `CURRENT_DIR`,
  randomUa: false,
  noWaterMark: false,
  hdVideo: false,
};


client.on('ready', () => {
  client.user.setPresence({ activity: { type: 'LISTENING', name: `${client.guilds.cache.size} servers. | ++invite` } })
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async msg => {
  // setup a switch for the general commands.
  switch(msg.content) {
    case `++debug` :
      msg.channel.send(`**DEBUG INFO**\n\`\`\`js\nVideo Count: ${videoCounter}\n Uptime: ${client.uptime}\n Options: ${JSON.stringify(options, null, 2)}\n\`\`\``)
      break;
    case `++invite` :
      msg.reply(`Invite me here with this link.\n ${inviteLink}`)
      break;
  }
  if (msg.content.includes('https://vm.tiktok.com') || msg.content.includes('https://www.tiktok.com')) {
    console.log(`Message contains a TikTok link!`);
    videoCounter++ // Count up on the video counter

    let urlRegex = /(https?:\/\/[^ ]*)/; // regex to check if the content posted is a link for a tiktok
    let input = msg.content;
    let url = input.match(urlRegex)[1]; // Make sure the first URL found matches the regex
    url = url.split(`?`)[0];
    console.log(url) // Log the URL link to the console so I can see it working.
    try {
      let loading = await msg.channel.send(`:satellite_orbital: Recieving TikTok Data...`) // Send out the loading embed to wait for the video data.
      getVideoMeta(url, options).then(data => { // Queue the url against the webscraper to get the data from tiktok.
        loading.delete(); // Delete the loading embed when the video is ready to post.
        if(deleteVideo === true) msg.delete(); // Delete the message when it is detected.
        msg.channel.send(new Discord.MessageAttachment(data.videoUrl, `tiktok.mp4`)) // Send the data to the Discord Channel.
      })
    } catch (error) {
      console.log(error);
      //msg.channel.send(`I'm sorry about that, there was an error trying to reach TikToks API, please try again.`)
    }
  }
});

client.login(token);