
module.exports = (client) = {
  checkManagePermissions(msg, client){
    if(!msg.channel.permissionsFor(client.user.id).has(`MANAGE_MESSAGES`) && process.env.DELETEVIDEO === true){
      msg.author.send(`Sorry about that, I don't have permissions to delete messages, please give me \`MANAGE_MESSAGES\` permissions in this channel to fix this.`);
    }
  }
};

module.exports.options = {
  number: 1,
  proxy: ``,
  by_user_id: false,
  asyncDownload: 5,
  asyncScraping: 3,
  filepath: `CURRENT_DIR`,
  fileName: `CURRENT_DIR`,
  randomUa: false,
  noWaterMark: true,
  hdVideo: true
}