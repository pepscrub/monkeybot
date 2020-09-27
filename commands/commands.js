const discord = require('discord.js');
const errh = require('./helpers.js').err;
const { randomnoise, log } = require('./helpers.js');

/**
 * @description Sends a message of all the commands the bot responds too.
 * @param {*} msg 
 */
module.exports.bcommand = async (msg) =>
{
    try
    {
        log(`Logging commands`, msg);
        // Can't use sendmessage since it's infelxiable when it comes to more complex messages
        const embed = new discord.MessageEmbed()
        .setAuthor(randomnoise(), msg.client.user.displayAvatarURL())
        .addField(`Monkey commands`, `\`\`\`swift\n
        \n🐒 | \`monkey searches randomly for pictures of monkeys\
        \n🗳️ | \`vote (on or off) toggles voting message off.\`\`\``, false)
        .addField(`Music commands`, `\`\`\`swift\n
        \n🎧 | \`play Plays youtube or soundcloud link\
        \n🎧 | \`skip Skips the current song\
        \n🎧 | \`queue Lists all songs/videos in queue\
        \n🎧 | \`stop Removes all songs in queue and leaves voice chat\
        \n🎧 | \`disconnect Disconnects from the voice chat\`\`\``, false)
        .addField(`Utility commands`, `\`\`\`swift\n
        \n🏆 | \`leaderboard (server | none)\
        \n📚 | \`changes See the last update to the bot\
        \n📝 | \`report | report a bug to the developer\
        \n🔑 | \`delete Deletes up to 99 messages in chat (admin only)\`\`\``, false)
        .setColor(process.env.BOT_COLOR)
        .setFooter(`${msg.author.username}#${msg.author.discriminator}`, `${msg.author.avatarURL()}`)
        .setTimestamp()
        msg.channel.send(embed);
    }catch(e)
    {
        errh(e, msg);
    }
}