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
        log(msg, `Logging commands`);
        // Can't use sendmessage since it's infelxiable when it comes to more complex messages
        const embed = new discord.MessageEmbed()
        .setAuthor(randomnoise(), msg.client.user.displayAvatarURL())
        .addFields(
            {name: "Monkey", value: "Returns a picture of a monkey", inline: false},
            {name: "Play", value: "Play youtube video (audio only)", inline: false},
            {name: "Queue", value: "See the current queue", inline: false},
            {name: "Skip", value: "Skip the current song / video", inline: false},
            {name: "Stop", value: "Stops all the videos in queue", inline: false},
            {name: "Disconnect", value: "Makes the bot leave the voice channel", inline: false},
            {name: "Purge", value: "Deletes up to 100 messages in the chat it's called. Args: amount to delete", inline: false}
        )
        .setColor(process.env.BOT_COLOR)
        .setFooter(`${msg.author.username}#${msg.author.discriminator}`, `${msg.author.avatarURL()}`)
        msg.channel.send(embed);
    }catch(e)
    {
        errh(e, msg);
    }
}