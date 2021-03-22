// Imports
const discord = require('discord.js');
const fetch = require('node-fetch');
const errh = require('../../global/helpers').err;
const { randomnoise, Perms, truncate, empty, sendmessage, checkurl} = require('../../global/helpers')
const { log } = require('../../global/helpers');
const { DB } = require('../index.js');
const { log_commands } = require('../db/logging.js');
const { enable } = require('colors');
const timer = 20000;        // Timer in ms

/**
 * Reaction emojis to add to a monkey result
 * @type {String[]}
 */
let reactions = null;
/**
 * Reaction colors and description
 * @type {String[][]}
 */
let colors = null;

let search_term = null;

// This is better than trying to connect
// to the database twice and waiting for the repsonse promise

const t = setInterval(async ()=>
{
    if(DB.connected())
    {
        const coll = await DB.tablequery("settings");
        if(!coll) return;
        const doc = await coll.toArray();

        colors = doc[0]['colors'];
        reactions = doc[0]['reactions'];
        search_term = doc[0]['search_terms'];
        clearInterval(t)
    }
},250)

/**
 * @description When we get a result from the Google Custom Search Engine API
 * we want to hold onto all the results until we use them up. For the time been
 * we're going to store them into this variable in memory since our usage is low.
 * Need to move this to a database in the future for scalablity reasons.
 * 
 * Reason for this is due to a 100 query limit when for searching. Hopefully querying
 * for 10 results should mean we have a limit of 1,000 images per API key
 */
let google_results = [];
/**
 * @description Incriment this variable when we reach the quota of an 
 * API key to move to another one
 * @type number
 */
let quote_reached = 0;

async function updateVote(msg, bool = false)
{
    try
    {
        const table = await DB.table('vote');
        const docs = await table.find({"s_id": msg.guild.id})
        const arr = await docs.toArray();
        const update = () =>
        {
            table.update(
                {"s_id": msg.guild.id},
                {"$set":{"vote": bool, "voting_enabled": arr[0]['voting_enabled']}}
            )
        }
    
        if(!docs) update();
    
        const server_vote = await table.findOneAndUpdate(
            {"s_id": msg.guild.id},
            {"$set":{"vote": bool, "voting_enabled": arr[0]['voting_enabled']}}
        );
    }catch(e)
    {
        errh(e, msg);
    }
}


/**
 * @description 'Endpoint' for our monkey image searcher sends a message for voting
 * and then sends a final message.
 * @async
 * @param {Object} msg 
 * @param {Promise<Object>} res
 * @fires Reaction_Result
 */
