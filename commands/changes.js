const fetch = require('node-fetch');
const errh = require('./helpers.js').err;
const ta = require('time-ago')
const {checkurl} = require('./helpers.js');
const discord = require('discord.js');

module.exports.changes = async (msg) =>
{
    try
    {
        const token = process.env.GIT_TOKEN || "your git token";                                                    // Github username
        const headers ={"Authorization": `token ${token}`};                                                         // Header authorization
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

        const message = commitsarr['commit']['message'];

        const user = commitsarr['committer'];                                           // Person who last commited
        const stats = commitsarr['stats'];                                              // Stuff like stats, date and comitter will be static 
        const changes = message == undefined ? 'Couldn\'t read last commit' : message; // Message can be defined in commit or not (so we check)
        const date = commitsarr['commit']['author']['date'];
        const date_formated = `📅 ${new Date(date).toLocaleDateString()}`;
        // Null checking stats
        const stats_formatted = stats != null || stats != undefined ? `\n\n📈 Stats\
        \nAdditions: ${stats['additions']}\
        \nDeletions: ${stats['deletions']}`: '';
    
        const embed = new discord.MessageEmbed()
        .setColor(process.env.BOT_COLOR)
        .setAuthor(user['login'], user['avatar_url'])
        .setDescription(`\`\`\`swift\n${date_formated} (${ta.ago(date_formated)})\ 
        \n📜 ${ta.mintoread(changes)}\
        \n🚧 Commits (${total_commits} total)\
        \n${changes}\
        \n${stats_formatted}\
        \`\`\``)
        .setTimestamp()
        .setFooter(`${msg.author.username}#${msg.author.discriminator}`, checkurl(msg.author.avatarURL()));
        msg.channel.send(embed);
    }catch(e)
    {
        errh(e, msg);
    }
}