const {DB} = require('../index');
const discord = require('discord.js');

module.exports.leaderboard = async (msg) =>
{
    const table = await DB.tablequery('commands');
    const array = await table.toArray();
    const topuser = array
    .map(server=>{
        return server['users'].map((arr)=>{return arr[0]})
    })
    .reduce((pre, cur)=>
    {
        return pre.concat(cur);
    })
    .sort((a,b)=>
    {
        return b['commandusage'].length - a['commandusage'].length
    })

    const embed = new discord.MessageEmbed()
    .setColor(process.env.BOT_COLOR)
    .setAuthor(randomnoise(), msg.client.user.displayAvatarURL())
    .setTitle(res['title'])
    .addField("Rankings",`${reactions[0]} ★ Contraband\n${reactions[1]} Covert\n${reactions[2]} Classified\n${reactions[3]} Uncommon\n${reactions[4]} Common\n${reactions[5]} Delete`)
    .setURL(res['link'])
    .setImage(res['link'])
    .setFooter(`This vote will expire in ${expirey} seconds`);



}