async function sendMessage(msg, res)
{
   try
   {
        const perms = new Perms(msg);
        const title = truncate(res['title'], 256);
        const table = await DB.table('vote');
        const index = await table.find({"s_id": msg.guild.id});
        const vote = await index.toArray();
        const enabled = vote[0]['voting_enabled'];
        const video = vote[0]['video']
        
        


        if(res['link'].includes('.gifv'))
        {
            const imgurcontent = await fetch(res['link']).then(res=>res.text())
            const regexurl = new RegExp(`${res['link'].substring(6, res['link'].length-5)}.*"`, 'gmi');
            const matches = imgurcontent.match(regexurl);
            const output = {title: res['title'], link: `https:${matches[6].replace('"','')}`}
            return sendMessage(msg, output)
        }

        if(google_results != undefined) google_results.shift();     // Delete an instance of google images in storage (dumb and stupid, is called when do reddit as well) 

        if(perms.del() && perms.react() && enabled) // Check to see if we have permissions to modify chat and add reactions
        {
            updateVote(msg, true);
            const expirey = timer/1000; // Timer in seconds
            vote[msg.guild.id] = true;  // Voting is in progress

            // Embed messiness
            const embed = new discord.MessageEmbed()
            .setColor(process.env.BOT_COLOR)
            .setAuthor(randomnoise(), msg.client.user.displayAvatarURL())
            .setTitle(title)
            .addField("Rankings",`\`\`\`swift\n${reactions[0]} | ★ Contraband\
            \n${reactions[1]} | Covert\
            \n${reactions[2]} | Classified\
            \n${reactions[3]} | Uncommon\
            \n${reactions[4]} | Common\
            \n${reactions[5]} | Delete\
            \`\`\``)
            .setImage(res['link'])
            .setFooter(`This vote will expire in ${expirey} seconds`);
            // Send message and wait for reactions
            msg.channel.send(embed).then(async e=>Reaction_Result(msg, e, res))
        }
        else
        {
            if((/(?:mp4)/.test(res['link'])))
            {
                if(video)
                {
                    const random = Math.floor(Math.random() * Object.keys(colors).length);
                    const key = Object.keys(colors)[random];
                    const ran_colour = colors[key][0]
                    const embed = new discord.MessageEmbed()
                    .setAuthor(randomnoise(), msg.client.user.displayAvatarURL())
                    .setColor(ran_colour)
                    .setTitle(title)
                    .setURL(res['link'])
                    .setDescription(`Please wait for the video to load`)
                    .setTimestamp();
                    msg.edit(embed)
                    msg.channel.send(``, {files: [res['link']]})
                }else{
                    const random = Math.floor(Math.random() * Object.keys(colors).length);
                    const key = Object.keys(colors)[random];
                    const ran_colour = colors[key][0]
                    const embed = new discord.MessageEmbed()
                    .setAuthor(randomnoise(), msg.client.user.displayAvatarURL())
                    .setColor(ran_colour)
                    .setTitle(title)
                    .setDescription(`Click the url to view the video or enable via \`video`)
                    .setURL(res['link'])
                    .setImage(res['link'].replace('.mp4', '.jpg'))
                    .setTimestamp();
                    msg.edit(embed)
                }
            }else{
                const random = Math.floor(Math.random() * Object.keys(colors).length);
                const key = Object.keys(colors)[random];
                const ran_colour = colors[key][0]
                const embed = new discord.MessageEmbed()
                .setAuthor(randomnoise(), msg.client.user.displayAvatarURL())
                .setColor(ran_colour)
                .setTitle(title)
                .setImage(res['link'])
                .setTimestamp();
                msg.edit(embed);
            }
        }
   }catch(e)
   {
    errh(`URL: ${res['link']}Imgur content: ${imgurcontent}\nRegex url: ${regexurl}\nMatches${matches}`, msg);
   }
}
/**
 * @description Add reactions ranking m
 * @async
 * @param {Object} msg 
 * @param {Promise<Object>} e Message sent by the bot for voting
 * @param {Promise<Array>} res List
 * @fires Reaction_Result
 */
async function Reaction_Result(msg, e, res)
{
    try
    {
        reactions.forEach(square=>{e.react(square)})                                                                    // Reacting with the voting squares 

        const filter = async (reaction, user) => reactions.includes(reaction.emoji.name) && user.id === msg.author.id;  // Some filtering shit?
        const result = await e.awaitReactions(filter, {time: timer})                                                    // Reactions from users
        updateVote(msg, false);
    
        let output = [], i = 0, users = [];                                                                                 // Settings up objects for next 
        result.forEach(t=>{output.push([t._emoji['name'], t.count, t.users]);i++;});                                        // Looping trhough the reactions and pushing the results into an array
        output.reverse();                       // Reverse results so we're going lowest rank to highest
        output.sort((a,b)=>{return b[1] - a[1]})// Sort by count
        if(output[0] === undefined) return e.delete() && log("No one voted :(");     // If no one votes
    
        output[0][2].cache.forEach(user=>{
            {
                if(!(user.bot))
                {
                    log_commands(msg, user);
                    users.push(`${user.username}`)
                }
            }})
        users = users.join(", ");
    
        e.delete().catch();                        // Delete the message sent for voting
        if(output[0][0] === '❌') return;         // If we didn't like the monkey we delete the message
        if(output[0][1] - 1 == 0) return;
    
        const table = await DB.table('monkey_rankings');
        const index = await table.find({"url": res['link']});
        const exist = await index.toArray();

        if(exist == null || empty(exist) || exist[0] == undefined)    // No doc in DB
        {
            await table.insertOne({
                "url": res['link'],
                "rank": [output[0][0]],
                "color": [colors[output[0][0]][0]],
                "users": [users],
            })
        }else{
            // TODO: Make this code less bad
            const rank = [];
            exist[0]['rank'].forEach(r=>
            {
                rank.push(r)
            })
            rank.push(output[0][0])
            const color = [];
            exist[0]['color'].forEach(colors=>
            {
                color.push(colors)
            })
            color.push(colors[output[0][0]][0])
            const user = [];
            user.push(exist[0]['users']);
            user.push(users);
            
            table.updateOne(  // Voting_enabled endpoint not set
            {"url": res['link']},
            {"$set":
                {
                    "rank": rank,
                    "color": color,
                    "users": users
                }
            }
            );
        }

        log(`Sending result`, msg)
    
        const title = truncate(res['title'], 256);
        const embed = new discord.MessageEmbed()                                  // Creating a new embed
        .setAuthor(randomnoise(), msg.client.user.displayAvatarURL())
        .setColor(colors[output[0][0]][0])
        .setTitle(title)
        .setImage(res['link'])
        .setFooter(`${empty(users) ? '' : `Votes from: ${users}`}`, checkurl(msg.author.avatarURL()))
        .setTimestamp();
        
        msg.edit(embed);
    }catch(e)
    {
        errh(e, msg);
    }
}

