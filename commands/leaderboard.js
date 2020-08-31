const { randomnoise, intwithcommas } = require('./helpers')
const {DB} = require('../index');
const discord = require('discord.js');

module.exports.leaderboard = async (msg) =>
{
    const table = await DB.tablequery('commands');
    const array = await table.toArray();
    const output = [];
    const topusers = array
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
    }).forEach(item=>
    {
        let existing = output.filter((v,i)=>
        {
            return v.name == item.name;
        })
        if(existing.length)
        {
            const existingIndex = output.indexOf(existing[0]);
            output[existingIndex].commandusage = output[existingIndex].commandusage.concat(item.commandusage);
        }
        else
        {
            output.push(item);
        }
    })
    output.forEach(user=>{
        user['commandusage'].sort((a,b)=>
        {
            return a[1] - b[1];
        })
    })
    const top = output[0]
    const embed = new discord.MessageEmbed()
    .setColor(process.env.BOT_COLOR)
    .setTitle(`1. ${top['name']}`)
    .setURL(top['pfp'])
    .setDescription(`\`\`\`swift\nCalled: ${intwithcommas(top['commandusage'].length)} times. \nLast command: \`${(top['commandusage'][top['commandusage'].length-1][0]).replace('`','')}\`\`\``)
    .setThumbnail(top['pfp'])
    .setTimestamp();

    let test = output.length < 5 ? output.length : 5
    for(let i = 1; i < test; i++)
    {
        embed.addField(`${i+1}. ${output[i]['name']}`, `\`\`\`swift\nCalled: ${intwithcommas(output[i]['commandusage'].length)} times.\nLast command: \`${output[i]['commandusage'][output[i]['commandusage'].length-1][0].replace('`','')}\`\`\``)
    }

    msg.channel.send(embed);



}