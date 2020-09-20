// Imports
const discord = require('discord.js');
const fetch = require('node-fetch');
const errh = require('./helpers.js').err;
const { log, randomnoise, Perms, truncate, empty, sendmessage} = require('./helpers.js')
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

// This is better than trying to connect
// to the database twice and waiting for the repsonse promise

const t = setInterval(async ()=>
{
    if(DB.connected())
    {
        const coll = await DB.tablequery("settings");
        if(!coll) return;
        coll.forEach(doc=>{
            colors = doc['colors']
            reactions = doc['reactions']
        })
        clearInterval(t)
    }
},250)

// --------------------
// Modifiable globals

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
/**
 * @type boolean[]
 * @example vote[server.id] = True|False
 */
let vote = [];


async function updateVote(msg, bool = false)
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
    const perms = new Perms(msg);
    const title = truncate(res['title'], 256);
    const table = await DB.table('vote');
    const index = await table.find({"s_id": msg.guild.id});
    const vote = await index.toArray();
    const enabled = vote[0]['voting_enabled'];

    if(perms.del() && perms.react() && enabled) // Check to see if we have permissions to modify chat and add reactions
    {

        updateVote(msg, true);

        const expirey = timer/1000; // Timer in seconds
        google_results.shift();     // Delete an instance of google images in storage (dumb and stupid, is called when do reddit as well) 
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
        google_results.shift();     // Delete an instance of google images in storage (dumb and stupid, is called when do reddit as well) 
        const random = Math.floor(Math.random() * Object.keys(colors).length);
        const key = Object.keys(colors)[random];
        const ran_colour = colors[key][0]

        const embed = new discord.MessageEmbed()
        .setAuthor(randomnoise(), msg.client.user.displayAvatarURL())
        .setColor(ran_colour)
        .setTitle(title)
        .setDescription(`\`voting to enable voting.`)
        .setImage(res['link'])
        .setFooter(`${msg.author.username}#${msg.author.discriminator}`, `${msg.author.avatarURL()}`)
        .setTimestamp();
        msg.channel.send(embed);
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
            if(!(msg.author.id == user.id || user.bot))
            {
                log_commands(msg, user);
                users.push(`${user.username}`)
            }
        }})
    users = users.join(", ");

    e.delete().catch();                        // Delete the message sent for voting
    if(output[0][0] === '❌') return;         // If we didn't like the monkey we delete the message
    if(output[0][1] - 1 == 0) return;

    log(`Sending result`, msg)

    const title = truncate(res['title'], 256);
    const embed = new discord.MessageEmbed()                                  // Creating a new embed
    .setAuthor(randomnoise(), msg.client.user.displayAvatarURL())
    .setColor(colors[output[0][0]][0])
    .setTitle(title)
    .setImage(res['link'])
    .setFooter(`${msg.author.username}#${msg.author.discriminator}${empty(users) ? '' : `, votes from: ${users}`}`, `${msg.author.avatarURL()}`)
    .setTimestamp();
    
    msg.channel.send(embed)
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
        if(google_results.length == 0) return Math.round(Math.random()) ? monkeygoogle(msg) : monkeyreddit(msg);

        let imglink = google_results[0]['link'];
        let linktest = !/(?:jpg|jpeg|gif|png)$/.test(imglink);
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
        // fuck it
    }
}

/**
 * @description Grabs a random monkey image from a number of subreddits.
 * @async
 * @param {*} msg Discord Message Manager
 */
async function monkeyreddit(msg)
{
    const subreddits = ['monkeys','ape','MonkeyMemes','monkeypics']                                                             // Subreddits
    const random_sr = subreddits[Math.floor(Math.random() * subreddits.length)]                                                 // Random subreddit from list
    const body = await fetch(`https://www.reddit.com/r/${random_sr}.json?&limit=600`).then(res=>res.json());                    // Request reddit json list
    log(`Fetching from reddit https://www.reddit.com/r/${random_sr}`, msg)

    const valid = body['data']['children'].filter(post=>!post.data.over_18);                                                    // Make sure the post is PG
    const rm = Math.floor(Math.random()*valid.length);
    const rp = valid[rm]['data'];                                                                                               // Grab random POST

    log(`Got post ${rm} out of ${valid.length}`, msg);

    const media =   rp['media'] === null ?  rp['url'] : 
                    (/mp4|gifv/.test(rp['media']['fallback_url']) ? null : 
                    (rp['media']['type'] != undefined ? rp['media']['oembed']['thumbnail_url'] : null));
    const formatted = {'title': rp['title'], 'link': media}                                                            // Reformat into google data
    if(!/(?:jpg|jpeg|gif|png)/.test(media) || /mp4|gifv/.test(media) || !media) return monkeyreddit(msg);
    else sendMessage(msg, formatted);                                                                                    
}

/**
 * @description Grabs a random monkey image off Google Images using Custom Search Json API
 * @async
 * @param {*} msg Discord Message Manager
 */
async function monkeygoogle(msg)
{
    // Huge god damn array
    const monkeytype = [
            '', '', 
            'silly', 
            'stupid', 
            'funny', 
            'laughing', 
            'banana', 
            'hehe haha', 
            'kung fu panda', 
            'youtube', 
            'halo', 
            'minecraft', 
            'epic',
            'tf2',
            'harambe',
            'kong',
            'cool',
            'epic',
            'gay',
            'bush',
            'reddit',
            'cursed'
    ];
    const token = quote_reached ? process.env.SEARCH_KEY_SECOND : process.env.SEARCH_KEY;
    const randomstart = Math.floor(Math.random()*100);              // Random index start 
    let monkeyvers = Math.floor(Math.random()*monkeytype.length);   // Random index out of 10 (Max items is 10)
    const searchengine = process.env.SEARCH_ENGINE;                 // Search engine to use (enable global search in control panel)
    let monkey = `monkey ${monkeytype[monkeyvers]}`;                // Updating search query
    // God damn that's a long url
    const url = `https://www.googleapis.com/customsearch/v1?key=${token}&cx=${searchengine}&q=${monkey}&searchType=image&start=${randomstart}`;

    if(google_results.length > 0) return getmonkey(msg);                        // No results? We recall this function
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
                    log(`Quota maxed out on key number: ${quote_reached}`, msg)
                    const d = new Date();                                                           // Creating new date to get PT time off of
                    const PT = d.toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles' });  // Getting PT time (string)
                    let time = PT.split(':');                                                       // Splitting on :
                    let hours = time[2].includes('PM') ? 12 - time[0] : 24 - time[0];               // Since we're on 12 hour time format we check to see if it's PM and - a different value
                    let mins = 60 - time[1];                                                        // Just get the amount of minutes
                    mins == 0 ? '' : hours = hours - 1;
                    quote_reached++;
                    if(quote_reached >= 2) return monkeyreddit(msg);
                    else return this.monkey(msg);
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
        const random = Math.round(Math.random());
        log(`RNG Google or Reddit: ${random ? 'Google'.bold : 'Reddit'.bold}\n`, msg)
        random ? monkeygoogle(msg) : monkeyreddit(msg);        
    }catch(e)
    {
        console.log(e);
        errh(e, msg)
    }
}