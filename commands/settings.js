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
    sendmessage(msg, `Switching voting ${args[0] == 'enable' || args[0] == 'on' ? 'On' : 'Off'}`);
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
        vote[0]['voting_enabled'] ? updateVote(msg, false) : updateVote(msg, true);
    }
} 