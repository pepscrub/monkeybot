const { DB } = require('../index');
const { log, empty } = require('../commands/helpers.js')


module.exports.log_commands = async (msg, ...users) =>
{
    const user = msg.author.id;
    const date = Date.now();
    const s_and_u = await DB.tablequery('commands', {"server.id":`${msg.guild.id}`, "users": {$elemMatch: {"0.id": user}}});
    const s_no_u  = await DB.tablequery('commands', {"server.id": msg.guild.id});
    const table = await DB.table('commands')

    if(msg.guild.memberCount < 5) return;

    if(empty(await s_and_u.toArray()) && empty(await s_no_u.toArray()))
    {
        log("Adding server to DB", msg)
        if(empty(users))
        {
            await DB.insertinto('commands', 
            {
                "server":{
                    "id": msg.guild.id,
                    "name": msg.guild.name,
                    "icon": msg.guild.iconURL(),
                    "banner": msg.guild.bannerURL(),
                    "dbanner": msg.guild.discoverySplashURL() // Got to decided if we want to use discovery banner or banner as the main banner
                },
                "users":
                [
                    [{
                        "id": `${msg.author.id}`,
                        "name": `${msg.author.username}#${msg.author.discriminator}`,
                        "pfp": msg.author.avatarURL(),
                        "commandusage": [[msg.content, date]]
                    }]
                ]
            })
        }else
        {
            users.forEach(async user_vote=>
            {
                await DB.insertinto('commands', 
                {
                    "server":{
                        "id": msg.guild.id,
                        "name": msg.guild.name,
                        "icon": msg.guild.iconURL(),
                        "banner": msg.guild.bannerURL(),
                        "dbanner": msg.guild.discoverySplashURL() // Got to decided if we want to use discovery banner or banner as the main banner
                    },
                    "users":
                    [
                        [{
                            "id": `${user_vote.id}`,
                            "name": `${user_vote.username}#${user_vote.discriminator}`,
                            "pfp": user_vote.avatarURL(),
                            "commandusage": [["vote", date]]
                        }]
                    ]
                })
            })
        }
    }
    else if(empty(await s_and_u.toArray()))
    {
        if(empty(users))
        {
            log(`Adding ${msg.author.username} to command usage`, msg)
            await table.updateOne(
                {"server.id":`${msg.guild.id}`},
                {$push: {"users":
                    [{
                        "id": `${msg.author.id}`,
                        "name": `${msg.author.username}#${msg.author.discriminator}`,
                        "pfp": msg.author.avatarURL(),
                        "commandusage": [msg.content, date]
                    }]
                }}
            )
        }
        else
        {
            users.forEach(async user_vote=>
            {
                log(`Adding ${user_vote.username} to command usage`, msg)
                await table.updateOne(
                    {"server.id":`${msg.guild.id}`},
                    {$push: {"users":
                        [{
                            "id": `${user_vote.id}`,
                            "name": `${user_vote.username}#${user_vote.discriminator}`,
                            "pfp": e.avatarURL(),
                            "commandusage": ["voted", date]
                        }]
                    }}
                )  
            })
        }
    }
    else if(!(empty(await s_and_u.toArray()) && empty(await s_no_u.toArray())))
    {
        if(empty(users))
        {
            log(`Updating ${msg.author.username}'s command usage`, msg)
            table.updateOne(
                {"server.id":`${msg.guild.id}`,
                "users": {$elemMatch: {"0.id": user}}},
                {$push: {
                    "users.$.0.commandusage":[msg.content, date]
                }}
            )
        }else
        {
            users.forEach(async user_vote=>
            {
                log(`Updating ${user_vote.username}'s command usage`, msg)
                table.updateOne(
                    {"server.id":`${msg.guild.id}`,
                    "users": {$elemMatch: {"0.id": user_vote.id}}},
                    {$push: {
                        "users.$.0.commandusage":["vote", date]
                    }}
                )
            })
        }
    }
}