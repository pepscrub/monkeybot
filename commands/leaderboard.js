const { randomnoise, intwithcommas } = require('./helpers');
const ta = require('time-ago')
const {DB} = require('../index');
const discord = require('discord.js');
const errh = require('./helpers.js').err;
const {Worker, isMainedThread, parentPort} = require('worker_threads');

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

        const output = [];                                              // Empty array to plug our shit into
        array
        // Mapping out the server
        .map(server=>{
            // Flatenning all the users in the server
            // [users->user->userdata]
            return server['users'].flat();
        })
        .flat()
        .sort((a,b)=>                                                   // Sorting all the users from most to least
        {
            return b['commandusage'].length - a['commandusage'].length
        }).forEach(item=>                                               // Looping through all the results
        {
            let existing = output.filter((v,i)=>                        // Checking to see if the user has any duplicates (Multiple servers same user)
            {
                return v.name == item.name; // Yes this is supposed to be item
            })
            if(existing.length)
            {
                const existingIndex = output.indexOf(existing[0]);
                output[existingIndex].commandusage = output[existingIndex].commandusage.concat(item.commandusage);
            }
            else
            {
                output.push(item);  // If not indexed in our array we just push the result
            }
        })

        // Re-sort the list from server merging
        // from newest to oldest
        output.forEach(user=>{user['commandusage'].sort((a,b)=>{return a[1] - b[1];})});
        let count = output.length < 5 ? output.length : 5 // Limit the display to 5 (Yes we did all that and dumped a fuck ton of result)
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
            embed.setAuthor(array[0]['server']['name'], array[0]['server']['icon']);
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
