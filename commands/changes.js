const fetch = require('node-fetch');
const errh = require('./helpers.js').err;
const discord = require('discord.js');

module.exports.changes = async (msg) =>
{
    try
    {
        const username = process.env.GIT_UNAME || "your username here";                                             // Github username
        const password = process.env.GIT_PASSWORD || "your password here";                                          // Github password
        const headers ={"Authorization": `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`};     // Header authorization
        const url = `https://api.github.com/repos/pepscrub/monkeybot/commits/master`;                               // RESTAPI for github (returns last commit)
        const options = {"method": "GET", "headers": headers};                                                      // Options for fetch
        const commits = await fetch(url, options);   
        const commitsarr = await commits.json();
    
        const all = await fetch(`https://api.github.com/repos/pepscrub/monkeybot/stats/commit_activity`, options)
        const all_arr = await all.json();

        let total_commits = 0;

        for(let i = 0; i < all_arr.length; i++)
        {
            total_commits += all_arr[i]['total'];
        }

        const user = commitsarr['committer'];                                   // Person who last commited
        const stats = commitsarr['stats'];
        const changes = commitsarr['commit']['message'];
        const date = commitsarr['commit']['author']['date'];
        const date_formated = `📅 ${new Date(date).toLocaleDateString()}`;
        // Null checking stats
        const stats_formatted = stats != null || stats != undefined ? `\n\n📈 Stats\
        \nAdditions: ${stats['additions']}\
        \nDeletions: ${stats['deletions']}`: '';
    
        
    
        const embed = new discord.MessageEmbed()
        .setColor(process.env.BOT_COLOR)
        .setAuthor(user['login'], user['avatar_url'])
        .setDescription(`\`\`\`swift\n${date_formated}\ 
        \n🚧 ${total_commits}\
        \n${changes}\
        ${stats_formatted}\
        \`\`\``)
        .setTimestamp()
        .setFooter(`${msg.author.username}#${msg.author.discriminator}`, `${msg.author.avatarURL()}`);
        msg.channel.send(embed);
    }catch(e)
    {
        errh(e, msg);
    }
}