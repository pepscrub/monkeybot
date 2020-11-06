'use strict';
const errh = require('./helpers.js').err;
const { DB } = require('../index.js');


module.exports.st = async (msg, args) =>
{
    const m_id = args[0];
    const suggestion = await msg.channel.messages.fetch(m_id)

    const author = suggestion.embeds[0].author.name;
    const desc = suggestion.embeds[0].description;

    args.shift();
    const response = args.join(' ');

    const embed = new discord.MessageEmbed()
    .setColor(process.env.BOT_COLOR)
    .setTitle(`${msg.author.username} has replied to your suggestion`)
    .setDescription(`
    > ${desc}
    \`\`\`swift\n${response}\`\`\``)
    .setFooter(`${msg.author.username}#${msg.author.discriminator} | ${msg.author.id == 507793672209825792 ? 'Lead Developer' : ''}`, checkurl(msg.author.avatarURL()))
    const user = await msg.client.users.fetch(author);

    log(`Replying to user ${user.username}#${user.discriminator} on: ${desc}`)

    user.send(embed);
    sendmessage(user, response);
}