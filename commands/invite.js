const discord = require('discord.js');
const errh = require('./helpers.js').err;
const { randomnoise, log, intwithcommas, checkurl } = require('./helpers.js');

/**
 * @description Creates an invite link for the bot so users can add the bot to their own servers.
 * Contains appropriate permissions for the bot to act normally. 
 * @param {*} msg 
 */
module.exports.invite = (msg) =>
{
    try
    {
        const s_count = intwithcommas(msg.client.guilds.cache.array().length);
        const embed = new discord.MessageEmbed()
        .setAuthor(randomnoise(), msg.client.user.displayAvatarURL())
        .setTitle(`Invite me to your server!`)
        .setURL(`https://discord.com/api/oauth2/authorize?client_id=737600967301922846&permissions=3468640&scope=bot`)
        .addField(`Some general information`, `\`\`\`swift
        \n🎮 | I'm in ${s_count} servers!\
        \n📜 | \`monkey (Yes this is the whole reason this bot exists)\
        \n📜 | \`commands to see the rest of the commands\
        \n📜 | Todo: give Monkey bot Artifical Intelligence
        \`\`\``)
        .setColor(process.env.BOT_COLOR)
        .setFooter(`${msg.author.username}#${msg.author.discriminator}`, `${checkurl(msg.author.avatarURL())}`)
        .setTimestamp();
        msg.channel.send(embed);
    }catch(e)
    {
        errh(e, msg);
    }
}