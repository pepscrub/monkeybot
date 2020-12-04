const discord = require('discord.js');
const errh = require('../../global/helpers').err;
const { randomnoise, intwithcommas, checkurl, Perms, sendmessage } = require('../../global/helpers');
const { log } = require('../../global/helpers');

/**
 * @description Creates an invite link for the bot so users can add the bot to their own servers.
 * Contains appropriate permissions for the bot to act normally. 
 * @param {*} msg 
 */
module.exports.invite = (msg) =>
{
    try
    {
        const perms = new Perms(msg);

        if(!perms.invite()) return sendmessage(msg, "Can't sent instant invite (missing permissions)");
        const s_count = intwithcommas(msg.client.guilds.cache.array().length);
        const embed = new discord.MessageEmbed()
        .setAuthor(randomnoise(), msg.client.user.displayAvatarURL())
        .setTitle(`Invite me to your server! (Click here)`)
        .setURL(`https://discord.com/api/oauth2/authorize?client_id=${msg.client.user.id}&permissions=3468640&scope=bot`)
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