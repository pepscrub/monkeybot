const { DB } = require('../index');
const mongo = require('mongodb');
const errh = require('../commands/helpers.js').err;
const { log, empty } = require('../commands/helpers.js')

module.exports.ratelimit = async (msg) =>
{
    log(`Applying limit to ${msg.author.username}`, msg);
    try
    {
        const user = msg.author.id;
        const coll = await DB.tablequery("settings");
        const doc = await coll.toArray();

        const limit_ms = doc[0]["ratelimit"];

        const table_raw = await DB.tablequery('ratelimit', {"user_id": user});
        const table_arr = await table_raw.toArray();
        const table = await DB.table('ratelimit');


        if(table_arr[0]['msg_disabled']) return;

        // No user exists in database
        if(empty(table_arr))
        {
            log(`Adding ${msg.author.username} to Rate Limit`, msg);
            await DB.insertinto('ratelimit', {
                "user_id": user,
                "msg_disabled": true
            })
        }else
        {
            log(`Limiting ${msg.author.username}`, msg);
            table.updateOne({"user_id": user},{$set: {"msg_disabled": true}})
        }
        setTimeout(()=>
        {
            log(`Re-enabling ${msg.author.username}`, msg);

            table.updateOne({"user_id": user},{$set: {"msg_disabled": false}})
        },limit_ms);

    }catch(e)
    {
        errh(e, msg);
    }
}