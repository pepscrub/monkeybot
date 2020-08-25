const discord = require('discord.js');
const errh = require('./helpers.js').err;
const { randomnoise, log } = require('./helpers.js');

/**
 * @description Creates an invite link for the bot so users can add the bot to their own servers.
 * Contains appropriate permissions for the bot to act normally. 
 * @param {*} msg 
 */
module.exports.invite = (msg) =>
{
    const embed = new discord.MessageEmbed()
    .setAuthor(randomnoise(), msg.client.user.displayAvatarURL())
    .setTitle(`Here's an invite link`)
    .setURL(`https://discord.com/api/oauth2/authorize?client_id=737600967301922846&permissions=3468640&scope=bot`)
    .addField(`https://discord.com/api/oauth2/authorize?client_id=737600967301922846&permissions=3468640&scope=bot`, randomnoise())
    .setColor(process.env.BOT_COLOR)
    .setFooter(`${msg.author.username}#${msg.author.discriminator}`, `${msg.author.avatarURL()}`)
    msg.channel.send(embed);
    msg.delete().catch();
}