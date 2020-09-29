const errh = require('./helpers.js').err;
const discord = require('discord.js');
const { log, randomnoise, checkurl } = require('./helpers.js')

function isowner(msg)
{
    if(msg.author.id !== "507793672209825792")
    {
        const embed = new discord.MessageEmbed()
        .setAuthor(randomnoise(), msg.client.user.displayAvatarURL())
        .setTitle(`This command can only be used by my developer!`)
        .setColor(process.env.BOT_COLOR)
        .setFooter(`${msg.author.username}#${msg.author.discriminator}`, checkurl(msg.author.avatarURL()))
        return msg.channel.send(embed);
    }
}

module.exports.status = (msg, args) =>
{
    isowner(msg);
    if(!args.length)
    {
        const embed = new discord.MessageEmbed()
        .setAuthor(randomnoise(), msg.client.user.displayAvatarURL())
        .setTitle(`No valid status`)
        .addField(`Arguments`, `0: status (online, idle, invisible, dnd)\n1: Type of activity (PLAYING, STREAMING, LISTENING, WATCHING)\n2: Game name`)
        .setColor(process.env.BOT_COLOR)
        .setFooter(`${msg.author.username}#${msg.author.discriminator}`, checkurl(msg.author.avatarURL()))
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
            log(`Updated status`, msg)
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
        log(`Updated status`, msg)
    })
}

module.exports.servers = (msg, args) =>
{
    isowner(msg)
    const servers = msg.client.guilds.cache.sort((a,b)=>{return b.memberCount - a.memberCount});
    let length_check = 0;
    let members = 0;
    servers.array().forEach((server)=>{members += server.memberCount})
    const title = `Bot servers list`;
    const description = `\`\`\`swift\nGeneral information\
    \nNumber of servers bot is in: ${servers.array().length}\
    \nNumber of users in all servers: ${members}\
    \`\`\``;

    length_check += title.length;
    length_check += description.length;


    let i = 0;
    const embed = new discord.MessageEmbed()
    .setTitle(title)
    .setDescription(description)
    .setColor(process.env.BOT_COLOR)
    servers.forEach(server=>
    {
        if(i >= 24 || length_check >= 6000) return;
        const owner = server.owner;
        const o_string = `${owner.user.username}#${owner.user.discriminator} ${owner.nickname ? '| '+owner.nickname : ''}`
        const s_name = server.name;
        const s_count = server.memberCount;
        const s_partnered = server.partnered;
        const s_boosted = server.premiumSubscriptionCount;
        const s_teir = server.premiumTier;
        const s_location = server.region;
        const s_verified = server.verified;
        const header = `🕹 ${s_name} | 👪 ${s_count}`;
        const body = `\`\`\`swift
        \n👑| ${o_string}\
        \n🌏| ${s_location}\
        \n✅| ${s_verified}\
        \n☄️| ${s_partnered ? 'Partnered Server❗️' : "Not Partnered"}\
        \n🚀| Nitro boosted: ${s_boosted}\
        \n🌌| Nitro server teir: ${s_teir}\
        \`\`\``
        i++;
        length_check += header.length;
        length_check += body.length;
        if(length_check < 6000) embed.addField(header, body)
    })
    msg.channel.send(embed)
}