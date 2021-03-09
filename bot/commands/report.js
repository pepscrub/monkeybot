const {DB} = require('../index');
const discord = require('discord.js');
const { timestamp, sendmessage, checkurl } = require('../../global/helpers');
const errh = require('../../global/helpers').err;

module.exports.report = async (msg, args) =>
{
    try
    {
        if(args.length != 0)
        {
            let embed = new discord.MessageEmbed()
            .setAuthor(`${msg.author.id}`)
            .setColor(process.env.BOT_COLOR_ERR)
            .setFooter(`${msg.author.username}#${msg.author.discriminator}`, checkurl(msg.author.avatarURL()))
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
                sendmessage(msg, "📝 Your message has been sent");
                
            }
        }else
        {
            sendmessage(msg, "invalid message.");
        }
    }catch(e)
    {
        errh(e, msg)
    }
}