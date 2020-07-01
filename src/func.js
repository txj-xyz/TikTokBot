const { deleteVideo } = require('./config.json'); //Include the current config and pull deleteVideo

module.exports = (client) = {
  checkManagePermissions(msg, client){
    if(!msg.channel.permissionsFor(client.user.id).has(`MANAGE_MESSAGES`) && deleteVideo === true){
      msg.author.send(`Sorry about that, I don't have permissions to delete messages, please give me \`MANAGE_MESSAGES\` permissions in this channel to fix this.`);
    }
  }
};