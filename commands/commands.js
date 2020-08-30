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
        .addFields(
            {name: "Monkey", value: "**\`monkey**, returns a image of a monkey"},
            {name: "Music/Video Bot", value:"**\`play** Play a youtube video\
            \n**\`queue** Servers queue\
            \n**\`skip** Skip the current video\
            \n**\`stop** Disconnect bot and remove all songs in queue\
            \n**\`disconnect** Disconnect the bot from the voice chat"},
            {name: "Adminusages", value: "**\`purge** Deletes up to 100 messages in the chat it's called. Args: amount to delete"}
        )
        .setColor(process.env.BOT_COLOR)
        .setFooter(`${msg.author.username}#${msg.author.discriminator}`, `${msg.author.avatarURL()}`)
        .setTimestamp()
        msg.channel.send(embed);
    }catch(e)
    {
        errh(e, msg);
    }
}