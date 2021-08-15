const { randomnoise, intwithcommas } = require('../../global/helpers');
const ta = require('time-ago')
const {DB} = require('../index');
const discord = require('discord.js');
const errh = require('../../global/helpers').err;

/**
 * @description Gets the logged amount of commands from each server
 * and prints out the result into a embed.
 * - Limitation 5 top servers (6000char limit so steering clear of that)
 * - Current implementation is very memory inefficient (Slow and shit)
 * @param {DiscordMessageManager} msg 
 * @param {String[]} args 
 * @returns void
 */
module.exports.leaderboard = async (msg, args) =>
{
    try
    {
        let options = {};                                               // Empty object for us to manipulate
        if(args[0] === 'server') options = {"server.id": msg.guild.id}  // Udating to search for the server this was called from
        const table = await DB.tablequery('commands', options);         // Querying BD
        const array = await table.toArray();                            // Returning results
        const server_count = await table.count();
        const output = [];
        array
        // Mapping out the server
        .map(server=>{
            // Flatenning all the users in the server
            // [(0)users->(0)user->(0...5)userdata]
            // [(1)users->(0)user->(0...999)userdata]
            // Into
            // [(0)user->(0...5)userdata]
            // [(1)user->(0...999)userdata]
            return server['users'].flat();
        })
        .flat()
        // Merging any duplicates (Same user different server)
        .map(item=>
        {
            let existing = array.filter((v,i)=>
            {
                return v.name == item.name;
            })
            if(existing.length)
            {
                const existingIndex = array.indexOf(existing[0]);
                array[existingIndex].commandusage = array[existingIndex].commandusage.concat(item.commandusage);
            }else{
                output.push(item);
            }
        })
        output.sort((a,b)=>{return b['commandusage'].length - a['commandusage'].length})

        // Todo: Add argv with a max of 25 instead of 5
        let count = output.length < 5 ? output.length : 5;
        const top = output[0];
        const top_date = ta.ago(top['commandusage'][top['commandusage'].length-1][1]);

        const embed = new discord.MessageEmbed()
        .setColor(process.env.BOT_COLOR)
        .setTitle(`1. 🎉${top['name']}🎉`)
        .setURL(top['pfp'])
        .setDescription(`\`\`\`swift\nCalled: ${intwithcommas(top['commandusage'].length)} times. \
        \nLast command: ${top_date}\
        \`\`\``)
        .setThumbnail(top['pfp'])
        .setTimestamp();
    
        if(args[0] === "server")
        {
            if(output[0]['server'] !== undefined)
            {
                embed.setAuthor(output[0]['server']['name'], output[0]['server']['icon']);
            }else{
                embed.setAuthor(`Couldn't read server info`);
            }
        }
        else
        {
            embed.setAuthor(`Top ${count} out of ${server_count} servers.`);
        }

        for(let i = 1; i < count; i++)
        {
    
            embed.addField(`${i+1}. ${output[i]['name']}`, 
            `\`\`\`swift\nCalled: ${intwithcommas(output[i]['commandusage'].length)} times.\
            \nLast command: ${ta.ago(output[i]['commandusage'][output[i]['commandusage'].length-1][1])}\
            \`\`\``)
        }
    
        msg.channel.send(embed);
    }catch(e)
    {
        errh(e, msg);
    }
}
