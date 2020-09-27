const {sendmessage} = require('./helpers.js')
const {DB} = require('../index');
const discord = require('discord.js');
const errh = require('./helpers.js').err;
const uptime = require('../index');

module.exports.send_uptime = (msg) =>
{
    const date_start = uptime['uptime'];
    const date_curr = new Date().toISOString();
    const diff = new Date(date_curr) - new Date(date_start);

    const hours =  Math.floor(diff / 3.6e6) == 0 ? `` : `${Math.floor(diff / 3.6e6) % 60} ${Math.floor(diff / 3.6e6) % 60 <= 1 ? 'Hour' : 'Hours'} `;
    const mins =  Math.floor(diff / 60e3) == 0 ? `` :`${Math.floor(diff / 60e3) % 60} ${Math.floor(diff / 60e3) % 60 <= 1 ? 'Min' : 'Mins'} `
    const secs = Math.floor(diff / 1e3) == 0 ? `` : `${Math.floor(diff / 1e3) % 60} ${Math.floor(diff / 1e3) % 60 <= 1 ? 'Sec' : 'Secs'} `;
    const formatting = `🟢 ${hours}${mins}${secs}`;
    


    const embed = new discord.MessageEmbed()
    .setColor(process.env.BOT_COLOR)
    .setDescription(`\`\`\`swift\nMonkeybot has been online for\ 
    \n${formatting}\
    \`\`\``)
    .setTimestamp()
    .setFooter(`${msg.author.username}#${msg.author.discriminator}`, `${msg.author.avatarURL()}`);
    msg.channel.send(embed);



}