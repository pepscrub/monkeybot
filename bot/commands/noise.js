const discord = require('discord.js');
const { randomnoise, checkurl } = require('../../global/helpers');

module.exports.sendnoise = (msg) =>
{
    const embed = new discord.MessageEmbed()
    .setColor(process.env.BOT_COLOR)
    .setTitle(`${randomnoise()}`)
    .setTimestamp()
    .setFooter(`${msg.author.username}#${msg.author.discriminator}`, checkurl(msg.author.avatarURL()));
    msg.channel.send(embed);
}
