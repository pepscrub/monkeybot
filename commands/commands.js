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
        .setDescription(`\`\`\`swift\nCommands\
        \n🐒 | \`monkey (searches randomly for pictures of monkeys\
        \n🎧 | \`play Plays youtube or soundcloud link\
        \n🎧 | \`skip Skips the current song\
        \n🎧 | \`queue Lists all songs/videos in queue\
        \n🎧 | \`stop Removes all songs in queue and leaves voice chat\
        \n🎧 | \`disconnect Disconnects from the voice chat\
        \n🏆 | \`leaderboard (server | none)\
        \n🔑 | \`delete Deletes up to 99 messages in chat (admin only)\`\`\``)
        .setColor(process.env.BOT_COLOR)
        .setFooter(`${msg.author.username}#${msg.author.discriminator}`, `${msg.author.avatarURL()}`)
        .setTimestamp()
        msg.channel.send(embed);
    }catch(e)
    {
        errh(e, msg);
    }
}