/**
 * Inappropriately called function. Actually just validates the URL of a list of strings
 * @param {*} msg 
 */
function getmonkey(msg)
{
    try
    {
        const perms = new Perms(msg)
        log(`Checking to see if it's an image`, msg)
        // If we really messed up badly we try it all over again.
        if(google_results == undefined || google_results.length == 0) return Math.round(Math.random()) ? monkeygoogle(msg) : monkeyreddit(msg);

        let imglink = google_results[0]['link'];
        // let linktest = !/(?:jpg|jpeg|gif|png|mp4)$/.test(imglink);
        let linktest = !/(?:mp4)$/.test(imglink);
        
        log(`Using random monkey in memory`, msg);

        /**
         * If the URL we are given is invalid loop recursively through this function 
         */
        if( !linktest && google_results.length > 0 && google_results[0] == undefined)
        {
            google_results.shift(); // Delete top result
            return getmonkey(msg);  // Loop function
        }
        sendMessage(msg, google_results[0]); // Send result
    }catch(e)
    {
        errh(e, msg);
    }
}

/**
 * @description Grabs a random monkey image from a number of subreddits.
 * @async
 * @param {*} msg Discord Message Manager
 */
async function monkeyreddit(msg)
{
    try
    {
        // VIDEO DEBUGGING
        // ---------------
        // const body = await fetch(`https://www.reddit.com/r/monkeypics.json?&limit=600`).then(res=>{return res.json()});
        // const rp = body['data']['children'].filter(post=>!post.data.over_18)[20]['data'];

        // const media =   rp['media'] === null ?  rp['url'] : 
        // rp['media']['fallback_url'] ? null : 
        // (rp['media']['type'] != undefined ? rp['media']['oembed']['thumbnail_url'] : null);

        // const formatted = {title: `Idek`, link: media}
        // return sendMessage(msg, formatted)


        const subreddits = ['monkeys','ape','MonkeyMemes','monkeypics', 'Monke']
        const random_sr = subreddits[Math.floor(Math.random() * subreddits.length)]                                                 // Random subreddit from list
        const body = await fetch(`https://www.reddit.com/r/${random_sr}.json?&limit=600`).then(async res=>
        {
            if(res.status != 200) return res.status;
            return res.json();
        })
        .catch(e=>
        {
            console.error(e);
            monkeygoogle(msg);  // Go to google searcher instead if reddit doesn't work
        });                    // Request reddit json list
        if(body === parseInt(body, 10) || body['data'] === undefined) return monkeygoogle(msg);
        log(`Fetching from reddit https://www.reddit.com/r/${random_sr}`, msg)

        const valid = body['data']['children'].filter(post=>!post.data.over_18);                                                    // Make sure the post is PG
        const rm = Math.floor(Math.random()*valid.length);
        const rp = valid[rm]['data'];                                                                                               // Grab random POST
    
        log(`Got post ${rm} out of ${valid.length}`, msg);
    
        const media =   rp['media'] === null ?  rp['url'] : 
        rp['media']['fallback_url'] ? null : 
        (rp['media']['type'] != undefined ? rp['media']['oembed']['thumbnail_url'] : null);
        const formatted = {'title': rp['title'], 'link': media}                                                            // Reformat into google data

        const embed = new discord.MessageEmbed()
        .setAuthor(randomnoise(), msg.client.user.displayAvatarURL())
        .setColor(process.env.BOT_COLOR)
        // Had to make this line longer for formatting reasons (would break indenting)
        .setTitle(`Fetching from https://www.reddit.com/r/${random_sr} ${(!/(?:jpg|jpeg|gif|png|mp4|gifv|gif)/.test(media) || !media) ? `Post is not an image` : `Valid post`}`)
        .setDescription(`Grabbing post ${rm} out of ${valid.length}` )
        .setTimestamp();

        msg.edit(embed);

        if(media === null) return monkeyreddit(msg);    // Does not work without this line????
        if(!(/(?:jpg|jpeg|gif|png|mp4|gifv|gif)/.test(media) || media == null)) return monkeyreddit(msg);
        else sendMessage(msg, formatted);   
    }catch(e)
    {
        errh(e, msg);
    }                                                      
}


