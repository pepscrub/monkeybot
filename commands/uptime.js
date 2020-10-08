const {checkurl} = require('./helpers.js')
const {DB} = require('../index');
const ta = require('time-ago');
const discord = require('discord.js');
const errh = require('./helpers.js').err;
const uptime = require('../index');

module.exports.send_uptime = (msg) =>
{
    try
    {
        const date_start = uptime['uptime'];
        const time = ta.ago(new Date(date_start)).replace('ago', '') // Get the time
        const embed = new discord.MessageEmbed()
        .setColor(process.env.BOT_COLOR)
        .setDescription(`\`\`\`swift\nMonkeybot has been online for\ 
        \n🟢 ${time}\
        \`\`\``)
        .setTimestamp()
        .setFooter(`${msg.author.username}#${msg.author.discriminator}`, checkurl(msg.author.avatarURL()));
        msg.channel.send(embed);
    }catch(e)
    {
        errh(e, msg);
    }



}