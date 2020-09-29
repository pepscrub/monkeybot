const ytdl = require('ytdl-core');
const discord = require('discord.js');
const errh = require('./helpers.js').err;
const { log, sendmessage, randomnoise, Perms, empty, intwithcommas, truncate, checkurl} = require('./helpers.js');
const urlmetadata = require('url-metadata');
const { DB } = require('../index');
const icy = require('icy'); // Might want to look into this for more music bot capabilities
const scraper = require('soundcloud-scraper');
const { log_commands } = require('../db/logging.js');


let dispatcher = false;

async function sendplaymessage(msg, info, queue)
{
    try
    {
        const metadata = info['videoDetails']
        const author = metadata['author']
        const tnl = metadata['thumbnail']['thumbnails'];
        const tn = tnl[tnl.length-1]['url'];
        const vc = metadata['viewCount'] == null ? 'none' : intwithcommas(metadata['viewCount']);
        const lr = metadata['likes'] == null ? 'none' : intwithcommas(metadata['likes']);
        const dlr = metadata['dislikes'] == null ? 'none' : intwithcommas(metadata['dislikes']);
        const cc = metadata['comments'] == null ? 'none' : intwithcommas(metadata['comments']);
        const url_search = new URL(queue);
        const search = new URLSearchParams(url_search.searchParams).get('t')
        const views =  `👀 ${vc} views`;
        const dashes = scraper.validateURL(queue) ? `▬▬▬▬▬▬▬▬▬▬` : `▬▬▬▬▬▬▬▬▬▬▬`;       // Embeds are fixed based on image size (this is different for youtube / sc)
        const likes = `👍 ${lr} Likes`;
        const dislikes = dlr == 'none' && cc != undefined ? `💬 ${cc} comments` : `👎 ${dlr} Dislikes`;
        const shortdesc = truncate(metadata['shortDescription'], 256) == '' ? 'No description.' : truncate(metadata['shortDescription'], 256);  
        const title = truncate(metadata['title'], 256) == '' ? 'No title???' : truncate(metadata['title'], 256);
    
        const embed = new discord.MessageEmbed()
        .setAuthor(`${author['name']}`, author['avatar'])
        .setColor(process.env.BOT_COLOR)
        .setTitle(title)
        .setURL(queue)
        .addFields(
            {name: views, value: dashes, inline: true},
            {name: likes, value: dislikes, inline: true},
            {name: `Description`, value: shortdesc}
        )
        .setImage(tn)
        .setFooter(`${msg.author.username}#${msg.author.discriminator}`, checkurl(msg.author.avatarURL()))
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
    }catch(e)
    {
        errh(e, msg);
    }
    // Getting all the data for the message is the thing that'll take the longest
    // so we delete the message after the play event occurs
}

async function shiftqueue(msg)
{
    try
    {
        const table = await DB.table('music');
        table.updateOne({"id": msg.guild.id}, {$unset: {"queue.0": 1}});
        table.updateOne({"id": msg.guild.id}, {$pull: {"queue": null}});
    }catch(e)
    {
        errh(e, msg);
    }
}

