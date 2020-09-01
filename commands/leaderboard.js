const { randomnoise, intwithcommas } = require('./helpers')
const {DB} = require('../index');
const discord = require('discord.js');

module.exports.leaderboard = async (msg, args) =>
{
    let options = {};
    if(args[0] === 'server') options = {"server.id": msg.guild.id}
    const table = await DB.tablequery('commands', options);
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
    let count = output.length < 5 ? output.length : 5
    const top = output[0]
    const embed = new discord.MessageEmbed()
    .setColor(process.env.BOT_COLOR)
    .setTitle(`1. 🎉${top['name']}🎉`)
    .setURL(top['pfp'])
    .setDescription(`\`\`\`swift\nCalled: ${intwithcommas(top['commandusage'].length)} times. \
    \nLast command: ${new Date(top['commandusage'][top['commandusage'].length-1][1]).toLocaleString()}\
    \`\`\``)
    .setThumbnail(top['pfp'])
    .setTimestamp();

    if(args[0] === "server")
    {
        embed.setAuthor(array[0]['server']['name'], array[0]['server']['icon']);
    }
    else
    {
        embed.setAuthor(`Top ${count} of all servers`);
    }

    for(let i = 1; i < count; i++)
    {

        embed.addField(`${i+1}. ${output[i]['name']}`, 
        `\`\`\`swift\nCalled: ${intwithcommas(output[i]['commandusage'].length)} times.\
        \nLast command: ${new Date(output[i]['commandusage'][output[i]['commandusage'].length-1][1]).toLocaleString()}\
        \`\`\``)
    }

    msg.channel.send(embed);



}