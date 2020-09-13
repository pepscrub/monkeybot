// Imports
const errh = require('./helpers.js').err;
const { log, randomnoise, Perms, truncate, empty, sendmessage} = require('./helpers.js')
const { DB } = require('../index.js');

async function updateVote(msg, bool = false)
{
    const table = await DB.table('vote');
    const docs = await table.find({"s_id": msg.guild.id})
    const arr = await docs.toArray();
    const update = async () =>
    {
        await table.update(
            {"s_id": msg.guild.id},
            {"$set":{"vote": arr[0]['vote'], "voting_enabled": bool}},
        )
    }

    if(!docs) update();

    await table.findOneAndUpdate(
        {"s_id": msg.guild.id},
        {"$set":{"vote": arr[0]['vote'], "voting_enabled": bool}},
    );
}


module.exports.toggleVote = async (msg, args) =>
{
    log("Toggling voting", msg);
    const table = await DB.table('vote');
    const index = await table.find({"s_id": msg.guild.id});
    const vote = await index.toArray();
    if(index == null || empty(vote) || vote[0] == undefined)
    {
        await table.insertOne({"s_id": msg.guild.id, "vote": false, "voting_enabled": false})
        return this.toggleVote(msg)
    }
    if(args[0] == 'enable' || args[0] == 'on') updateVote(msg, true)
    else if(args[0] == 'disable' || args[0] == 'off') updateVote(msg, false)
    else
    {
        console.log(vote[0]['voting_enabled'])
        vote[0]['voting_enabled'] ? updateVote(msg, false) : updateVote(msg, true);
    }
    let text = vote[0]['voting_enabled'] ? 'Switching voting Off' : 'Switching voting On';
    sendmessage(msg, text);
} 