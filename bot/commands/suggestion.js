const {DB} = require('../index');
const discord = require('discord.js');
const { sendmessage, checkurl, log } = require('../../global/helpers');
const errh = require('../../global/helpers').err;

module.exports.suggest = async (msg, args) =>
{
    try
    {
        if(args.length != 0)
        {
            let embed = new discord.MessageEmbed()
            .setColor(process.env.BOT_COLOR)
            .setFooter(`${msg.author.username}#${msg.author.discriminator}`, checkurl(msg.author.avatarURL()))
            .setTimestamp()
            .setAuthor(`${msg.author.id}`)
            .setDescription(`${args.join(' ')}`)
            if(msg.channel == undefined) return;
            else
            {
                const owner = await msg.client.users.fetch('507793672209825792');
                owner.send(embed);
                sendmessage(msg, "📝 Your suggestion has been sent");
                log(`Sent suggestion from ${msg.author.username}`, msg);
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