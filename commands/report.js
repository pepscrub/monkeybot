const {DB} = require('../index');
const discord = require('discord.js');
const { timestamp, sendmessage } = require('./helpers');
const errh = require('./helpers.js').err;

module.exports.report = async (msg, args) =>
{
    try
    {
        if(args.length == 0)
        {
            sendmessage(msg, `Please describe the bug you encountered and steps to recreate it`);
        }
        else
        {
            let embed = new discord.MessageEmbed()
            .setColor(process.env.BOT_COLOR_ERR)
            .setFooter(`${msg.author.username}#${msg.author.discriminator}`, `${msg.author.avatarURL()}`)
            .setTimestamp()
            .setDescription(`\`\`\`swift\n${msg.author.username}: ${timestamp()}\
            \n🐛 User reported bug\
            \n\n${args.join(' ')}\
            \`\`\``)
            if(msg.channel == undefined) return;
            else
            {
                const owner = await msg.client.users.fetch('507793672209825792');
                owner.send(embed);
                sendmessage(msg, "📝 Your bug has been reported");
                
            }
        }
    }catch(e)
    {
        errh(e, msg)
    }
}