/**
 * Grabs a random image of a monkey off the internet.
 * @param {*} msg 
 */
module.exports.monkey = async (msg) =>
{
    try
    {

        if(!msg.guild) return sendmessage(msg, "Couldn't get server object.");
        if(!msg.guild.id) return sendmessage(msg, "Couldn't get server ID.");
        
        const table = await DB.table('vote');
        const index = await table.find({"s_id": msg.guild.id});
        const vote = await index.toArray();

        if(index == null || empty(vote) || vote[0] == undefined)    // No doc in DB
        {
            await table.insertOne({"s_id": msg.guild.id, "vote": false, "voting_enabled": false})
            return this.monkey(msg)
        }
        if(vote[0]['voting_enabled'] == null) table.updateOne(  // Voting_enabled endpoint not set
            {"s_id": msg.guild.id},
            {"$set":{"vote": false, "voting_enabled": false}}
        );
        
        if(vote[0]['vote']) return; // If there's currently a vote in 
        log_commands(msg);
        // const random = Math.round(Math.random());
        const random = 0;
        log(`RNG Google or Reddit: ${random ? 'Google'.bold : 'Reddit'.bold}\n`, msg);


        const embed = new discord.MessageEmbed()                                  // Creating a new embed
        .setAuthor(randomnoise(), msg.client.user.displayAvatarURL())
        .setColor(process.env.BOT_COLOR)
        .setTitle("Getting image")
        .setDescription(`:coin: RNG between google and reddit: ${random ? "**Google**" : "**Reddit**"}`)
        .setFooter(`${msg.author.username}#${msg.author.discriminator}`, checkurl(msg.author.avatarURL()))
        .setTimestamp();


        const newmsg = await msg.channel.send(embed);



        random ? monkeygoogle(newmsg) : monkeyreddit(newmsg);        
    }catch(e)
    {
        errh(e, msg);
    }
}

/**
 * @description Grabs a random monkey image off Google Images using Custom Search Json API
 * @async
 * @param {*} msg Discord Message Manager
 */
async function monkeygoogle(msg)
{
    try
    {
        // Huge god damn array
        const token = quote_reached ? process.env.SEARCH_KEY_SECOND : process.env.SEARCH_KEY;
        const randomstart = Math.floor(Math.random()*100);              // Random index start 
        let monkeyvers = Math.floor(Math.random()*search_term.length);   // Random index out of 10 (Max items is 10)
        const searchengine = process.env.SEARCH_ENGINE;                 // Search engine to use (enable global search in control panel)
        let monkey = `monkey ${search_term[monkeyvers]}`;                // Updating search query
        // God damn that's a long url
        const url = `https://www.googleapis.com/customsearch/v1?key=${token}&cx=${searchengine}&q=${monkey}&searchType=image&start=${randomstart}`;

        if(google_results == undefined || google_results.length > 0) return getmonkey(msg);

        const embed = new discord.MessageEmbed()
        .setTitle("Searching google for")
        .setDescription(`***${monkey}***`)
        .setColor(process.env.BOT_COLOR)
        .setFooter(`${msg.author.username}#${msg.author.discriminator}`, checkurl(msg.author.avatarURL()))
        .setTimestamp()

        msg.edit(embed);

        log(`Fetching using key: ${quote_reached} and searching ${monkey}`, msg)
        fetch(url)                                                                  // Fetch API
        .then(res=>{return res.json()})
        .then((res)=>
        {
            log(`Got a result from fetch`, msg)
            if(res['error'])
            {
                switch(res['error']['code'])
                {
                    case 429:   // Quota exhausted
                        try
                        {
                            log(`Quota maxed out on key number: ${quote_reached}`, msg)
                            quote_reached++;
                            if(quote_reached >= 2) return monkeyreddit(msg);
                            else return monkeyreddit(msg);
                        }catch(e)
                        {
                            errh(e, msg);
                            sendmessage(msg, `This error was most likely occured due to our API limit been exhausted.`);
                        }
                    break;
                    default: console.log(res['error']);
                }
            }
            google_results = res['items'];      // Append into memory - yuck
            getmonkey(msg);                     // Test images
        })
        .catch(e=>{
            errh(e, msg);
        });
    }catch(e)
    {
        errh(e, msg);
    }
}