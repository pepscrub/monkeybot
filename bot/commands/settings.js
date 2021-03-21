// Imports
const errh = require('../../global/helpers').err;
const { log } = require('../../global/helpers');
const { randomnoise, Perms, truncate, empty, sendmessage} = require('../../global/helpers')
const { DB } = require('../index.js');

async function updateVote(msg, bool = false)
{
    try
    {
        const table = await DB.table('vote');
        const docs = await table.find({"s_id": msg.guild.id})
        const arr = await docs.toArray();
        const update = async () =>
        {
            await table.update(
                {"s_id": msg.guild.id},
                {"$set":{"vote": arr[0]['vote'], "voting_enabled": bool, "video": arr[0]['video']}},
            )
        }
    
        if(!docs) update();
    
        await table.findOneAndUpdate(
            {"s_id": msg.guild.id},
            {"$set":{"vote": arr[0]['vote'], "voting_enabled": bool, "video": arr[0]['video']}},
        );
    }catch(e)
    {
        errh(e, msg);
    }
}


module.exports.toggleVote = async (msg, args) =>
{
    try
    {
        log("Toggling voting", msg);
        const table = await DB.table('vote');
        const index = await table.find({"s_id": msg.guild.id});
        const vote = await index.toArray();
        if(index == null || empty(vote) || vote[0] == undefined)
        {
            await table.insertOne({"s_id": msg.guild.id, "vote": false, "voting_enabled": false, "video": false})
            return this.toggleVote(msg)
        }
        if(args != undefined)
        {
            if(args[0] == 'enable' || args[0] == 'on') updateVote(msg, true)
            else if(args[0] == 'disable' || args[0] == 'off') updateVote(msg, false)
            else vote[0]['voting_enabled'] ? updateVote(msg, false) : updateVote(msg, true);
        }
        let text = vote[0]['voting_enabled'] ? 'Switching voting Off' : 'Switching voting On';
        sendmessage(msg, text);
    }catch(e)
    {
        errh(e, msg);
    }
} 

async function updateVideo(msg, bool = false)
{
    try
    {
        const table = await DB.table('vote');
        const docs = await table.find({"s_id": msg.guild.id})
        const arr = await docs.toArray();
        const update = async () =>
        {
            await table.update(
                {"s_id": msg.guild.id},
                {"$set":{"vote": arr[0]['vote'], "voting_enabled": arr[0]['voting_enabled'], "video": bool}},
            )
        }
    
        if(!docs) update();
    
        await table.findOneAndUpdate(
            {"s_id": msg.guild.id},
            {"$set":{"vote": arr[0]['vote'], "voting_enabled": arr[0]['voting_enabled'], "video": bool}},
        );
    }catch(e)
    {
        errh(e, msg);
    }
}

module.exports.toggleVideo = async (msg, args) =>
{
    try
    {
        log("Toggling video", msg);
        const table = await DB.table('vote');
        const index = await table.find({"s_id": msg.guild.id});
        const vote = await index.toArray();
        if(index == null || empty(vote) || vote[0] == undefined)
        {
            await table.insertOne({"s_id": msg.guild.id, "vote": false, "voting_enabled": false, "video": false})
            return this.toggleVote(msg)
        }
        if(args != undefined)
        {
            if(args[0] == 'enable' || args[0] == 'on') updateVideo(msg, true)
            else if(args[0] == 'disable' || args[0] == 'off') updateVideo(msg, false)
            else vote[0]['video'] ? updateVideo(msg, false) : updateVideo(msg, true);
        }
        let text = vote[0]['video'] ? 'Switching video Off' : 'Switching video On';
        sendmessage(msg, text);
    }catch(e)
    {
        errh(e, msg);
    }
} 