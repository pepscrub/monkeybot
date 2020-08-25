const ytdl = require('ytdl-core');
const discord = require('discord.js');
const errh = require('./helpers.js').err;
const { log, sendmessage} = require('./helpers.js')
const urlmetadata = require('url-metadata');
let dispatcher = '';

let videoqueue = new Array();

function intwithcommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function sendplaymessage(msg, info, queue)
{
    const metadata = info['videoDetails']
    console.log(metadata);
    const author = metadata['author']
    const tnl = metadata['thumbnail']['thumbnails'];
    const tn = tnl[tnl.length-1]['url'];
    const vc = intwithcommas(metadata['viewCount']);
    const lr = intwithcommas(metadata['likes'])
    const dlr = intwithcommas(metadata['dislikes'])

    const embed = new discord.MessageEmbed()
    .setAuthor(`${author['name']}`, author['avatar'])
    .setColor(process.env.BOT_COLOR)
    .setTitle(`${metadata['title']}`)
    .setURL(queue)
    .setDescription(`🔴 ${vc} 👍 ${lr} Likes 👎 ${dlr} Dislikes
     ${metadata['shortDescription'].substr(0, 125)}\u2026`)
    .setImage(tn)
    .setFooter(`${msg.author.username}#${msg.author.discriminator}`, msg.author.displayAvatarURL())
    .setTimestamp();
    msg.channel.send(embed);
}

module.exports.play = async (msg, args) =>
{
    // Play music and shit
    const play = async (connection, msg) =>
    {
        // arguments from message content
        try
        {
            // Test to see if our bot can even speak
            let queue = videoqueue[msg.guild.id][0];
            log(msg, `Getting ${queue}`)

            // Get video info from URL
            ytdl.getBasicInfo(queue)
            .then(res=>{sendplaymessage(msg, res, queue)})
            .catch(e=>console.log)

            const url_search = new URL(queue);                      // Convert url into url object
            const timer = new URLSearchParams(url_search.search);   // Grab the search queries (we can target later)
            let options = {filter : 'audioonly'};                   // Default options
            if(timer.get('t'))                                      // See if the timer in url is set to anything
            {
                const format = `${timer.get('t')}s`;                // Format so ytdl-core can read it (yes it accepts this)
                options = {filter : 'audio', begin: format};        // audioonly and videoonly do not work with 'begin' for some reason
            }

            const stream = ytdl(queue, options); // Play the first video in queue
            // No fucking clue what this code does besides play the audio
            log(msg, `Playing video`)
            dispatcher = connection.play(stream).catch(e=>console.log(e));

            videoqueue[msg.guild.id].shift();

            // on.('end') depreciated ?
            dispatcher.on('speaking', (e)=>                                 // Event for when the bot is speaking
            {                                                               // speaking is true so if we look for the
                if(!e)                                                      // instance it's not we can assume we've 'skipped'
                {
                    if(videoqueue[msg.guild.id][0]) play(connection, msg)
                    else {
                        log(msg, `Leaving voice chat`)
                        sendmessage(msg, `Leaving the voice chat`)
                        connection.disconnect();
                    }
                }
            })
        }catch(err)
        {
            errh(err, msg);
            videoqueue[msg.guild.id].shift();
            if(videoqueue.length === 0) 
            {
                connection.disconnect();
                msg.guild.me.voice.channel.leave();
            }
        }
    }
    // Makes the bot join the vc
    const joinvc = async (msg) =>
    {
        try
        {
            if(!msg.guild.voice.connection)
            {
                msg.member.voice.channel.join().then(connection=>
                {
                    sendmessage(msg, `Joining the voice chat`)
                    play(connection, msg);
                })
            }
        }catch(e)
        {
            msg.member.voice.channel.join().then(connection=>
            {
                sendmessage(msg, `Joining the voice chat`)
                play(connection, msg);
            })
        }
    }

    // Actual logic
    if(!args[0]) return await sendmessage(msg, `${msg.author.username} Where's the video?`);                                       //  If there's no link (args[0] is our actual first argument)
    if(!msg.member.voice.channel) return await sendmessage(msg, `${msg.author.username} You're not in a voice chat`);              //  Test to see if the user is in a channel or not
    if(!msg.member.guild.me.hasPermission(['SPEAK'])) return sendmessage(msg, 'Monkey can\'t speak! (Missing permissions');        //  Missing permissions
    if(videoqueue[msg.guild.id] == undefined) videoqueue[msg.guild.id] = [args[0]];         // Move this array crap into mongodb
    else videoqueue[msg.guild.id].push(args[0]);                                            // ditto

    joinvc(msg);    // Wow 1 line 
}

module.exports.disconnect = async (msg) =>
{
    log(msg, `Disconnecting from voice chat.`);
    if(!msg.member.voice.channel) return await sendmessage(msg, `${msg.author.username} You're not in a voice chat`);
    sendmessage(msg, `Leaving the voice chat`)
    msg.guild.me.voice.channel.leave();
}

module.exports.queue = async (msg) =>
{
    log(msg, `Got queue for this server.`)
    let garray = videoqueue[msg.guild.id];
    let guildqueue = garray == undefined || garray.length == 0 ? '.... \n\n\n\n It\'s as empty as your love life ... \n\n\n\n ...' : garray;
    let link = `https:\/\/cdn.discordapp.com\/icons\/${msg.guild.id}\/${msg.guild.icon}.webp?size=128`
    sendmessage(msg, guildqueue)
}

module.exports.skip = async (msg) =>
{
    log(msg, `Skipping video for this server.`)
    if(!msg.member.voice.channel) return await sendmessage(msg, `${msg.author.username} You're not in a voice chat`);
    sendmessage(msg, `${msg.author.username}#${msg.author.discriminator} skipped the video`)
    dispatcher.end();
}

module.exports.stop = async (msg) =>
{
    log(msg, `Stopping music for this server.`)
    if(!msg.member.voice.channel) return await sendmessage(msg, `${msg.author.username} You're not in a voice chat`);
    if(msg.guild.voice.connection)
    {
        for(let i = videoqueue[msg.guild.id].length -1; i >= 0; i--)
        {
            videoqueue[msg.guild.id].splice(i, 1);
        }
        sendmessage(msg, `You're stupid.`)
        msg.guild.me.voice.channel.leave()
        dispatcher.end();
    }
}