module.exports.play = async (msg, args) =>
{
    try
    {
        // Play music and shit
        const play = async (connection, msg) =>
        {
            log("attempting to play music")
            // arguments from message content
            try
            {
                // Test to see if our bot can even speak
                const table = await DB.tablequery('music', {"id": msg.guild.id})
                const query = await table.toArray();
                if(query[0]['queue'][0] == null || query[0]['queue'][0][0] == null) this.stop(msg);
                if(query[0]['queue'][0] == null)
                {
                    shiftqueue(msg);
                    log(`Leaving voice chat`, msg)
                    sendmessage(msg, `Leaving the voice chat`)
                    connection.disconnect();
                    return;
                }
                if(empty(query[0]['queue'])) return;

                const queue = query[0]['queue'][0][0];
                const url_search = new URL(queue);                      // Create url object from string
                log(`Getting ${queue}`, msg)

                switch(true)
                {
                    // Youtube
                    case ytdl.validateURL(queue):
                        // Get video info from URL
                        ytdl.getBasicInfo(queue)
                        .then(res=>{sendplaymessage(msg, res, queue)})
                        .catch(e=>console.log(e))

                        const timer = new URLSearchParams(url_search.search);   // Grab the search queries (we can target later)
                        let options = {filter : 'audioonly'};                   // Default options
                        if(timer.get('t'))                                      // See if the timer in url is set to anything
                        {
                            const time = timer.get('t').replace(/[a-zA-Z]/, '');
                            const format = new Date(time * 1000).toISOString().substr(11, 8);
                            options = {filter : 'audio', begin: format};        // audioonly and videoonly do not work with 'begin' for some reason
                        }

                        const stream = ytdl(queue, options); // Play the first video in queue
                        log(`Playing video`, msg)
                        dispatcher = connection.play(stream);
                    break;
                    // Soundcloud
                    case scraper.validateURL(queue):
                        const sc_info =  await scraper.getSongInfo(queue);
                        const sc_formatted =
                        {
                            "videoDetails":
                            {
                                "title": sc_info['title'],
                                "author": {
                                    name: sc_info["author"]["username"],
                                    avatar: sc_info["author"]["avatarURL"]
                                },
                                "thumbnail":
                                {
                                    "thumbnails":[
                                        {
                                            url: sc_info["thumbnail"]
                                        }
                                    ]
                                },
                                "viewCount": sc_info["playCount"],
                                "likes": sc_info["likesCount"],
                                "shortDescription": sc_info['description'],
                                "comments": sc_info['commentsCount']
                            }
                        }
                        sendplaymessage(msg, sc_formatted, queue);
                        const sc_stream = await scraper.download(queue);
                        dispatcher = connection.play(sc_stream);
                    break;
                    default:
                        sendmessage(msg, `Can't play this video for some reason.`);
                    break;
                }

                shiftqueue(msg) // Remove this entry

                // on.('end') depreciated ?
                dispatcher.on('speaking', async (e)=>                           // Event for when the bot is speaking
                {                                                               // speaking is true so if we look for the
                    if(!e)                                                      // instance it's not we can assume we've 'skipped'
                    {
                        const table =await DB.tablequery('music', {"id": msg.guild.id})
                        const query = await table.toArray();
                        const queue = query[0]['queue']

                        if(!empty(queue)) play(connection, msg)
                        else {
                            log(`Leaving voice chat`, msg)
                            sendmessage(msg, `Leaving the voice chat`)
                            connection.disconnect();
                        }
                    }
                })
            }catch(err)
            {
                const table = await DB.table('music');
                const queue = await table.find({"id": msg.guild.id})
                const query = await queue.toArray();

                log(err);
                errh(err, msg);
                shiftqueue(msg);
                if(query.length === 0) 
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

        const table =await DB.table('music')
        const query = await table.find({"id": msg.guild.id})
        const array = await query.toArray();


        const perms = new Perms(msg)

        const user_limit = msg.member.voice.channel.userLimit;
        const users_inchat = msg.member.voice.channel.members.array().length;
        const limit_check = user_limit > 0 ? true : false;

        if(!perms.admin())
        {
            if(limit_check)
            {
                if(users_inchat >= user_limit) return await sendmessage(msg, "Cannot join voice chat. The voice chat is full");
            }
        }


        perms.admin()

        // Actual logic
        if(!perms.speak()) return await sendmessage(msg, `Don't have permissions to speak`);
        if(!args[0] && empty(array)) return await sendmessage(msg, `${msg.author.username} Where's the video?`);                       //  If there's no link (args[0] is our actual first argument)
        if(!msg.member.voice.channel) return await sendmessage(msg, `${msg.author.username} You're not in a voice chat`);              //  Test to see if the user is in a channel or not
        if(!msg.member.guild.me.hasPermission(['SPEAK'])) return sendmessage(msg, 'Monkey can\'t speak! (Missing permissions');        //  Missing permissions

        const regex =  /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
        if(regex.test(args[0]))
        {
            try
            {
                if(empty(array))table.insertOne({"id": msg.guild.id,"queue": [[args[0]]]})    // Insert into DB if server entry doesn't exist
                else table.updateOne({"id":`${msg.guild.id}`},{$push: {"queue": [args[0]]}})  // Update existing entry
                sendmessage(msg, `Added ${args[0]} to the queue`)
                joinvc(msg);    // Wow 1 line 
                log_commands(msg);
            }catch(e)
            {
                errh(e, msg);
            }
        }
        else // Not a valid URL
        {    // If there's stuff in the queue allow `play
            if(!empty(array)) joinvc(msg);    // Wow 1 line 
        }
    }catch(e)
    {
        errh(e, msg);
    }
}

module.exports.disconnect = async (msg) =>
{
    try
    {
        if(!msg.member.voice) return;
        log(`Disconnecting from voice chat.`, msg);
        if(!msg.member.voice.channel) return await sendmessage(msg, `${msg.author.username} You're not in a voice chat`);
        sendmessage(msg, `Leaving the voice chat`)
        msg.guild.me.voice.channel.leave();
        log_commands(msg);
    }catch(e)
    {
        errh(e, msg);
    }
}

module.exports.queue = async (msg) =>
{
    try
    {
        const table =await DB.tablequery('music', {"id": msg.guild.id})
        const query = await table.toArray();
        let music_arr = query[0]['queue'];
        if(music_arr[0] == null) shiftqueue(msg); 
        let guildqueue = music_arr === undefined || empty(music_arr) ? 
        '... \n\n\n\n It\'s as empty as your love life ... \n\n\n\n ...' : 
        "\n🎶 | " + music_arr.toString().replace(/\,/gi, '\n🎶 | ');
        log(`Got queue for this server.`, msg)
    
        const data = empty(music_arr) || music_arr[0][0] == null ? '' : await urlmetadata(music_arr[0][0]);   
        const embed = new discord.MessageEmbed()
        .setAuthor(randomnoise(), msg.client.user.displayAvatarURL())
        .setColor(process.env.BOT_COLOR)
        .setTimestamp()
        .setFooter(`${msg.author.username}#${msg.author.discriminator}`, checkurl(msg.author.avatarURL()));
        if(data)
        {
            const title = `Up next: ${data['title']}`.substr(0, 125)
            embed.setTitle(title);
            embed.setThumbnail(data['image'])
        }
        embed.addField(`Queue ${music_arr.length}`,`\`\`\`fix\n${guildqueue}\`\`\``)
        msg.channel.send(embed);
        log_commands(msg);
    }catch(e)
    {
        errh(e, msg);
    }
}

module.exports.skip = async (msg) =>
{
    try
    {
        if(!msg.member.voice) return;
        log(`Skipping video for this server.`, msg)
        if(!msg.member.voice.channel) return await sendmessage(msg, `${msg.author.username} You're not in a voice chat`);
        sendmessage(msg, `${msg.author.username}#${msg.author.discriminator} skipped the video`)
        if(dispatcher) dispatcher.end();
        log_commands(msg);
    }catch(e)
    {
        errh(e, msg);
    }
}

module.exports.stop = async (msg) =>
{
    try
    {
        const table =await DB.table('music')
        const query = await table.find({"id": msg.guild.id}).toArray();
    
        log(`Stopping music for this server.`, msg)
        if(!msg.member.voice.channel) return await sendmessage(msg, `${msg.author.username} You're not in a voice chat`);
        if(msg.guild.voice == undefined) return;
        if(msg.guild.voice.connection)
        {
            try
            {
                table.updateOne({"id": msg.guild.id}, {$set: {"queue": []}})
                .then(()=>
                {
                    msg.guild.me.voice.channel.leave()
                    if(dispatcher) dispatcher.end();
                })
            }
            catch(e)
            {
                errh(e, msg);
            }
        }
        log_commands(msg);
    }catch(e)
    {
        errh(e, msg);
    }
}