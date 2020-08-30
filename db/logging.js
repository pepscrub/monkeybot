const { DB } = require('../index');
const { log } = require('../commands/helpers.js')

function empty(obj)
{
    for(const key in obj)
    {
        if(obj.hasOwnProperty(key)) return false;
    }
    return true;
}


module.exports.log_commands = async (msg) =>
{
    const user = msg.author.id;
    const date = Date.now();
    const s_and_u = await DB.tablequery('commands', {"server.id":`${msg.guild.id}`, "users": {$elemMatch: {"0.id": user}}});
    const s_no_u  = await DB.tablequery('commands', {"server.id": msg.guild.id});
    const table = await DB.table('commands')

    if(empty(await s_and_u.toArray()) && empty(await s_no_u.toArray()))
    {
        log("Adding server to DB", msg)
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
    }
    else if(empty(await s_and_u.toArray()))
    {
        log("Adding user to command usage", msg)
        await table.updateOne(
            {"server.id":`${msg.guild.id}`},
            {$push: {"users":
                [{
                    "id": `${msg.author.id}`,
                    "name": `${msg.author.username}#${msg.author.discriminator}`,
                    "pfp": msg.author.avatarURL(),
                    "commandusage": {
                        entry:[msg.content, date]
                    }
                }]
            }}
        )
    }
    else if(!(empty(await s_and_u.toArray()) && empty(await s_no_u.toArray())))
    {
        log(`Updating ${msg.author.username}'s command usage`, msg)
        table.updateOne(
            {"server.id":`${msg.guild.id}`,
            "users": {$elemMatch: {"0.id": user}}},
            {$push: {
                "users.$.0.commandusage":[msg.content, date]
            }}
        )
    }
}