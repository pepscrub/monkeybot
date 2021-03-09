const { randomnoise, intwithcommas, sendmessage, empty, checkurl } = require('../../global/helpers');
const ta = require('time-ago')
const {DB} = require('../index');
const discord = require('discord.js');
const errh = require('../../global/helpers').err;


module.exports.mcount = async (msg) =>
{
    const table = await DB.tablequery('monkey_rankings', {});  // Querying BD
    const array = await table.toArray();                            // Returning results
    const count = await table.count();

    const ranInt = Math.round(Math.random() * count) + 1;
    const ranmonk = array[ranInt];

    const vuser = ranmonk['users'];

    const embed = new discord.MessageEmbed()                                  // Creating a new embed
    .setAuthor(randomnoise(), msg.client.user.displayAvatarURL())
    .setTitle(`Monkeys Collected (${count})`)
    .setDescription(`Rank given: ${ranmonk['rank']}`)
    .setImage(array[ranInt]['url'])
    .setFooter(`${vuser}`, checkurl(msg.author.avatarURL()))
    .setTimestamp();

    msg.channel.send(embed);
}