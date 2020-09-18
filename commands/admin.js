const { err, Perms, UserPerms, sendmessage} = require('./helpers.js');
const discord = require('discord.js');

/**
 * @description Bulk delete message
 * @param {*} msg 
 * @param {String[]} args Expected: (String) 0-99
 */
module.exports.delete = (msg, args) =>
{
    const Bperms = new Perms(msg);
    const Uperms = new UserPerms(msg);
    let bot_perms = Bperms.admin() || Bperms.del();
    let user_perms = Uperms.admin() || Uperms.del();
    
    // User interactivity
    if(!bot_perms) sendmessage(msg, 'Bot missing permissions.');
    if(!user_perms) sendmessage(msg, 'User missing permissions.')

    if(bot_perms && user_perms)
    {
        try
        {
            if(args[0] < 0 || args[0] == undefined) return sendmessage(msg, "Can't delete nothing")
            else
            {
                if(args[0] == 'all')
                {
                    let count = 0;
                    msg.channel.messages.fetch()
                    .catch((e)=>
                    {
                        err(e, msg);
                    })
                    .then(messages=>{
                        messages.forEach(res=>
                        {
                            count++;
                        })
                        msg.channel.bulkDelete(messages)
                        .catch((e)=>
                        {
                            err(e, msg);
                        })
                    })
                    .then((res)=>
                    {
                        if(!res) return;
                        sendmessage(msg, `Deleted ${count} messages.`);
                    })
                }
                else
                {
                    let count = parseInt(args[0]) + 1
                    if(count > 100)
                    {
                        sendmessage(msg, `Can't delete more than 100 messages`);
                    }
                    else
                    {
                        msg.channel.messages.fetch({limit: count})
                        .then(messages=>{
                            msg.channel.bulkDelete(messages)
                            .catch(e=>
                            {
                                err(e, msg);
                            })
                        })
                        sendmessage(msg, `Deleted ${count} messages.`);
                    }
                }
            }
        }catch(e)
        {
            console.log(e);
            err(e, msg);
        }
    }
}