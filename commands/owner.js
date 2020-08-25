const errh = require('./helpers.js').err;
const discord = require('discord.js');
const { log, randomnoise } = require('./helpers.js')

module.exports.status = (msg, args) =>
{
    if(msg.author.id !== "507793672209825792")
    {
        const embed = new discord.MessageEmbed()
        .setAuthor(randomnoise(), msg.client.user.displayAvatarURL())
        .setTitle(`This command can only be used by my developer!`)
        .setColor(process.env.BOT_COLOR)
        .setFooter(`${msg.author.username}#${msg.author.discriminator}`, `${msg.author.avatarURL()}`)
        return msg.channel.send(embed);
    }
    if(!args.length)
    {
        const embed = new discord.MessageEmbed()
        .setAuthor(randomnoise(), msg.client.user.displayAvatarURL())
        .setTitle(`No valid status`)
        .addField(`Arguments`, `0: status (online, idle, invisible, dnd)\n1: Type of activity (PLAYING, STREAMING, LISTENING, WATCHING)\n2: Game name`)
        .setColor(process.env.BOT_COLOR)
        .setFooter(`${msg.author.username}#${msg.author.discriminator}`, `${msg.author.avatarURL()}`)
        return msg.channel.send(embed);
    }

    const active = args[0]
    args.shift();
    const type = args[0].toUpperCase()
    args.shift();
    const name = args.join(" ");

    if(type === 'STREAMING')
    {
        msg.client.user.setPresence({
            activity:
            {
                name: name,
                type: type, // PLAYING, WATCHING, LISTENING, STREAMING
                url: 'https://www.twitch.tv/av3p_'
            },
            status: active
        })
        .then(()=>{
            log(msg, `Updated status`)
        })
        return;
    }

    msg.client.user.setPresence({
        activity:
        {
            name: name,
            type: type // PLAYING, WATCHING, LISTENING, STREAMING
        },
        status: active
    })
    .then(()=>{
        log(msg, `Updated status`)
    })



}