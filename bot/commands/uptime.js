const {checkurl} = require('../../global/helpers')
const {DB} = require('../index');
const ta = require('time-ago');
const discord = require('discord.js');
const errh = require('../../global/helpers').err;

module.exports.send_uptime = (msg) =>
{
    try
    {
        const uptime = new Date().setSeconds(process.uptime());
        const time = ta.ago(uptime).replace('from now', '') // Get the time
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