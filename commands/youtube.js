const ytdl = require('ytdl-core');
const discord = require('discord.js');
const errh = require('./helpers.js').err;
const { log, sendmessage, randomnoise, Perms} = require('./helpers.js')
const urlmetadata = require('url-metadata');
let dispatcher = '';

let videoqueue = new Array();

function intwithcommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

async function sendplaymessage(msg, info, queue)
{
    const metadata = info['videoDetails']

    // console.log(metadata['media']);

    const author = metadata['author']
    const tnl = metadata['thumbnail']['thumbnails'];
    const tn = tnl[tnl.length-1]['url'];
    const vc = metadata['viewCount'] == null ? 'none' : intwithcommas(metadata['viewCount']);
    const lr = metadata['likes'] == null ? 'none' : intwithcommas(metadata['likes']);
    const dlr = metadata['dislikes'] == null ? 'none' : intwithcommas(metadata['dislikes']);
    const url_search = new URL(queue);
    const search = new URLSearchParams(url_search.searchParams).get('t')

    const views =  `👀 ${vc} views`;
    const dashes = `▬▬▬▬▬▬▬▬▬▬▬`;       // Embeds are a fixed length (was doing this based off views length but it newlined)
    const likes = `👍 ${lr} Likes`;
    const dislikes = `👎 ${dlr} Dislikes`;
    const shortdesc = `${metadata['shortDescription'].substr(0, 125)}\u2026`;

    const embed = new discord.MessageEmbed()
    .setAuthor(`${author['name']}`, author['avatar'])
    .setColor(process.env.BOT_COLOR)
    .setTitle(`${metadata['title']}`)
    .setURL(queue)
    .addFields(
        {name: views, value: dashes, inline: true},
        {name: likes, value: dislikes, inline: true},
        {name: `Description`, value: shortdesc}
    )
    .setImage(tn)
    .setFooter(`${msg.author.username}#${msg.author.discriminator}`, msg.author.displayAvatarURL())
    .setTimestamp();

    if(search)
    {
        const timestamp = new Date(search.replace(/[a-z]/gi, '') * 1000).toISOString().substr(11, 8);   // Dont think there's a cleaner way to do this
        const arr = timestamp.split(':').map(x=>+x);            // Split 01:01:01 --> [01,01,01] map removes the leading 0s --> [1,1,1]
        const hours = arr[0] <= 0 ? `` :  `${arr[0]}hours`;     // Formatting hours, check to see if hours are appliciable
        const mins = arr[1] <= 0 ? `` :  `${arr[1]}mins`;      
        const secs = arr[2] <= 0 ? `` :  `${arr[2]}secs`;
        const formatted = `${hours} ${mins} ${secs}`
        embed.addField('🕒 Started at', formatted);
    }

    if(metadata['media'])
    {
        switch(metadata['media']['category'])
        {
            case 'Music':
                const url_search = new URL(queue);
                const search = new URLSearchParams(url_search.searchParams).get('t')
                if(search)
                {
                    embed.setDescription(`Music is unrealiable for sharing with a start time`)
                }
            break;
            case 'Gaming':
                const arr = metadata['media']['thumbnails'];
                const img = `https:${arr[arr.length-1]['url']}`;
                embed.setThumbnail(img)
            break;
        }

    }

    msg.channel.send(embed);
    // Getting all the data for the message is the thing that'll take the longest
    // so we delete the message after the play event occurs
    if(new Perms(msg).del()) msg.delete(); // House cleaning
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
            log(`Getting ${queue}`, msg)

            // Get video info from URL
            ytdl.getBasicInfo(queue)
            .then(res=>{sendplaymessage(msg, res, queue)})
            .catch(e=>console.log(e))

            const url_search = new URL(queue);                      // Convert url into url object
            const timer = new URLSearchParams(url_search.search);   // Grab the search queries (we can target later)
            let options = {filter : 'audioonly'};                   // Default options
            if(timer.get('t'))                                      // See if the timer in url is set to anything
            {
                const time = timer.get('t').replace(/[a-zA-Z]/, '');
                const format = new Date(time * 1000).toISOString().substr(11, 8);
                options = {filter : 'audio', begin: format};        // audioonly and videoonly do not work with 'begin' for some reason
            }

            const stream = ytdl(queue, options); // Play the first video in queue
            // No fucking clue what this code does besides play the audio
            log(`Playing video`, msg)
            dispatcher = connection.play(stream);

            videoqueue[msg.guild.id].shift();

            // on.('end') depreciated ?
            dispatcher.on('speaking', (e)=>                                 // Event for when the bot is speaking
            {                                                               // speaking is true so if we look for the
                if(!e)                                                      // instance it's not we can assume we've 'skipped'
                {
                    if(videoqueue[msg.guild.id][0]) play(connection, msg)
                    else {
                        log(`Leaving voice chat`, msg)
                        sendmessage(msg, `Leaving the voice chat`)
                        connection.disconnect();
                    }
                }
            })
        }catch(err)
        {
            console.log(err);
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
    log(`Disconnecting from voice chat.`, msg);
    if(!msg.member.voice.channel) return await sendmessage(msg, `${msg.author.username} You're not in a voice chat`);
    sendmessage(msg, `Leaving the voice chat`)
    msg.guild.me.voice.channel.leave();
    if(new Perms(msg).del()) msg.delete(); // House cleaning
}

module.exports.queue = async (msg) =>
{
    let music_arr = videoqueue[msg.guild.id];
    let guildqueue = music_arr === undefined ? '.... \n\n\n\n It\'s as empty as your love life ... \n\n\n\n ...' : Array();
    let data = null;
    log(`Got queue for this server.`, msg)
    if(music_arr !== undefined && music_arr.length <= 0)
    {
        const garray = [].concat(music_arr).toString().replace(/\,/gi, '\n');
        guildqueue = garray == undefined || garray.length == 0 ? '.... \n\n\n\n It\'s as empty as your love life ... \n\n\n\n ...' : garray;
        data = await urlmetadata(music_arr[0])   
    }

    const embed = new discord.MessageEmbed()
    .setAuthor(randomnoise(), msg.client.user.displayAvatarURL())
    .setColor(process.env.BOT_COLOR)
    .setTimestamp()
    .setFooter(`${msg.author.username}#${msg.author.discriminator}`, `${msg.author.avatarURL()}`);

    if(data)
    {
        const title = `Up next: ${data['title']}`.substr(0, 125)
        embed.setTitle(title);
        embed.setThumbnail(data['image'])
    }
    embed.addField(`Queue`,`${guildqueue}`)
    msg.channel.send(embed);
    if(new Perms(msg).del()) msg.delete(); // House cleaning
}

module.exports.skip = async (msg) =>
{
    log(`Skipping video for this server.`, msg)
    if(!msg.member.voice.channel) return await sendmessage(msg, `${msg.author.username} You're not in a voice chat`);
    sendmessage(msg, `${msg.author.username}#${msg.author.discriminator} skipped the video`)
    dispatcher.end();
    if(new Perms(msg).del()) msg.delete(); // House cleaning
}

module.exports.stop = async (msg) =>
{
    log(`Stopping music for this server.`, msg)
    if(!msg.member.voice.channel) return await sendmessage(msg, `${msg.author.username} You're not in a voice chat`);
    if(msg.guild.voice.connection)
    {
        for(let i = videoqueue[msg.guild.id].length -1; i >= 0; i--)
        {
            videoqueue[msg.guild.id].splice(i, 1);
        }
        msg.guild.me.voice.channel.leave()
        dispatcher.end();
    }
    if(new Perms(msg).del()) msg.delete(); // House cleaning
}